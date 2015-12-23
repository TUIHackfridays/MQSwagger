#!/usr/bin/env node

// swagger-node-runner mutates config.swagger after require
process.env.ALLOW_CONFIG_MUTATIONS = true;
const config = require('config');

const logger = require('./logger')(config.get('logger'));
const SwaggerExpress = require('swagger-express-mw');
const morgan = require('morgan');
const app = require('express')();
// for testing
module.exports = app;

SwaggerExpress.create({
  appRoot: __dirname, // required config
}, (error, swaggerExpress) => {
  'use strict';
  if (error) {
    logger.error(error);
    // timeout then exit to allow logging async error
    setTimeout(() => process.exit(1), 200);
  } else {
    // log all incoming HTTP requests
    app.use(morgan(
      ':remote-addr - :status ":method :url HTTP/:http-version" :status ' +
      ':res[content-length] ":referrer" ":user-agent"', {
        stream: {
          write: msg => logger.info(msg)
        }
      }));

    // install middleware
    swaggerExpress.register(app);

    // Output enviroment and logger transports levels
    logger.info('Enviroment: ' + config.util.getEnv('NODE_ENV') +
      ', logger transports: ', Object.keys(logger.transports).map(transport =>
        transport + '@' + logger.transports[transport].level));

    // Start listening to requests
    const server = app.listen(config.get('server.port'), err => {
      if (err) {
        logger.error(err);
        // timeout then exit to allow logging async error
        setTimeout(() => process.exit(1), 200);
      } else {
        logger.info('Listening on port %d', server.address().port);

        if (swaggerExpress.runner.swagger.paths['/hello']) {
          logger.info('try this:\ncurl http://127.0.0.1:' +
            server.address().port + '/hello?name=Scott');
        }
      }
    });
  }
});
