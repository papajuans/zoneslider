# Zoneslider
Use raphael.js for some mildly interesting timezone visualizations. Instead
of using dropdowns or just raw text to determine city offset, we "plot"
cities along an infinite timeline.

This allows one to quickly and visually quantify the difference in hours
and time of day among various cities.

Dragging the the timeline allows you to quickly compute "what-if" scenarios: 
"If it's 9am in NYC, what time is it in London?" and vice versa.

Hovering over a city will give you relative calculations to other cities; how
many hours the other cities are in relation to the city you're hovering.

A demo can be seen here: http://www.roflopoly.com/zoneslider/

# Technical bits

## Javascript
grunt is used to manage the Javascript bits of the project. More specifically,
browserify is used to combine all source JS files into a single file. grunt
needs to be installed globally so that the `grunt` binary is available on your
path.

```
npm install -g grunt
```

The default `grunt` task is `browserify watch`, which will both combine the
javascript src files and also being watching any files for changes.

The outputted file is `public/dist/bundle.js`.

## Sinatra
Sinatra is used to serve up everything within `public`. This includes the
main index.html file and all static assets.

### API endpoints
2 simple API endpoints exist:

`/utc` returns the current UTC time as reported by the server.

`/search?q=` returns search results for city searches.

## Where is the data coming from?
Pretty much all Unix systems make use of the tz database (aka Olson database or zoneinfo) 
located somewhere near /usr/share/zoneinfo. These set of files store all the rules of
timezones and associated daylight savings adjustments for various cities in the format of
'continent/city', like `Asia/Tokyo` or `America/Chicago`.

geonames.org provides Creative Commons licensed data files that mesh up city names with
the zoneinfo timezone name. http://download.geonames.org/export/dump/readme.txt

`data/generate_db.rb` is a small ruby script that reads in `data/cities15000.txt`, a tab-
delimited file containing cities and their zoneinfo-formatted timezone name, and loads
data into `cities.db`, a Sqlite3 database.

Sinatra then just does a search within cities.db to find correspodning timezone information.
The ruby library TZInfo is used to compute actual timezone-related calculations.
