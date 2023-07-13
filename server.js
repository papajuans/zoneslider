'use strict';

const Hapi = require('@hapi/hapi');
const { DateTime } = require("luxon");

const init = async () => {

  const server = Hapi.server({
    port: 9393,
    host: 'localhost'
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Hello World!';
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
    handler: (request, h) => {

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