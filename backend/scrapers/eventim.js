import puppeteer from 'puppeteer';

export async function fetchEventimEvents() {
  const url = 'https://www.eventim.ro/ro/venues/bucuresti/city.html';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Scroll automat (pentru încărcare completă)
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const events = await page.evaluate(() => {
    const items = document.querySelectorAll('.event-box');
    const list = [];

    items.forEach(el => {
      const title = el.querySelector('.event-box-title')?.textContent.trim();
      const date = el.querySelector('.event-box-date')?.textContent.trim();
      const location = el.querySelector('.event-box-place')?.textContent.trim();
      const link = el.querySelector('a')?.href;
      const image = el.querySelector('img')?.src;

      if (title && date && link) {
        list.push({
          title,
          dateRaw: date, // Ex: "19.05.2024, 20:00"
          location,
          url: link,
          image_url: image,
        });
      }
    });

    return list;
  });

  await browser.close();

  // Convertim datele în format ISO
  const formatted = events.map(ev => ({
    ...ev,
    date: parseEventimDate(ev.dateRaw),
  }));

  return formatted;
}

function parseEventimDate(str) {
  try {
    const regex = /(\d{2})\.(\d{2})\.(\d{4}),?\s*(\d{2}):(\d{2})?/;
    const match = str.match(regex);
    if (!match) return null;

    const [_, day, month, year, hour = '19', minute = '00'] = match;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );
    return date.toISOString();
  } catch {
    return null;
  }
}