import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://vedabase.io/en/library/bg';
const CHAPTER_VERSES: { [key: number]: number } = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 9: 34, 
  10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
};

const COMBINED_RANGES = [
  "1.16-18", "1.21-22", "1.32-35", "1.37-38", "2.42-43", "5.8-9", "5.27-28",
  "6.11-12", "6.13-14", "6.20-23", "10.4-5", "10.12-13", "11.10-11", "11.26-27",
  "11.41-42", "12.3-4", "12.6-7", "12.13-14", "12.18-19", "13.1-2", "13.6-7",
  "13.8-12", "14.22-25", "15.3-4", "16.1-3", "16.11-12", "16.13-15", "17.5-6",
  "17.26-27", "18.51-53"
];

async function main() {
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();
  const allData = [];
  const processedKeys = new Set();

  console.log("🚀 Starting Clean-Room Scrape...");

  for (let ch = 1; ch <= 18; ch++) {
    for (let v = 1; v <= CHAPTER_VERSES[ch]; v++) {
      const vKey = `${ch}.${v}`;
      if (processedKeys.has(vKey)) continue;

      const rangeMatch = COMBINED_RANGES.find(r => {
        const parts = r.split('.');
        const verses = parts[1].split('-');
        const start = parseInt(verses[0]);
        const end = parseInt(verses[1]);
        return parseInt(parts[0]) === ch && v >= start && v <= end;
      });

      const path = rangeMatch ? rangeMatch.split('.')[1] : v.toString();
      const url = `${BASE_URL}/${ch}/${path}/`;

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('h1', { timeout: 15000 });

        // No outside functions used inside this block to avoid ReferenceErrors
        const data = await page.evaluate(() => {
          const wrappers = Array.from(document.querySelectorAll('div'));
          
          const sanskritEl = wrappers.find(el => el.className.includes('verse-text') || el.className.includes('devanagari'));
          const translitEl = wrappers.find(el => el.className.includes('transliteration'));
          const synonymsEl = wrappers.find(el => el.className.includes('synonyms'));
          const translationEl = wrappers.find(el => el.className.includes('translation'));
          
          const allPs = Array.from(document.querySelectorAll('p'));
          let pIndex = -1;
          for(let i=0; i < allPs.length; i++) {
              if (allPs[i].textContent && allPs[i].textContent.includes('Purport')) {
                  pIndex = i;
                  break;
              }
          }
          
          const purportText = pIndex !== -1 
            ? allPs.slice(pIndex + 1).map(p => p.textContent?.trim()).join('\n\n')
            : "";

          return { 
            sanskrit: sanskritEl ? sanskritEl.textContent?.trim() : "", 
            translit: translitEl ? translitEl.textContent?.trim() : "", 
            synonyms: synonymsEl ? synonymsEl.textContent?.trim() : "", 
            translation: translationEl ? translationEl.textContent?.trim() : "", 
            purport: purportText 
          };
        });

        const entry = {
          id: `bg-${ch}-${path}`,
          verseNumber: `${ch}.${path}`,
          url: page.url(),
          ...data,
          fullText: `Verse ${ch}.${path}\n\nSanskrit: ${data.sanskrit}\n\nTranslation: ${data.translation}\n\nPurport: ${data.purport}`
        };

        allData.push(entry);
        console.log(`✅ Captured: ${ch}.${path}`);

        if (rangeMatch) {
          const rParts = rangeMatch.split('.')[1].split('-');
          for (let i = parseInt(rParts[0]); i <= parseInt(rParts[1]); i++) processedKeys.add(`${ch}.${i}`);
        } else {
          processedKeys.add(vKey);
        }

        fs.writeFileSync('gita.json', JSON.stringify(allData, null, 2));
        await page.waitForTimeout(1000 + Math.random() * 2000);

      } catch (err: any) {
        console.log(`❌ Failed ${ch}.${v}: ${err.message}`);
        await page.waitForTimeout(5000);
      }
    }
  }

  await browser.close();
  console.log("🎉 All Done!");
}

main();