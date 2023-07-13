'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Path = require('path');
const { DateTime } = require("luxon");

const init = async () => {



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

  server.route({
    method: 'GET',
    path: '/search',
    handler: (request, h) => {
      return 'Hello World!';
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