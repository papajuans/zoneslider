# Zoneslider
Use raphael.js for some mildly interesting timezone visualizations. Instead
of using dropdowns or just raw text to determine city offset, we "plot"
cities along a single, 24-hr timeline.

This allows one to quickly and visually quantify the difference in hours
and time of day among various cities.

As added bonus, dragging any plotted city moves them all at once, allowing
you to quickly "compute" what-if scenarios: "If it's 9am in NYC, what time
is it in London?" and vice versa.

A demo can be seen here: http://www.roflopoly.com/zoneslider

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

## Sinatra
Sinatra is used to serve up everything within `public`. This includes the
main index.html file and all static assets.

### API endpoints
2 simple API endpoints exist:

`/utc` returns the current UTC time as reported by the server.

`/search?q=` returns search results for city searches.

