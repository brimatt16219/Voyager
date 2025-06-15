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

// /api/stores?lat=...&lng=...&chains=target,walmart&radius=16093
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
      console.log(`Fetching places for "${keyword}" within ${radiusMeters}m of (${lat},${lng})`);
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

    console.log(`Returning ${unique.length} unique stores`);
    return res.json(unique);

  } catch (err) {
    console.error('Error in /api/stores:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`✅ Voyager backend listening on http://localhost:${PORT}`);
});
