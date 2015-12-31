#!/usr/bin/env node

/**
 * Set ALLOW_CONFIG_MUTATIONS to true
 * swagger-node-runner mutates config.swagger after require
 */
process.env.ALLOW_CONFIG_MUTATIONS = true;

const config = require('config');

const logger = require('./lib/logger')(config.get('logger'));
const amqp = require('./lib/amqp')(config.get('amqp'));
const api = require('./lib/api')(config.get('api'));

const Promise = require('bluebird');

// Output environment and logger transports levels
logger.info('app start', {
  env: config.util.getEnv('NODE_ENV'),
  loggerTransports: Object.keys(logger.transports).map(transport => ({
    name: transport,
    level: logger.transports[transport].level
  }))
});

// initialize amqp and connect to the MQ server
Promise.resolve(amqp.connect(
    config.get('amqp.url'), config.get('amqp').socketOptions))
  .tap(() => logger.info('amqp connect', {
    url: config.get('amqp.url')
  }))
  // attach connection to amqp and register amqp to the api
  .then((conn) => {
    amqp.closeConnOnSIGINT(conn);
    amqp.conn = conn;
    amqp.register(api);
    // initialize api
    return api.init();
  })
  // start listining to requests
  .then(() => api.start())
  .tap(() => logger.info('api listen', {
    port: config.get('api').port
  }))
  // handle any error on the promise chain (breaks it)
  .catch(error => {
    // if amqp was initialized close the connection before throw
    if (amqp.conn) amqp.conn.close();
    // make sure error is logged properly and then throw it
    return logger.promise.error(error).then(() => {
      throw error;
    });
  });
