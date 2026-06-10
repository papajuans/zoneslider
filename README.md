# Zoneslider
Mildly interesting timezone visualization. Instead of using dropdowns or just
raw text to determine city offset, we "plot" cities along an infinite
timeline.

This allows one to quickly and visually quantify the difference in hours
and time of day among various cities.

Dragging the timeline allows you to quickly compute "what-if" scenarios:
"If it's 9am in NYC, what time is it in London?" and vice versa.

Hovering over a city will give you relative calculations to other cities; how
many hours the other cities are in relation to the city you're hovering.

A demo can be seen here: http://www.hoursapart.com

# Technical bits

Zoneslider is a fully static site — there is no server, no build step, and no
runtime dependencies. Serve the `public/` directory with any static file
server and you're done:

```
npx serve public
# or
python3 -m http.server -d public
```

## How it works

All application state is three values: the scrub offset from the real clock,
the list of plotted cities (as IANA timezone names like `Europe/London`), and
the time format. Everything on screen is re-derived from those on each render
— `public/app.js` is the entire application.

Timezone math is delegated to the browser's own tz database via
`Intl.DateTimeFormat`, which gives historically correct local times and DST
transitions for any instant, past or future. No offsets are ever stored or
shipped.

Plotted cities persist in `localStorage`.

## Where is the city data coming from?

geonames.org provides Creative Commons licensed data files that pair city
names with IANA timezone names: http://download.geonames.org/export/dump/readme.txt

`data/generate-cities.js` converts `data/cities15000.txt` (a tab-delimited
dump of all cities with population over 15,000) into `public/cities.json`,
which the frontend fetches lazily and searches client-side:

```
node data/generate-cities.js
```

Re-run it only when refreshing the geonames dump; the generated file is
checked in.
