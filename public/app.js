// Zoneslider — plot cities on a draggable wall-clock timeline.
//
// All app state is three values (below); everything on screen is re-derived
// from them on every render. Timezone math is delegated entirely to the
// browser's tz database via Intl.DateTimeFormat, so DST transitions at any
// point in the past or future are handled correctly with no server.
"use strict";

const DAY_MS = 86400000;
const DAY_WIDTH = 300; // pixels per 24 hours
const PX_PER_MS = DAY_WIDTH / DAY_MS;
const TIMELINE_Y = 40; // top of the day-box strip
const TIMELINE_H = 60;
const LABEL_TOP = 130; // y of the first row of city labels
const ROW_H = 78; // vertical spacing between stacked label rows

const state = {
  // ms between the timeline's "virtual now" and the real clock. Dragging
  // and the move buttons change only this; ticking is free because the
  // virtual now is derived from Date.now() on every render.
  timeOffset: 0,
  // [{name, country, tz}] — tz is an IANA zone name like "Europe/London"
  cities: loadCities(),
  format: localStorage.getItem("zoneslider.format") || "ampm",
  hover: null, // name of the hovered city, or null
};

const virtualNow = () => Date.now() + state.timeOffset;

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

// "Wall timestamp": the city's local wall-clock time encoded as a UTC
// timestamp, so positions and differences can be computed with plain
// arithmetic. The distance between two cities' wall timestamps is exactly
// their offset difference.
const wallFormatters = {};
function wallTime(utcMs, tz) {
  let f = wallFormatters[tz];
  if (!f) {
    f = wallFormatters[tz] = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",
    });
  }
  const p = {};
  for (const part of f.formatToParts(utcMs)) p[part.type] = part.value;
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

