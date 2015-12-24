#!/usr/bin/env node

/**
 * Set ALLOW_CONFIG_MUTATIONS to true
 * swagger-node-runner mutates config.swagger after require
 */
process.env.ALLOW_CONFIG_MUTATIONS = true;

const config = require('config');
const logger = require('./logger')(config.get('logger'));
const SwaggerExpress = require('swagger-express-mw');
// const Promise = require('bluebird');
const app = require('express')();
// for testing
module.exports = app;

// Output environment and logger transports levels
logger.info('app start', {
  env: config.util.getEnv('NODE_ENV'),
  loggerTransports: Object.keys(logger.transports).map(transport => ({
    name: transport,
    level: logger.transports[transport].level
  }))
});

require('./amqp')(config.get('amqp'), (e, amqp) => {
  'use strict';
  if (e) {
    logger.error(e).then(() => {
      throw e;
    });
    return;
  }

  // install middleware
  amqp.register(app);

  process.once('SIGINT', () => {
    amqp.conn.close();
    logger.info('SIGINT').then(() => process.exit());
  });

  SwaggerExpress.create({
    appRoot: __dirname, // required config
  }, (error, swaggerExpress) => {
    if (error) {
      amqp.conn.close();
      logger.error(error).then(() => {
        throw error;
      });
      return;
    }
    // install middleware
    swaggerExpress.register(app);

    // Start listening to requests
    const server = app.listen(config.get('server.port'), err => {
      if (err) {
        amqp.conn.close();
        logger.error(err).then(() => {
          throw err;
        });
        return;
      }
      app.emit('ready');
      app.isReady = true;
      logger.info('server listen', {
        port: server.address().port
      });
    });
  });
});
