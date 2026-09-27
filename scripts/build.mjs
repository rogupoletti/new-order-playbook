import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["index.html", "playbook.css", "playbook.js", "robots.txt"]) {
  await cp(file, `dist/${file}`);
}
await cp("assets", "dist/assets", { recursive: true });
console.log("Static Pages assets copied to dist/.");
