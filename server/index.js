// server/index.js

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

  const results = [];

  try {
    // Fetch nearby places for each keyword
    for (const keyword of keywords) {
    //   console.log(`Fetching places for "${keyword}" within ${radiusMeters}m of (${lat},${lng})`);
      const { data } = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lng}`,
            radius: radiusMeters,
            keyword,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (Array.isArray(data.results)) {
        data.results.forEach(place => {
          results.push({
            name: place.name,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            place_id: place.place_id,
            address: place.vicinity,
          });
        });
      }
    }

    // Deduplicate by place_id
    const unique = [];
    const seen = new Set();
    for (const s of results) {
      if (!seen.has(s.place_id)) {
        seen.add(s.place_id);
        unique.push(s);
      }
    }

    // console.log(`Returning ${unique.length} unique stores`);
    return res.json(unique);

  } catch (err) {
    console.error('Error in /api/stores:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// /api/optimize-route
// server/index.js (inside your file, after /api/stores)

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
    let currentTime = Date.now();
    let currentLoc = { lat: start.lat, lng: start.lng };
    const sequence = [];
    const unvisited = [...stores];

    while (unvisited.length) {
      // get all travel times
      const etas = await Promise.all(
        unvisited.map(s => axios.get(
          'https://maps.googleapis.com/maps/api/distancematrix/json',
          {
            params: {
              origins: `${currentLoc.lat},${currentLoc.lng}`,
              destinations: `${s.lat},${s.lng}`,
              departure_time: Math.floor(currentTime / 1000),
              key: process.env.GOOGLE_MAPS_API_KEY,
            }
          }
        ).then(r => ({
          store: s,
          travelMs: r.data.rows[0].elements[0].duration.value * 1000
        })))
      );

      // pick shortest travel
      etas.sort((a, b) => a.travelMs - b.travelMs);
      const { store, travelMs } = etas[0];
      const arrival = currentTime + travelMs;

      sequence.push({
        place_id: store.place_id,
        arrival_time: new Date(arrival).toISOString(),
        coords: { lat: store.lat, lng: store.lng }
      });

      currentTime = arrival;
      currentLoc = { lat: store.lat, lng: store.lng };
      unvisited.splice(unvisited.findIndex(u => u.place_id === store.place_id), 1);
    }

    // build directions
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

    console.log('[/api/optimize-route] sending back', sequence.length, 'stops');
    return res.json({ order: sequence, directions: dirResp.data });
  } catch (err) {
    console.error('[/api/optimize-route] ERROR:', err);
    // return error to client for debugging
    return res.status(500).json({
      error: err.message,
      stack: err.stack?.split('\n').slice(0,5)  // show first few lines
    });
  }
});




// Start listening
app.listen(PORT, () => {
  console.log(`✅ Voyager backend listening on http://localhost:${PORT}`);
});

