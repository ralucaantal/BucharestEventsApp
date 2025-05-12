import puppeteer from "puppeteer";

export async function fetchEventimEvents() {
  const url = "https://www.eventim.ro/ro/venues/bucuresti/city.html";
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000, // 60 secunde
  });

  // Scroll pentru a încărca toate evenimentele
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const events = await page.evaluate(() => {
    const list = [];
    const items = document.querySelectorAll(".m-eventListItem");

    items.forEach((el) => {
      const title = el
        .querySelector(".m-eventListItem__title")
        ?.textContent.trim();
      const dateDay = el.querySelector(".a-badgeDate__day")?.textContent.trim();
      const dateMonth = el
        .querySelector(".a-badgeDate__mth")
        ?.textContent.trim();
      const time = el
        .querySelector(".a-badgeDate__time")
        ?.textContent.trim()
        ?.match(/\d{2}:\d{2}/)?.[0];
      const location = el
        .querySelector("address")
        ?.textContent.trim()
        .replace(/\s+/g, " ");
      const image = el.querySelector("img")?.src;
      const href = el.getAttribute("href");
      const link = href?.startsWith("/")
        ? "https://www.eventim.ro" + href
        : href;

      if (title && dateDay && dateMonth) {
        list.push({
          title,
          dateRaw: `${dateDay} ${dateMonth} ${time || "19:00"}`,
          location,
          url: link,
          image_url: image,
        });
      }
    });

    return list;
  });

  await browser.close();

  const formatted = events.map((ev) => ({
    ...ev,
    date: parseEventimDate(ev.dateRaw),
  }));

  const filtered = filterEventsByDate(formatted);
  return filtered;
}

// 📅 "14 mai 19:00" => ISO string
function parseEventimDate(str) {
  const months = {
    ian: 0,
    feb: 1,
    martie: 2,
    mar: 2,
    apr: 3,
    mai: 4,
    iun: 5,
    iul: 6,
    aug: 7,
    sept: 8,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  try {
    const dateMatch = str.toLowerCase().match(/(\d{1,2})\s+([a-zăîșț]+)/i);
    if (!dateMatch) return null;
    const [, day, monthName] = dateMatch;

    const timeMatch = str.match(/(\d{2}):(\d{2})/);
    const [, hour = "19", minute = "00"] = timeMatch || [];

    const month = months[monthName];
    if (month === undefined || !day) return null;

    const year = new Date().getFullYear();
    const date = new Date(
      year,
      month,
      Number(day),
      Number(hour),
      Number(minute)
    );
    return date.toISOString();
  } catch {
    return null;
  }
}

// 🔍 Filtrare: ieri → peste 3 zile
function filterEventsByDate(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDates = [-1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return d.toISOString().split("T")[0];
  });

  return events.filter((ev) => {
    if (!ev.date) return false;
    const date = new Date(ev.date).toISOString().split("T")[0];
    return targetDates.includes(date);
  });
}
