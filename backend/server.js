import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'bucharestApp', 
  password: 'parola',
  port: 5432,
});

app.post('/import-places', async (req, res) => {
  const { places } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  for (const place of places) {
    const existing = await pool.query('SELECT 1 FROM places WHERE place_id = $1', [place.place_id]);
    if (existing.rowCount > 0) continue;

    const photoRef = place.photos?.[0]?.photo_reference;
    const photoUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`
      : null;

      await pool.query(
        `INSERT INTO places (place_id, name, address, latitude, longitude, rating, types, photo_url, user_ratings_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          place.place_id,
          place.name,
          place.vicinity,
          place.geometry.location.lat,
          place.geometry.location.lng,
          place.rating,
          place.types,
          photoUrl,
          place.user_ratings_total || 0,
        ]
      );
      

    console.log(`✅ Added: ${place.name}`);
  }

  res.json({ success: true });
});

app.get('/places', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM places');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

app.listen(3000, () => console.log('🟢 Server running at http://localhost:3000'));
