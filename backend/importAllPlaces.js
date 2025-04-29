import fetch from 'node-fetch';
import 'dotenv/config';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BACKEND_URL = 'http://localhost:3000/import-places';
const location = '44.4268,26.1025'; // București
const radius = 5000;

const types = [
  'tourist_attraction', 'museum', 'restaurant', 'park',
  'movie_theater', 'cafe', 'bar', 'shopping_mall',
  'store', 'supermarket', 'art_gallery', 'library',
  'spa', 'gym', 'beauty_salon'
];

async function fetchAndImport(type) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.results?.length) {
    await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ places: data.results }),
    });
    console.log(`✅ Imported ${type}`);
  } else {
    console.log(`⚠️ No results for ${type}`);
  }
}

(async () => {
  for (const type of types) {
    await fetchAndImport(type);
  }
})();