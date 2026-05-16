// Captura o output/index.html (grid 7×6) numa única imagem JPG pequena
// para a editora poder ver os 42 slides no telemóvel.
import puppeteer from "puppeteer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = "file://" + path.join(__dirname, "output", "index.html");
const out = path.join(__dirname, "output", "contact-sheet.jpg");

const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 2520, height: 800, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.screenshot({ path: out, type: "jpeg", quality: 78, fullPage: true });
await browser.close();

console.log("✓ contact-sheet em", out);
