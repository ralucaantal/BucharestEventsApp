import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

export async function fetchIaBiletEvents() {
  const days = [-1, 0, 1, 2, 3]; // ieri → peste 3 zile
  const today = new Date();
  const urls = days.map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    return {
      url: `https://www.iabilet.ro/bilete/${yyyy}/${mm}/${dd}/`,
      date: d,
    };
  });

  const allEvents = [];

  for (const { url, date } of urls) {
    console.log(`🔍 Accesez: ${url}`);
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(res.data);
    const items = $('[data-event-list="item"]');

    for (const el of items.toArray()) {
      const title = $(el).find(".title span").text().trim();
      const location = $(el).find(".location .venue span").text().trim();
      const link = $(el).find(".title a").attr("href");
      const image = $(el).find("img").attr("src");

      if (location.toLowerCase().includes("bucurești") && title && link) {
        allEvents.push({
          title,
          location,
          url: link.startsWith("http") ? link : `https://www.iabilet.ro${link}`,
          image_url: image,
          dateRaw: formatDateOnly(date),
        });
      }
    }
  }

  console.log(`📦 Evenimente din București găsite: ${allEvents.length}`);

  // 🔁 Extragere ora cu Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const ev of allEvents) {
    try {
      await page.goto(ev.url, { waitUntil: "networkidle2" });

      const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
      const match = bodyText.match(/ora\s+(\d{1,2}:\d{2})/);
      ev.time = match ? match[1] : "19:00";
    } catch (err) {
      ev.time = "19:00";
      console.log(`⚠️ Eroare la extragerea orei pentru ${ev.title}`);
    }

    ev.date = parseRomanianDateWithTime(ev.dateRaw, ev.time);
  }

  await browser.close();
  return allEvents;
}

function formatDateOnly(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("ro-RO", { month: "long" }).toLowerCase();
  return `${day} ${month}`;
}

function parseRomanianDateWithTime(str, time = "19:00") {
  const months = {
    ianuarie: 0,
    februarie: 1,
    martie: 2,
    aprilie: 3,
    mai: 4,
    iunie: 5,
    iulie: 6,
    august: 7,
    septembrie: 8,
    octombrie: 9,
    noiembrie: 10,
    decembrie: 11,
  };

  try {
    const [dayRaw, monthRaw] = str.toLowerCase().replace(",", "").split(" ");
    const day = parseInt(dayRaw, 10);
    const month = months[monthRaw];
    if (isNaN(day) || month === undefined) return null;

    const now = new Date();
    let year = now.getFullYear();
    if (month < now.getMonth()) year += 1;

    const [hour, minute] = time.split(":").map(Number);
    const date = new Date(year, month, day, hour, minute || 0);

    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:00`;
  } catch (e) {
    return null;
  }
}