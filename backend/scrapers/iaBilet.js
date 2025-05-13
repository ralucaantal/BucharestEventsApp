import puppeteer from "puppeteer";

export async function fetchIaBiletEvents() {
  const url = "https://www.iabilet.ro/bilete-in-bucuresti/";
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Forțăm versiunea desktop
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await page.goto(url, { waitUntil: "networkidle2" });

  let loadMoreTries = 0;
  while (loadMoreTries < 20) {
    const button = await page.$("a.btn-load-more");

    if (!button) {
      console.log("✅ Nu mai există butonul 'Mai mult'.");
      break;
    }

    console.log(`🟡 Click pe 'Mai mult' (${loadMoreTries + 1})`);

    const previousCount = await page.$$eval(
      '[data-event-list="item"]',
      (els) => els.length
    );

    await button.click();
    await page.waitForTimeout(1500);

    await page.waitForFunction(
      (prev) => {
        return (
          document.querySelectorAll('[data-event-list="item"]').length > prev
        );
      },
      {},
      previousCount
    );

    loadMoreTries++;
  }

  const events = await page.evaluate(() => {
    const list = [];
    const items = document.querySelectorAll('[data-event-list="item"]');

    items.forEach((el) => {
      const title = el.querySelector(".title span")?.textContent.trim();
      const dateDay = el
        .querySelector(".date-start .date-day")
        ?.textContent.trim();
      const dateMonth = el
        .querySelector(".date-start .date-month")
        ?.textContent.trim();
      const location = el
        .querySelector(".location .venue span")
        ?.textContent.trim();
      const image = el.querySelector("img")?.src;
      const link = el.querySelector(".title a")?.href;

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

    return list;
  });

  const results = [];

  for (const ev of events) {
    const detailPage = await browser.newPage();
    try {
      await detailPage.goto(ev.url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const time = await detailPage.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        const match = text.match(/ora\s+(\d{1,2}:\d{2})/);
        return match ? match[1] : null;
      });

      ev.time = time || "19:00";
    } catch {
      ev.time = "19:00";
    }
    await detailPage.close();

    const parsedDate = parseRomanianDateWithTime(ev.dateRaw, ev.time);
    if (parsedDate) {
      results.push({ ...ev, date: parsedDate });
    }
  }

  await browser.close();

  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 1);
  from.setHours(0, 0, 0, 0);

  const to = new Date(today);
  to.setDate(to.getDate() + 3);
  to.setHours(23, 59, 59, 999);

  return results.filter((ev) => {
    const eventDate = new Date(ev.date);
    return eventDate >= from && eventDate <= to;
  });
}

function parseRomanianDateWithTime(str, time = "19:00") {
  const months = {
    ian: 0,
    februarie: 1,
    feb: 1,
    mar: 2,
    martie: 2,
    apr: 3,
    mai: 4,
    iun: 5,
    iul: 6,
    aug: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  try {
    const [dayRaw, monthRaw] = str.toLowerCase().replace(",", "").split(" ");
    const day = parseInt(dayRaw, 10);
    const month = months[monthRaw];
    if (isNaN(day) || month === undefined) return null;

    const year = new Date().getFullYear();
    const [hour, minute] = time.split(":").map((v) => parseInt(v, 10));

    const localDate = new Date(year, month, day, hour || 19, minute || 0);

    const yyyy = localDate.getFullYear();
    const MM = String(localDate.getMonth() + 1).padStart(2, "0");
    const dd = String(localDate.getDate()).padStart(2, "0");
    const hh = String(hour || 19).padStart(2, "0");
    const mm = String(minute || 0).padStart(2, "0");

    const isoLike = `${yyyy}-${MM}-${dd}T${hh}:${mm}:00`;

    return isoLike;
  } catch (err) {
    console.error("❌ Eroare la conversia datei:", err);
    return null;
  }
}
