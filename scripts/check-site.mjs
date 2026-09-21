import { readFile } from "node:fs/promises";

const requiredFiles = ["index.html", "styles.css", "app.js"];
for (const file of requiredFiles) {
  const contents = await readFile(file, "utf8");
  if (!contents.trim()) throw new Error(`${file} is empty.`);
}
const html = await readFile("index.html", "utf8");
for (const reference of ["styles.css", "app.js"]) {
  if (!html.includes(reference)) throw new Error(`index.html does not reference ${reference}.`);
}
const source = await readFile("app.js", "utf8");
const modelCount = (source.match(/\{ id: "/g) ?? []).length;
if (modelCount !== 18) throw new Error(`Expected 18 message models, found ${modelCount}.`);
console.log(`Validated static site: ${modelCount} message models and required assets are present.`);
