// Converts the geonames cities15000.txt dump into the compact JSON the
// frontend searches client-side. Run from the repo root:
//
//   node data/generate-cities.js
//
// Output rows are positional arrays to keep the file small:
//   [name, countryCode, population, ianaTimezone]
"use strict";

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "cities15000.txt");
const dest = path.join(__dirname, "..", "public", "cities.json");

const rows = [];
for (const line of fs.readFileSync(src, "utf8").split("\n")) {
  if (!line) continue;
  const cols = line.split("\t");
  const name = cols[1];
  const country = cols[8];
  const population = Number(cols[14]) || 0;
  const timezone = cols[17];
  if (!name || !timezone) continue;
  rows.push([name, country, population, timezone]);
}

// Most-populous first so the frontend can take the first N matches as-is.
rows.sort((a, b) => b[2] - a[2]);

fs.writeFileSync(dest, JSON.stringify(rows));
console.log(`Wrote ${rows.length} cities to ${dest}`);
