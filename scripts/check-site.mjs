import { readFile } from "node:fs/promises";

const requiredFiles = ["index.html", "playbook.css", "playbook.js", "robots.txt"];
for (const file of requiredFiles) {
  const contents = await readFile(file, "utf8");
  if (!contents.trim()) throw new Error(`${file} is empty.`);
}
const html = await readFile("index.html", "utf8");
for (const reference of ["playbook.css", "playbook.js"]) {
  if (!html.includes(reference)) throw new Error(`index.html does not reference ${reference}.`);
}
if (!html.includes('name="robots" content="noindex')) {
  throw new Error("index.html must prevent search indexing.");
}
const robots = await readFile("robots.txt", "utf8");
if (!robots.includes("User-agent: *") || !robots.includes("Disallow: /")) {
  throw new Error("robots.txt must block all crawler paths.");
}
const source = await readFile("playbook.js", "utf8");
const messageCount = (source.match(/"id": "M\d+"/g) ?? []).length;
if (messageCount === 0) throw new Error("No message models were found in playbook.js.");
console.log(`Validated static site: ${messageCount} message models and required assets are present.`);
