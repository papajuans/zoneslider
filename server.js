'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Path = require('path');
const { DateTime } = require("luxon");
const Tzc = require('timezonecomplete');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const init = async () => {

  //sqlite3 shit
  const cities = new sqlite3.Database(`${__dirname}/data/cities.db`);
  const searchQuery = cities.prepare('select * from cities where name LIKE ? order by population desc');

  //IANA tz database
  const ianaDb = Tzc.TzDatabase.instance();

  const server = Hapi.server({
    port: 9393,
    host: 'localhost',
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  });

  await server.register(Inert);

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      file: 'index.html'
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true,
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/utc',
    handler: (request, h) => {
      return { utc_time: DateTime.now().toUTC() };
    }
  });

  server.route({
    method: 'GET',
    path: '/bundle',
    handler: {
      file: 'dist/bundle.js'
    }
  });

  function transformRow(row) {
    /**
     * {
     *  "city":"New York City",
     *  "offset":-18000,
     *  "dstOffset":-14400,
     *  "inDst":true,
     *  "country":"NY, United States",
     *  "nextTimeChange":"2023-11-05T02:00:00+00:00"}
     */

    const currentZoneName = row.timezone;
    console.log(new Date(), '>> server.js:80 - ', row.name, currentZoneName, ianaDb.hasDst(currentZoneName), ianaDb.nextDstChange(currentZoneName, Date.now()));
    const currentTimeInZone = DateTime.now().setZone(currentZoneName);
    return {
      city: row.name,
      inDST: currentTimeInZone.isInDST,
      offset: ianaDb.standardOffset(currentZoneName, Date.now()).as(Tzc.TimeUnit.Second),
      dstOffset: ianaDb.totalOffset(currentZoneName, Date.now()).as(Tzc.TimeUnit.Second),
      offsetNameShort: currentTimeInZone.offsetNameShort,
      country: row.country,
      nextTimeChange: ianaDb.nextDstChange(currentZoneName, Date.now()) ?
        DateTime.fromMillis(ianaDb.nextDstChange(currentZoneName, Date.now())).toUTC() : ""
    };
  }

  server.route({
    method: 'GET',
    path: '/search',
    handler: (request, h) => {

      return new Promise((resolve, reject) => {
        let city = request.query['q'];
        searchQuery.all(`${city}%`, function (err, rows) {
          console.log(new Date(), '>> server.js:100 - ', rows);
          if (err) reject(err);

          let results = rows.map(transformRow);

          return resolve({ results: results });
        });
      });

    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();