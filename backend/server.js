import express from "express";
import cors from "cors";
import { Pool } from "pg";
import "dotenv/config";
import { fetchIaBiletEvents } from "./scrapers/iaBilet.js";
import cron from "node-cron";
import fetch from "node-fetch";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "OK") {
    const loc = data.results[0].geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };
  }

  return null;
}

async function importEvents() {
  console.log("📥 Încep importul de evenimente (IaBilet)...");

  const iaBiletEvents = await fetchIaBiletEvents();
  const source = "iabilet";

  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);
  from.setDate(from.getDate() - 1);
  to.setDate(to.getDate() + 4);

  // Șterge evenimentele în afara intervalului
  await pool.query(`DELETE FROM events WHERE date < $1 OR date > $2`, [
    from.toISOString(),
    to.toISOString(),
  ]);

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

async function fetchAndSaveWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing OPENWEATHER_API_KEY in .env");
    throw new Error("Missing OpenWeather API key");
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=Bucharest&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || data.cod !== "200" || !Array.isArray(data.list)) {
    console.error("❌ Invalid response from OpenWeather:", data);
    throw new Error(
      `OpenWeather API error: ${data?.message || "Unknown error"}`
    );
  }

  for (const entry of data.list) {
    const dateTime = new Date(entry.dt_txt);
    const date = dateTime.toISOString().split("T")[0];
    const time = entry.dt_txt.split(" ")[1];
    const temp = entry.main.temp;
    const desc = entry.weather[0].description;
    const icon = entry.weather[0].icon;

    await pool.query(
      `INSERT INTO weather_forecast (date, time, temperature, description, icon)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (date, time) DO NOTHING`,
      [date, time, temp, desc, icon]
    );
  }

  await pool.query(`
    DELETE FROM weather_forecast
    WHERE date <> CURRENT_DATE
  `);

  console.log("✅ Weather forecast saved successfully.");
}

cron.schedule("0 6 * * *", async () => {
  console.log("⏰ Daily event import triggered...");
  await importEvents();
});

cron.schedule("0 6 * * *", async () => {
  console.log("⛅ Fetching daily forecast...");
  await fetchAndSaveWeather();
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
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  for (const place of places) {
    const existing = await pool.query(
      "SELECT 1 FROM places WHERE place_id = $1",
      [place.place_id]
    );
    if (existing.rowCount > 0) continue;

    const photoRef = place.photos?.[0]?.photo_reference;
    const photoUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`
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

app.get("/places", async (req, res) => {
  const { tag, category, limit } = req.query;

  try {
    let result;

    if (tag) {
      result = await pool.query(
        `SELECT * FROM places WHERE $1 = ANY(types) ORDER BY user_ratings_total DESC ${
          limit ? "LIMIT $2" : ""
        }`,
        limit ? [tag, Number(limit)] : [tag]
      );
    } else if (category === "Popular") {
      result = await pool.query(
        `SELECT * FROM places WHERE user_ratings_total > 0 ORDER BY user_ratings_total DESC ${
          limit ? "LIMIT $1" : ""
        }`,
        limit ? [Number(limit)] : []
      );
    } else if (category === "Recommended") {
      result = await pool.query(
        `SELECT * FROM places WHERE user_ratings_total > 100 AND rating >= 4 ORDER BY rating DESC ${
          limit ? "LIMIT $1" : ""
        }`,
        limit ? [Number(limit)] : []
      );
    } else {
      result = await pool.query(
        `SELECT * FROM places ${limit ? "LIMIT $1" : ""}`,
        limit ? [Number(limit)] : []
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM events ORDER BY date ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/weather-forecast", async (req, res) => {
  try {
    await fetchAndSaveWeather();
    res.json({
      success: true,
      message: "Weather forecast imported successfully.",
    });
  } catch (err) {
    console.error("❌ Weather import failed:", err);
    res.status(500).json({ error: "Failed to import weather forecast." });
  }
});

app.get("/weather", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM weather_forecast
      WHERE date >= CURRENT_DATE
      ORDER BY date ASC, time ASC
    `);

    // Grupăm datele pe zile
    const grouped = result.rows.reduce((acc, row) => {
      const key = row.date.toISOString().split("T")[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    console.error("❌ Error fetching weather forecast:", err);
    res.status(500).json({ error: "Failed to load forecast" });
  }
});

app.get("/current-weather", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM weather_forecast
      WHERE date >= CURRENT_DATE
      ORDER BY date, time
      LIMIT 40
    `);

    const now = new Date();
    let closest = null;
    let minDiff = Infinity;

    for (const row of result.rows) {
      // Combinăm manual date + time într-un Date complet
      const [hour, minute, second] = row.time.split(":").map(Number);
      const dateObj = new Date(row.date);
      dateObj.setHours(hour, minute, second || 0, 0);

      const diff = Math.abs(now.getTime() - dateObj.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = row;
      }
    }

    if (!closest) {
      return res.status(404).json({ error: "No forecast found" });
    }

    res.json({
      temp: Number(closest.temperature),
      description: closest.description,
      icon: `https://openweathermap.org/img/wn/${closest.icon}@2x.png`,
    });
  } catch (err) {
    console.error("❌ Error in /current-weather:", err);
    res.status(500).json({ error: "Failed to get current weather" });
  }
});

app.get("/update-data", async (req, res) => {
  try {
    console.log("🔄 Updating events and weather...");

    await Promise.all([importEvents(), fetchAndSaveWeather()]);

    res.json({ success: true, message: "Data updated successfully." });
  } catch (err) {
    console.error("❌ Error updating data:", err);
    res.status(500).json({ error: "Failed to update data." });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    // Verifică dacă userul sau emailul există deja
    const existing = await pool.query(
      'SELECT 1 FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rowCount > 0)
      return res.status(409).json({ error: 'Username or email already in use' });

    // Hash parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserează utilizatorul
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role`,
      [username, email, hashedPassword, role || 'tourist']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error during registration:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password });

  if (!email || !password)
    return res.status(400).json({ error: 'Missing credentials' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.listen(3000, () =>
  console.log("🟢 Server running at http://localhost:3000")
);
