// Renders the painted map (tools/painted-map/painted-svg.js) to WebP images at 2× and 3×, so phones
// show a plain image instead of running heavy SVG watercolour filters (which some
// iPhones drop). Run after changing the drawing:
//   NODE_PATH=$(npm root -g) node tools/painted-map/render.mjs
// Needs Playwright (Chromium) and Python with Pillow for the WebP conversion.
import { createRequire } from "module";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { MAP_W, MAP_H } = await import(path.join(root, "js/painted-map.js"));
const { PAINTED_SVG } = await import(path.join(root, "tools/painted-map/painted-svg.js"));
const { FILTER_DEFS } = await import(path.join(root, "js/art.js")).catch(() => ({ FILTER_DEFS: "" }));

const browser = await chromium.launch();
for (const scale of [2, 3]) {
  const page = await browser.newPage({ viewport: { width: MAP_W, height: MAP_H }, deviceScaleFactor: scale });
  await page.setContent(`<!doctype html><html><head>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap">
    <style>html,body{margin:0;background:#f3efe4}svg{display:block}</style></head>
    <body>${FILTER_DEFS}${PAINTED_SVG.replace("<svg", `<svg width="${MAP_W}" height="${MAP_H}"`)}</body></html>`, { waitUntil: "networkidle" }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const png = path.join(root, `art/painted-map@${scale}x.png`);
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: MAP_W, height: MAP_H } });
  execFileSync("python3", ["-c", `from PIL import Image; im=Image.open(${JSON.stringify(png)}).convert("RGB"); im.save(${JSON.stringify(png.replace(".png", ".webp"))}, "WEBP", quality=${scale === 2 ? 80 : 68}, method=6)`]);
  execFileSync("rm", [png]);
  await page.close();
}
await browser.close();
console.log("Rendered art/painted-map@2x.webp and @3x.webp");
