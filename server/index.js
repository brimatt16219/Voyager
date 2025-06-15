const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get('/', (req, res) => {
  res.send('Voyager backend running!');
});

// /api/stores endpoint
app.get('/api/stores', async (req, res) => {
  const { lat, lng, chains } = req.query;

  if (!lat || !lng || !chains) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Parse comma-separated chains into an array of keywords
  const keywords = typeof chains === 'string'
    ? chains.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  if (keywords.length === 0) {
    return res.status(400).json({ error: 'No valid chain keywords provided' });
  }

  const results = [];

  try {
    for (const keyword of keywords) {
      const { data } = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lng}`,
            radius: 15000,
            keyword,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (data.results) {
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

    return res.json(results);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
