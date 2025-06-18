import express from "express";
import cors from "cors";
import { Pool } from "pg";
import "dotenv/config";
import { fetchIaBiletEvents } from "./scrapers/iaBilet.js";
import cron from "node-cron";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_SECRET, // sau pune cheia direct dacă testezi local
});

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

  await pool.query(`DELETE FROM events WHERE date < $1 OR date > $2`, [
    from.toISOString(),
    to.toISOString(),
  ]);

  let inserted = 0;

  for (const ev of iaBiletEvents) {
    if (!ev.date) continue;

    const eventDate = new Date(ev.date);
    if (eventDate < from || eventDate > to) continue;

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

app.get("/init-admin", async (req, res) => {
  try {
    const hashed = await bcrypt.hash("admin", 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ('admin', 'admin@admin.com', $1, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [hashed]
    );

    if (result.rowCount > 0) {
      console.log("✅ Admin user inserted");
      res.json({ success: true, message: "Admin user created." });
    } else {
      res.json({ success: false, message: "Admin already exists." });
    }
  } catch (err) {
    console.error("❌ Error inserting admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
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

    // 🔧 DEFINEȘTE openingHours AICI!
    const openingHours = place.opening_hours
      ? JSON.stringify(place.opening_hours)
      : null;

    await pool.query(
      `INSERT INTO places (
      place_id, name, address, latitude, longitude, rating, types,
      photo_url, user_ratings_total, price_level, business_status,
      opening_hours, google_maps_url
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (place_id) DO NOTHING`,
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
        place.price_level || null,
        place.business_status || null,
        openingHours,
        `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      ]
    );

    console.log(`✅ Added: ${place.name}`);
  }

  res.json({ success: true });
});

app.get("/places", async (req, res) => {
  const { tag, category, limit, userId } = req.query;

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
    } else if (category === "Favorites" && userId) {
      result = await pool.query(
        `SELECT p.* FROM places p
         JOIN favorites f ON p.place_id = f.place_id
         WHERE f.user_id = $1
         ORDER BY p.user_ratings_total DESC ${limit ? "LIMIT $2" : ""}`,
        limit ? [userId, Number(limit)] : [userId]
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

app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const existing = await pool.query(
      "SELECT 1 FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existing.rowCount > 0)
      return res
        .status(409)
        .json({ error: "Username or email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role`,
      [username, email, hashedPassword, role || "tourist"]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", { email, password });

  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rowCount === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
    console.error("❌ Error during login:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/favorites", async (req, res) => {
  const { userId, placeId } = req.body;
  console.log("Adding favorite:", { userId, placeId });

  try {
    await pool.query(
      `INSERT INTO favorites (user_id, place_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, placeId]
    );
    console.log(`✅ Added favorite for user ${userId} and place ${placeId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

app.delete("/favorites", async (req, res) => {
  const { userId, placeId } = req.body;

  try {
    await pool.query(
      `DELETE FROM favorites WHERE user_id = $1 AND place_id = $2`,
      [userId, placeId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

app.get("/favorites/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.* FROM places p
       JOIN favorites f ON p.place_id = f.place_id
       WHERE f.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to load favorites" });
  }
});

app.post("/generate-itinerary", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // sau "gpt-4" dacă ai acces
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const message = response.choices?.[0]?.message?.content;

    if (!message) {
      return res
        .status(500)
        .json({ error: "AI did not return a message", raw: response });
    }

    res.json({ itinerary: message });
  } catch (err) {
    console.error("❌ OpenAI SDK error:", err);
    res
      .status(500)
      .json({ error: "AI request failed", details: err.message || err });
  }
});

app.get("/zones", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM zones ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching zones:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/itineraries", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        theme,
        description,
        image_url,
        starting_point,
        starting_lat,
        starting_lng,
        starting_time,
        duration_minutes,
        difficulty,
        estimated_budget,
        tags,
        rating_avg
      FROM itineraries
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching itineraries:", err);
    res.status(500).json({ error: "Failed to fetch itineraries" });
  }
});

app.get("/itineraries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const itineraryResult = await pool.query(
      `SELECT
        id, title, theme, description, image_url,
        starting_point, starting_lat, starting_lng,
        starting_time, duration_minutes, difficulty,
        estimated_budget, tags, rating_avg
      FROM itineraries
      WHERE id = $1`,
      [id]
    );

    if (itineraryResult.rowCount === 0) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    const placesResult = await pool.query(
      `SELECT
        ip.time, ip.note, ip.instructions, ip.order,
        p.name, p.latitude, p.longitude, p.place_id
       FROM itinerary_places ip
       JOIN places p ON ip.place_id = p.place_id
       WHERE ip.itinerary_id = $1
       ORDER BY ip.order ASC`,
      [id]
    );

    const itinerary = itineraryResult.rows[0];
    itinerary.places = placesResult.rows;

    res.json(itinerary);
  } catch (err) {
    console.error("❌ Error fetching itinerary:", err);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
});

app.post("/favorites/itineraries", async (req, res) => {
  const { userId, itineraryId } = req.body;
  console.log(req.body);
  try {
    await pool.query(
      `INSERT INTO favorite_itineraries (user_id, itinerary_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, itineraryId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

app.delete("/favorites/itineraries", async (req, res) => {
  const { userId, itineraryId } = req.body;

  if (!userId || !itineraryId) {
    return res.status(400).json({ error: "Missing userId or itineraryId" });
  }

  try {
    await pool.query(
      "DELETE FROM favorite_itineraries WHERE user_id = $1 AND itinerary_id = $2",
      [userId, itineraryId]
    );
    res.status(200).json({ message: "Favorite deleted" });
  } catch (err) {
    console.error("❌ DB error on DELETE:", err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/reviews/itineraries", async (req, res) => {
  const { userId, itineraryId, rating, comment, anonymous } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Inserare review cu flag-ul anonymous
    await client.query(
      `INSERT INTO itinerary_reviews (user_id, itinerary_id, rating, comment, anonymous)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, itineraryId, rating, comment, anonymous || false]
    );

    // 2. Recalculare medie rating
    const result = await client.query(
      `SELECT AVG(rating) AS avg_rating
       FROM itinerary_reviews
       WHERE itinerary_id = $1`,
      [itineraryId]
    );

    const avg = Number(result.rows[0].avg_rating || 0);

    // 3. Update în itineraries
    await client.query(
      `UPDATE itineraries
       SET rating_avg = $1
       WHERE id = $2`,
      [avg, itineraryId]
    );

    await client.query("COMMIT");

    res.json({ success: true, newAverage: avg });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Failed to insert review or update avg:", err);
    res.status(500).json({ error: "Failed to add review" });
  } finally {
    client.release();
  }
});

app.get("/favorites/itineraries/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT itinerary_id FROM favorite_itineraries WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows); // <-- TREBUIE SĂ FIE ARRAY!
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/favorites/check", async (req, res) => {
  const { userId, itineraryId } = req.body;
  try {
    const result = await pool.query(
      "SELECT 1 FROM favorite_itineraries WHERE user_id = $1 AND itinerary_id = $2",
      [userId, itineraryId]
    );
    res.json(result.rowCount > 0);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/reviews/itineraries/:id", async (req, res) => {
  const itineraryId = req.params.id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT r.rating, r.comment, r.anonymous,
             CASE WHEN r.anonymous THEN 'Anonymous' ELSE u.username END AS username
      FROM itinerary_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.itinerary_id = $1
      ORDER BY r.created_at DESC
    `,
      [itineraryId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  } finally {
    client.release();
  }
});

app.post("/places/details", async (req, res) => {
  const { placeId } = req.body;

  if (!placeId) {
    return res.status(400).json({ error: "Missing placeId" });
  }

  try {
    const result = await pool.query(
      `SELECT 
         place_id, name, address, latitude, longitude, rating, types,
         photo_url, user_ratings_total, price_level, business_status,
         opening_hours,
         google_maps_url
       FROM places
       WHERE place_id = $1`,
      [placeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching place details:", err);
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

app.post("/favorites/check/places", async (req, res) => {
  const { userId, itineraryId, placeId } = req.body;

  try {
    if (itineraryId) {
      const result = await pool.query(
        "SELECT 1 FROM favorite_itineraries WHERE user_id = $1 AND itinerary_id = $2",
        [userId, itineraryId]
      );
      return res.json(result.rowCount > 0);
    }

    if (placeId) {
      const result = await pool.query(
        "SELECT 1 FROM favorites WHERE user_id = $1 AND place_id = $2",
        [userId, placeId]
      );
      return res.json(result.rowCount > 0);
    }

    return res.status(400).json({ error: "Missing itineraryId or placeId" });
  } catch (err) {
    console.error("❌ Error in /favorites/check:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/local-tips", async (req, res) => {
  try {
    const tipsResult = await pool.query(`
      SELECT * FROM local_tips ORDER BY id DESC
    `);

    const tips = [];

    for (const tip of tipsResult.rows) {
      const itemsResult = await pool.query(
        `
        SELECT i.rank, i.comment, p.name, p.photo_url, p.place_id
        FROM local_tip_items i
        JOIN places p ON i.place_id = p.place_id
        WHERE i.local_tip_id = $1
        ORDER BY i.rank ASC
      `,
        [tip.id]
      );

      tips.push({
        ...tip,
        places: itemsResult.rows,
      });
    }

    res.json(tips);
  } catch (err) {
    console.error("❌ Error fetching local tips:", err);
    res.status(500).json({ error: "Failed to load local tips" });
  }
});

app.put("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = userRes.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    const updateRes = await pool.query(
      "UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email",
      [username, userId]
    );

    const updatedUser = updateRes.rows[0];

    const newToken = jwt.sign(
      {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ user: updatedUser, token: newToken });
  } catch (err) {
    console.error("❌ Error updating username:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/users/:id/password", async (req, res) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing passwords" });
  }

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = userRes.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    const updatedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const newToken = jwt.sign(updatedUser, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ success: true, token: newToken });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/requests/local-account", async (req, res) => {
  const { userId, reason } = req.body;

  if (!userId || !reason?.trim()) {
    return res.status(400).json({ error: "Missing userId or reason" });
  }

  try {
    await pool.query(
      `INSERT INTO local_account_requests (user_id, reason)
       VALUES ($1, $2)`,
      [userId, reason.trim()]
    );

    return res.status(200).json({ message: "Request submitted successfully" });
  } catch (err) {
    console.error("❌ Error inserting request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/requests/mine", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;

    const result = await pool.query(
      `SELECT id, reason, status, created_at
       FROM local_account_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error verifying token or fetching data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/admin/users", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: not admin" });
    }

    const result = await pool.query(
      `SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/requests/local-account", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: not admin" });
    }

    const result = await pool.query(`
      SELECT r.id, r.reason, r.status, r.created_at,
             u.username, u.email
      FROM local_account_requests r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/requests/local-account/:id/accept", async (req, res) => {
  const { id } = req.params;
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin")
      return res.status(403).json({ error: "Forbidden: not admin" });

    const result = await pool.query(
      `UPDATE local_account_requests
       SET status = 'accepted'
       WHERE id = $1
       RETURNING user_id`,
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Request not found" });

    const userId = result.rows[0].user_id;

    await pool.query(`UPDATE users SET role = 'local' WHERE id = $1`, [userId]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Accept error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/requests/local-account/:id/reject", async (req, res) => {
  const { id } = req.params;
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin")
      return res.status(403).json({ error: "Forbidden: not admin" });

    const result = await pool.query(
      `UPDATE local_account_requests
       SET status = 'rejected'
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Request not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Reject error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/requests/itinerary-suggestions/:id/edit", async (req, res) => {
  const { id } = req.params;
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;

    const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [
      userId,
    ]);
    if (userRes.rows[0]?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      title,
      description,
      difficulty,
      starting_time,
      estimated_budget,
      duration_minutes,
      theme,
      tags,
      cover_image,
    } = req.body;

    await pool.query(
      `UPDATE suggested_itineraries SET 
        title = $1,
        description = $2,
        difficulty = $3,
        starting_time = $4,
        estimated_budget = $5,
        duration_minutes = $6,
        theme = $7,
        tags = $8,
        image_url = $9
       WHERE id = $10`,
      [
        title,
        description,
        difficulty,
        starting_time,
        estimated_budget,
        duration_minutes,
        theme,
        tags,
        cover_image,
        id,
      ]
    );

    res.json({ success: true, message: "Itinerary updated" });
  } catch (err) {
    console.error("❌ Edit error:", err);
    res.status(500).json({ error: "Failed to update itinerary" });
  }
});

app.delete("/requests/:id", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;
    const requestId = parseInt(req.params.id, 10);

    // Verificăm dacă cererea aparține utilizatorului
    const result = await pool.query(
      `DELETE FROM local_account_requests
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [requestId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Request not found or not yours" });
    }

    res.status(204).send(); // No Content
  } catch (err) {
    console.error("❌ Error deleting request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/suggested-itineraries", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  let token = null;
  let payload = null;

  try {
    token = auth.split(" ")[1];
    payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 JWT payload:", payload);
  } catch (err) {
    console.error("❌ Invalid JWT:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (!payload || !payload.id) {
    console.error("❌ JWT does not contain 'id'");
    return res.status(401).json({ error: "Invalid token payload" });
  }

  const userId = payload.id;

  const {
    title,
    description,
    difficulty,
    startingTime,
    budget,
    duration,
    theme,
    tags,
    stops,
  } = req.body;

  console.log("✅ BODY primit:", req.body);

  if (
    !title ||
    !description ||
    !startingTime ||
    !Array.isArray(stops) ||
    stops.length === 0
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const starting_point = req.body.starting_point || stops[0]?.name;
  const latitude = req.body.starting_lat || stops[0]?.latitude;
  const longitude = req.body.starting_lng || stops[0]?.longitude;

  if (!starting_point || !latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Missing coordinates or name for first stop" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const suggestionResult = await client.query(
      `INSERT INTO suggested_itineraries (
         title, description, difficulty, starting_time,
         estimated_budget, duration_minutes, theme, tags,
         starting_point, starting_lat, starting_lng, status, user_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',$12)
       RETURNING id`,
      [
        title,
        description,
        difficulty,
        startingTime,
        budget || null,
        duration || null,
        theme || null,
        tags || [],
        starting_point,
        latitude,
        longitude,
        userId,
      ]
    );

    const suggestionId = suggestionResult.rows[0].id;
    console.log("📌 Suggestion inserat cu ID:", suggestionId);

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      await client.query(
        `INSERT INTO suggested_itinerary_places (
           suggested_itinerary_id, place_id, "order", time, note, instructions
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          suggestionId,
          stop.place_id,
          i + 1,
          stop.time || null,
          stop.note || null,
          stop.instructions || null,
        ]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Suggestion submitted", id: suggestionId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Failed to insert suggestion:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  } finally {
    client.release();
  }
});

app.get("/requests/itinerary-suggestions", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;

    const userResult = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0 || userResult.rows[0].role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await pool.query(`
      SELECT sr.id, u.username, u.email, sr.title, sr.theme,sr.status, sr.created_at
      FROM suggested_itineraries sr
      JOIN users u ON sr.user_id = u.id
      ORDER BY sr.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching itinerary suggestions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/requests/itinerary-suggestions/:id/:action", async (req, res) => {
  const { id, action } = req.params;
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;

    const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [
      userId,
    ]);
    if (userRes.rows.length === 0 || userRes.rows[0].role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (action !== "accept" && action !== "reject") {
      return res.status(400).json({ error: "Invalid action" });
    }

    const update = await pool.query(
      `UPDATE suggested_itineraries SET status = $1 WHERE id = $2 RETURNING *`,
      [action === "accept" ? "accepted" : "rejected", id]
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (action === "accept") {
      // 1. Luăm datele propunerii
      const suggestionRes = await pool.query(
        `SELECT * FROM suggested_itineraries WHERE id = $1`,
        [id]
      );
      if (suggestionRes.rowCount === 0)
        return res.status(404).json({ error: "Suggested itinerary not found" });

      const suggestion = suggestionRes.rows[0];

      // 2. Inserăm în itineraries
      const insertItineraryRes = await pool.query(
        `INSERT INTO itineraries 
      (title, description, difficulty, duration_minutes, estimated_budget, theme, starting_time, starting_point, starting_lat, starting_lng, created_at)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,  NOW())
     RETURNING id`,
        [
          suggestion.title,
          suggestion.description,
          suggestion.difficulty,
          suggestion.duration_minutes,
          suggestion.estimated_budget,
          suggestion.theme,
          suggestion.starting_time,
          suggestion.starting_point,
          suggestion.starting_lat,
          suggestion.starting_lng,
        ]
      );

      const newItineraryId = insertItineraryRes.rows[0].id;

      // 3. Luăm stopurile
      const stopsRes = await pool.query(
        `SELECT * FROM suggested_itinerary_places WHERE suggested_itinerary_id = $1 ORDER BY "order"`,
        [id]
      );

      // 4. Inserăm stopurile în itinerary_places
      for (const stop of stopsRes.rows) {
        await pool.query(
          `INSERT INTO itinerary_places 
        (itinerary_id, place_id, note, time, instructions, "order")
       VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newItineraryId,
            stop.place_id,
            stop.note,
            stop.time,
            stop.instructions,
            stop.order,
          ]
        );
      }

      // 5. Setăm statusul ca accepted
      await pool.query(
        `UPDATE suggested_itineraries SET status = 'accepted' WHERE id = $1`,
        [id]
      );

      return res.json({
        message: "Itinerary approved and added successfully.",
      });
    }

    if (action === "reject") {
      await pool.query(
        `UPDATE suggested_itineraries SET status = 'rejected' WHERE id = $1`,
        [id]
      );
      return res.json({ message: "Itinerary rejected successfully." });
    }

    res.json({ message: `Request ${action}ed successfully.` });
  } catch (err) {
    console.error("❌ Failed to update itinerary suggestion:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/suggested-itineraries/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    const itineraryRes = await client.query(
      `SELECT * FROM suggested_itineraries WHERE id = $1`,
      [id]
    );

    if (itineraryRes.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const itinerary = itineraryRes.rows[0];

    const stopsRes = await client.query(
      `SELECT
         sip.place_id,
         p.name,
         p.address,
         p.latitude,
         p.longitude,
         sip.note,
         sip.time,
         sip.instructions
       FROM suggested_itinerary_places sip
       JOIN places p ON sip.place_id = p.place_id
       WHERE sip.suggested_itinerary_id = $1
       ORDER BY sip."order"`,
      [id]
    );

    itinerary.stops = stopsRes.rows;

    res.json(itinerary);
  } catch (err) {
    console.error("❌ Error fetching suggested itinerary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/suggested-local-tips", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;

    const { title, description, emoji, image_url, places } = req.body;

    if (!title || !places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO suggested_local_tips (title, description, emoji, image_url, user_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [title, description || null, emoji || null, image_url || null, userId]
      );

      const tipId = result.rows[0].id;

      for (const [index, item] of places.entries()) {
        await client.query(
          `INSERT INTO suggested_local_tip_items (suggested_local_tip_id, place_id, rank, comment)
           VALUES ($1, $2, $3, $4)`,
          [tipId, item.place_id, index + 1, item.comment || null]
        );
      }

      await client.query("COMMIT");
      res.status(201).json({ success: true, id: tipId });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ DB error:", err);
      res.status(500).json({ error: "Failed to insert suggestion" });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.get("/requests/local-tips", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const result = await pool.query(`
      SELECT slt.id, slt.title, slt.status, slt.created_at, u.username, u.email
      FROM suggested_local_tips slt
      JOIN users u ON slt.user_id = u.id
      ORDER BY slt.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch local tip suggestions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/requests/local-tips/:id/:action", async (req, res) => {
  const { id, action } = req.params;
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token provided" });

  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const status = action === "accept" ? "accepted" : "rejected";
    await pool.query(
      "UPDATE suggested_local_tips SET status = $1 WHERE id = $2",
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(`❌ Failed to ${action} local tip:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/suggested-local-tips/:id", async (req, res) => {
  const id = req.params.id;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.name, i.comment
       FROM suggested_local_tip_items i
       JOIN places p ON p.place_id = i.place_id
       WHERE i.suggested_local_tip_id = $1
       ORDER BY i.rank`,
      [id]
    );
    res.json({ places: result.rows });
  } catch (err) {
    console.error("❌ Failed to fetch places:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  } finally {
    client.release();
  }
});

app.listen(3000, () =>
  console.log("🟢 Server running at http://localhost:3000")
);