function formatTime(wallMs) {
  const d = new Date(wallMs);
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  let h = d.getUTCHours();
  if (state.format !== "ampm") return `${h}:${mm}:${ss}`;
  const suffix = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${mm}:${ss} ${suffix}`;
}

function formatDate(wallMs) {
  return new Date(wallMs).toLocaleDateString("en-US", {
    timeZone: "UTC", weekday: "long", month: "long", day: "numeric",
  });
}

function relativeHours(fromWall, toWall) {
  const diff = Math.round((toWall - fromWall) / 36000) / 100; // 2 decimals
  if (diff === 0) return "same time";
  return `${diff > 0 ? "+" : ""}${diff} hours`;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function loadCities() {
  try {
    const saved = JSON.parse(localStorage.getItem("zoneslider.cities"));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) { /* fall through to default */ }
  return [{ name: "New York City", country: "United States", tz: "America/New_York" }];
}

function saveCities() {
  localStorage.setItem("zoneslider.cities", JSON.stringify(state.cities));
}

// ---------------------------------------------------------------------------
// Rendering — one pure pass from state to SVG markup
// ---------------------------------------------------------------------------

const svg = document.getElementById("zoneslider");

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function render() {
  const now = virtualNow();
  const width = svg.parentNode.clientWidth;
  const centerX = width / 2;
  // Maps a wall timestamp to an x coordinate. UTC's wall time is pinned to
  // the center of the screen; everything else falls out of that.
  const xOf = (wall) => centerX + (wall - now) * PX_PER_MS;

  const out = [];

  // Day boxes with 6am/noon/6pm ticks, covering the visible range.
  const leftWall = now - centerX / PX_PER_MS;
  const rightWall = now + (width - centerX) / PX_PER_MS;
  for (let day = Math.floor(leftWall / DAY_MS) * DAY_MS; day < rightWall; day += DAY_MS) {
    const x = xOf(day);
    out.push(`<rect class="daybox" x="${x}" y="${TIMELINE_Y}" width="${DAY_WIDTH}" height="${TIMELINE_H}"/>`);
    out.push(`<text class="daybox-date" x="${x + DAY_WIDTH / 2}" y="${TIMELINE_Y + 18}">${formatDate(day)}</text>`);
    for (const [hours, label] of [[6, "6am"], [12, "noon"], [18, "6pm"]]) {
      const tickX = x + hours * 3600000 * PX_PER_MS;
      out.push(`<line class="tick" x1="${tickX}" y1="${TIMELINE_Y + 38}" x2="${tickX}" y2="${TIMELINE_Y + TIMELINE_H}"/>`);
      out.push(`<text class="tick-label" x="${tickX}" y="${TIMELINE_Y + 33}">${label}</text>`);
    }
  }

  // City markers. Labels are stacked into rows so they never overlap.
  const cities = state.cities.map((c) => ({ ...c, wall: wallTime(now, c.tz) }));
  const hovered = cities.find((c) => c.name === state.hover);
  const rows = []; // per row, list of occupied [left, right] intervals
  let maxRow = 0;

  for (const city of cities) {
    const x = xOf(city.wall);
    const hour = new Date(city.wall).getUTCHours();
    const title = `${city.name} ${hour >= 6 && hour < 18 ? "☼" : "☾"}`;
    const subtitle = hovered && hovered.name !== city.name
      ? relativeHours(hovered.wall, city.wall)
      : formatTime(city.wall);

    const boxW = Math.max(title.length, subtitle.length) * 8.5 + 24;
    let row = 0;
    while ((rows[row] || []).some(([l, r]) => x - boxW / 2 < r && x + boxW / 2 > l)) row++;
    (rows[row] = rows[row] || []).push([x - boxW / 2 - 6, x + boxW / 2 + 6]);
    maxRow = Math.max(maxRow, row);

    const boxY = LABEL_TOP + row * ROW_H;
    const cityAttr = `data-city="${esc(city.name)}"`;
    out.push(`<line class="marker" x1="${x}" y1="${TIMELINE_Y}" x2="${x}" y2="${boxY}"/>`);
    out.push(`<g class="city${city.name === state.hover ? " hovered" : ""}" ${cityAttr}>`);
    out.push(`<rect class="city-box" x="${x - boxW / 2}" y="${boxY}" width="${boxW}" height="46" rx="4"/>`);
    out.push(`<text class="city-name" x="${x}" y="${boxY + 18}">${esc(title)}</text>`);
    out.push(`<text class="city-time" x="${x}" y="${boxY + 37}">${esc(subtitle)}</text>`);
    out.push(`<text class="city-remove" x="${x}" y="${boxY + 60}" data-remove="${esc(city.name)}">(remove)</text>`);
    out.push(`</g>`);
  }

  svg.setAttribute("width", width);
  svg.setAttribute("height", LABEL_TOP + (maxRow + 1) * ROW_H + 10);
  svg.innerHTML = out.join("");
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

// Dragging the timeline scrubs the virtual now. Dragging right pulls
// earlier times into view, like sliding a sheet of paper.
let drag = null;
svg.addEventListener("pointerdown", (e) => {
  if (e.target.dataset.remove) return;
  drag = { startX: e.clientX, startOffset: state.timeOffset };
  svg.setPointerCapture(e.pointerId);
});
svg.addEventListener("pointermove", (e) => {
  if (drag) {
    state.timeOffset = drag.startOffset - (e.clientX - drag.startX) / PX_PER_MS;
    render();
  } else {
    const city = e.target.closest("[data-city]");
    const hover = city ? city.dataset.city : null;
    if (hover !== state.hover) { state.hover = hover; render(); }
  }
});
svg.addEventListener("pointerup", () => { drag = null; });
svg.addEventListener("pointerleave", () => {
  if (state.hover) { state.hover = null; render(); }
});

svg.addEventListener("click", (e) => {
  const name = e.target.dataset.remove;
  if (!name) return;
  state.cities = state.cities.filter((c) => c.name !== name);
  saveCities();
  render();
});

document.getElementById("controls").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  if (button.dataset.hours) {
    state.timeOffset += Number(button.dataset.hours) * 3600000;
  } else if (button.dataset.format) {
    state.format = button.dataset.format;
    localStorage.setItem("zoneslider.format", state.format);
  } else if (button.id === "reset") {
    state.timeOffset = 0;
  }
  render();
});

// ---------------------------------------------------------------------------
// City search
// ---------------------------------------------------------------------------

const searchInput = document.getElementById("city-search");
const searchResults = document.getElementById("search-results");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
let cityDb = null; // lazily fetched, already sorted by population

async function loadCityDb() {
  if (!cityDb) {
    cityDb = fetch("cities.json").then((r) => r.json());
  }
  return cityDb;
}

searchInput.addEventListener("focus", loadCityDb);
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 2) { searchResults.innerHTML = ""; return; }
  const db = await loadCityDb();
  const matches = db.filter(([name]) => name.toLowerCase().startsWith(query)).slice(0, 10);
  searchResults.innerHTML = matches.map(([name, cc, , tz], i) => {
    let country;
    try { country = regionNames.of(cc); } catch (e) { country = cc; }
    return `<li data-i="${i}">${esc(name)}, ${esc(country || cc)}</li>`;
  }).join("");
  searchResults.onclick = (e) => {
    const item = e.target.closest("li");
    if (!item) return;
    const [name, cc, , tz] = matches[item.dataset.i];
    let country;
    try { country = regionNames.of(cc); } catch (err) { country = cc; }
    if (!state.cities.some((c) => c.name === name && c.tz === tz)) {
      state.cities.push({ name, country, tz });
      saveCities();
    }
    searchInput.value = "";
    searchResults.innerHTML = "";
    render();
  };
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

window.addEventListener("resize", render);
setInterval(render, 1000); // virtual now derives from Date.now(), so a render IS the tick
render();
