const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

console.log('🔄 Starting Voyager backend...');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get('/', (req, res) => {
  res.send('Voyager backend running!');
});

// /api/stores
app.get('/api/stores', async (req, res) => {
  const { lat, lng, chains, radius } = req.query;

  // Validate required parameters
  if (!lat || !lng || !chains || !radius) {
    console.warn('Bad request missing params:', { lat, lng, chains, radius });
    return res.status(400).json({ error: 'Missing required parameters: lat, lng, chains, radius' });
  }

  // Parse comma-separated chains into array
  const keywords = String(chains)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Parse and validate radius (in meters)
  const radiusMeters = parseInt(radius, 10);
  if (isNaN(radiusMeters) || radiusMeters <= 0) {
    console.warn('Invalid radius:', radius);
    return res.status(400).json({ error: 'Invalid radius parameter' });
  }

  try {
    let results = [];

    // Fetch nearby places for each keyword, filtering only exact brand matches
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const { data } = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lng}`,
            radius: radiusMeters,
            // use keyword to get relevant results
            keyword,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (Array.isArray(data.results)) {
        // Only include main store entries (e.g., "Target", not "Target Optical")
        const filtered = data.results.filter(place =>
          place.name.toLowerCase() === keywordLower
        );
        const mapped = filtered.map(place => ({
          name: place.name,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          place_id: place.place_id,
          address: place.vicinity,
        }));
        results = results.concat(mapped);
      }
    }

    // Deduplicate by place_id
    const unique = [];
    const seen = new Set();
    for (const store of results) {
      if (!seen.has(store.place_id)) {
        seen.add(store.place_id);
        unique.push(store);
      }
    }

    // Limit to at most 10 stores
    const limited = unique.slice(0, 10);

    return res.json(limited);

  } catch (err) {
    console.error('Error in /api/stores:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// /api/optimize-route
app.post('/api/optimize-route', async (req, res) => {
  console.log('[/api/optimize-route] request body:', JSON.stringify(req.body));
  const { start, stores } = req.body;

  if (
    !start ||
    typeof start.lat !== 'number' ||
    typeof start.lng !== 'number' ||
    !Array.isArray(stores)
  ) {
    console.warn('[/api/optimize-route] bad request parameters');
    return res.status(400).json({ error: 'Missing or invalid start/stores in request body' });
  }

  try {
    const startTime = Date.now();
    const allLocations = [start, ...stores];
    
    // Step 1: Get all pairwise distances in one API call
    console.log('[/api/optimize-route] fetching distance matrix for', allLocations.length, 'locations');
    
    const origins = allLocations.map(loc => `${loc.lat},${loc.lng}`).join('|');
    const destinations = origins; // Same locations for origins and destinations
    
    const distanceMatrixResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins,
          destinations,
          departure_time: Math.floor(startTime / 1000),
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    // Step 2: Build distance matrix
    const distanceMatrix = [];
    const durationMatrix = [];
    
    for (let i = 0; i < allLocations.length; i++) {
      distanceMatrix[i] = [];
      durationMatrix[i] = [];
      for (let j = 0; j < allLocations.length; j++) {
        const element = distanceMatrixResponse.data.rows[i].elements[j];
        if (element.status === 'OK') {
          distanceMatrix[i][j] = element.distance.value; // meters
          durationMatrix[i][j] = element.duration.value; // seconds
        } else {
          distanceMatrix[i][j] = Infinity;
          durationMatrix[i][j] = Infinity;
        }
      }
    }

    // Step 3: Optimize route using 2-opt algorithm (improved nearest neighbor)
    const optimizedRoute = optimizeRouteWith2Opt(durationMatrix, stores.length);
    
    // Step 4: Build sequence with timing
    const sequence = [];
    let currentTime = startTime;
    let currentIndex = 0; // Start location index
    
    for (let i = 1; i < optimizedRoute.length; i++) {
      const storeIndex = optimizedRoute[i] - 1; // -1 because optimizedRoute[0] is start location
      const store = stores[storeIndex];
      const travelMs = durationMatrix[currentIndex][optimizedRoute[i]] * 1000;
      const arrival = currentTime + travelMs;
      
      sequence.push({
        place_id: store.place_id,
        arrival_time: new Date(arrival).toISOString(),
        coords: { lat: store.lat, lng: store.lng },
      });
      
      currentTime = arrival;
      currentIndex = optimizedRoute[i];
    }

    // Step 5: Build directions with optimized waypoints
    const origin = `${start.lat},${start.lng}`;
    const destinationStop = sequence[sequence.length - 1];
    const destination = `${destinationStop.coords.lat},${destinationStop.coords.lng}`;
    const waypointCoords = sequence
      .slice(0, -1)
      .map(p => `${p.coords.lat},${p.coords.lng}`)
      .join('|');

    const dirResp = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination,
          ...(waypointCoords && { waypoints: waypointCoords }),
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const totalTime = Date.now() - startTime;
    console.log(`[/api/optimize-route] optimized ${sequence.length} stops in ${totalTime}ms`);
    
    return res.json({ 
      order: sequence, 
      directions: dirResp.data,
      optimization_stats: {
        total_distance_meters: calculateTotalDistance(distanceMatrix, optimizedRoute),
        total_duration_seconds: calculateTotalDuration(durationMatrix, optimizedRoute),
        optimization_time_ms: totalTime
      }
    });
  } catch (err) {
    console.error('[/api/optimize-route] ERROR:', err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5),
    });
  }
});

// Helper function: 2-opt algorithm for route optimization
function optimizeRouteWith2Opt(distanceMatrix, numStores) {
  // Start with nearest neighbor solution
  let route = nearestNeighbor(distanceMatrix, numStores);
  let improved = true;
  
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length; j++) {
        if (j - i === 1) continue; // Skip adjacent edges
        
        const newRoute = [...route];
        // Reverse the segment between i and j
        for (let k = i; k <= j; k++) {
          newRoute[k] = route[j - (k - i)];
        }
        
        const oldDistance = calculateRouteDistance(distanceMatrix, route);
        const newDistance = calculateRouteDistance(distanceMatrix, newRoute);
        
        if (newDistance < oldDistance) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }
  
  return route;
}

// Helper function: Nearest neighbor algorithm
function nearestNeighbor(distanceMatrix, numStores) {
  const route = [0]; // Start at index 0 (start location)
  const unvisited = new Set();
  
  for (let i = 1; i <= numStores; i++) {
    unvisited.add(i);
  }
  
  let current = 0;
  while (unvisited.size > 0) {
    let nearest = -1;
    let minDistance = Infinity;
    
    for (const next of unvisited) {
      if (distanceMatrix[current][next] < minDistance) {
        minDistance = distanceMatrix[current][next];
        nearest = next;
      }
    }
    
    route.push(nearest);
    unvisited.delete(nearest);
    current = nearest;
  }
  
  return route;
}

// Helper function: Calculate total distance of a route
function calculateRouteDistance(distanceMatrix, route) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += distanceMatrix[route[i]][route[i + 1]];
  }
  return total;
}

// Helper function: Calculate total duration of a route
function calculateTotalDuration(durationMatrix, route) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += durationMatrix[route[i]][route[i + 1]];
  }
  return total;
}

// Helper function: Calculate total distance for response
function calculateTotalDistance(distanceMatrix, route) {
  return calculateRouteDistance(distanceMatrix, route);
}

// Start listening
app.listen(PORT, () => {
  console.log(`✅ Voyager backend listening on https://localhost:${PORT}`);
});
