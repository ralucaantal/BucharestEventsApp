import express from "express";
import cors from "cors";
import { Pool } from "pg";
import "dotenv/config";
import { fetchIaBiletEvents } from "./scrapers/iaBilet.js";
import cron from "node-cron";
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bucharestApp",
  password: "parola",
  port: 5432,
});

async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!address || !apiKey) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'OK') {
    const loc = data.results[0].geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };
  }

  return null;
}

async function importEvents() {
  console.log('📥 Încep importul de evenimente (IaBilet)...');

  const iaBiletEvents = await fetchIaBiletEvents();
  const source = 'iabilet';

  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);
  from.setDate(from.getDate() - 1);
  to.setDate(to.getDate() + 3);

  // Șterge evenimentele în afara intervalului
  await pool.query(
    `DELETE FROM events WHERE date < $1 OR date > $2`,
    [from.toISOString(), to.toISOString()]
  );

  let inserted = 0;

  for (const ev of iaBiletEvents) {
    if (!ev.date) continue;

    const eventDate = new Date(ev.date);
    if (eventDate < from || eventDate > to) continue;

    // 🧭 Geocode only if lat/lng is missing
    let latitude = ev.latitude;
    let longitude = ev.longitude;

    if (!latitude || !longitude) {
      const coords = await geocodeAddress(ev.location);
      if (!coords) continue;
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    await pool.query(
      `INSERT INTO events (title, date, location, url, image_url, latitude, longitude, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (title, date) DO NOTHING`,
      [
        ev.title,
        ev.date,
        ev.location,
        ev.url,
        ev.image_url,
        latitude,
        longitude,
        source,
      ]
    );

    inserted++;
    console.log(`✅ Adăugat: ${ev.title}`);
  }

  console.log(`📦 Total evenimente salvate: ${inserted}`);
}

cron.schedule("0 6 * * *", async () => {
  console.log("⏰ Daily event import triggered...");
  await importEvents();
});

app.get("/import-events", async (req, res) => {
  try {
    await importEvents();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error importing events:", err);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.post("/import-places", async (req, res) => {
  const { places } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  for (const place of places) {
    const existing = await pool.query(
      "SELECT 1 FROM places WHERE place_id = $1",
      [place.place_id],
    );
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
      ],
    );

    console.log(`✅ Added: ${place.name}`);
  }

  res.json({ success: true });
});

app.get("/places", async (req, res) => {
  const { tag, category, limit } = req.query;

  try {
    let result;

    if (tag) {
      result = await pool.query(
        `SELECT * FROM places WHERE $1 = ANY(types) ORDER BY user_ratings_total DESC ${limit ? "LIMIT $2" : ""}`,
        limit ? [tag, Number(limit)] : [tag],
      );
    } else if (category === "Popular") {
      result = await pool.query(
        `SELECT * FROM places WHERE user_ratings_total > 0 ORDER BY user_ratings_total DESC ${limit ? "LIMIT $1" : ""}`,
        limit ? [Number(limit)] : [],
      );
    } else if (category === "Recommended") {
      result = await pool.query(
        `SELECT * FROM places WHERE user_ratings_total > 100 AND rating >= 4 ORDER BY rating DESC ${limit ? "LIMIT $1" : ""}`,
        limit ? [Number(limit)] : [],
      );
    } else {
      result = await pool.query(
        `SELECT * FROM places ${limit ? "LIMIT $1" : ""}`,
        limit ? [Number(limit)] : [],
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

app.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events ORDER BY date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(3000, () =>
  console.log("🟢 Server running at http://localhost:3000"),
);
