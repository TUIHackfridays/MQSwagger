#!/usr/bin/env node
'use strict';

/**
 * Set ALLOW_CONFIG_MUTATIONS to true
 * swagger-node-runner mutates config.swagger after require
 */
process.env.ALLOW_CONFIG_MUTATIONS = true;

const config = require('config');

const logger = require('./lib/logger')(config.get('logger'));
const amqp = require('./lib/amqp');
const api = require('./lib/api')(config.get('api'));
logger.info(api);
const helloQueue = require('./api/controllers/helloQueue');

// Output environment and logger transports levels
logger.info('app start', {
  env: config.util.getEnv('NODE_ENV'),
  loggerTransports: Object.keys(logger.transports).map(transport => ({
    name: transport,
    level: logger.transports[transport].level
  }))
});

let connection;

// initialize amqp and connect to the MQ server
amqp.createConnection(config.get('amqp')).tap(() =>
    logger.info('amqp.createConnection', {
      url: config.get('amqp.url')
    }))
  .then(conn => {
    connection = conn;
    return helloQueue.init(conn, config.get('controllers.helloQueue'));
  })
  .then(() => api.swagger())
  .then(swagger => logger.info('api.swagger', swagger))
  .then(() => api.start())
  .then(server => logger.info('api.start', {
    port: server.address().port
  }))
  // handle any error on the promise chain (breaks it)
  .catch(error => {
    // if amqp was initialized close the connection before throw
    if (connection) connection.close();
    // make sure error is logged properly and then throw it
    return logger.promise.error(error).then(() => {
      throw error;
    });
  });

module.exports = api;
