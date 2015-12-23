#!/usr/bin/env node

// swagger-node-runner mutates config.swagger after require
process.env.ALLOW_CONFIG_MUTATIONS = true;
const SwaggerExpress = require('swagger-express-mw');
// const Promise = require('bluebird');
const app = require('express')();
const config = require('config');
const logger = require('./logger')(config.get('logger'));
// for testing
module.exports = app;

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

    // Output enviroment and logger transports levels
    logger.info('Enviroment: ' + config.util.getEnv('NODE_ENV') +
      ', logger transports: ', Object.keys(logger.transports).map(transport =>
        transport + '@' + logger.transports[transport].level));

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
      logger.info('Listening on port %d', server.address().port);

      if (swaggerExpress.runner.swagger.paths['/hello']) {
        logger.info('try this:\ncurl http://127.0.0.1:' +
          server.address().port + '/hello?name=Scott');
      }
    });
  });
});
