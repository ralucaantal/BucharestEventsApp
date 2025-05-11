import puppeteer from 'puppeteer';

export async function fetchIaBiletEvents() {
  const url = 'https://www.iabilet.ro/bilete-in-bucuresti/';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll pentru a încărca mai multe evenimente
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const events = await page.evaluate(() => {
    const list = [];
    const items = document.querySelectorAll('[data-event-list="item"]');

    items.forEach(el => {
      const title = el.querySelector('.title span')?.textContent.trim();
      const dateDay = el.querySelector('.date-start .date-day')?.textContent.trim();
      const dateMonth = el.querySelector('.date-start .date-month')?.textContent.trim();
      const location = el.querySelector('.location .venue span')?.textContent.trim();
      const image = el.querySelector('img')?.src;
      const link = el.querySelector('.title a')?.href;

      if (title && dateDay && dateMonth && link) {
        list.push({
          title,
          dateRaw: `${dateDay} ${dateMonth}`,
          location,
          url: link,
          image_url: image,
        });
      }
    });

    console.log(`📦 ${list.length} evenimente găsite pe iabilet.ro`)  ;
    return list;
  });

  await browser.close();

  // Convertim datele în format ISO cu anul actual
  const formattedEvents = events.map(ev => {
    const parsedDate = parseRomanianDate(ev.dateRaw);
    return {
      ...ev,
      date: parsedDate,
    };
  });

  return formattedEvents;
}

// 📅 Conversie dată "10 mai" -> "2025-05-10T19:00:00Z"
function parseRomanianDate(str) {
  const months = {
    ian: 0, februarie: 1, feb: 1, mar: 2, martie: 2, apr: 3, mai: 4,
    iun: 5, iul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
  };

  try {
    const [day, monthName] = str.toLowerCase().split(' ');
    const month = months[monthName];
    if (month === undefined) return null;

    const year = new Date().getFullYear();
    const date = new Date(year, month, Number(day), 19, 0);
    return date.toISOString();
  } catch {
    return null;
  }
}