// A multi-transport async logging library
const winston = require('winston');

// Utilities for handling and transforming file paths
const path = require('path');

const Promise = require('bluebird');
/**
 * Initiliazation of logger
 *
 * @alias initLogger
 * @param {Object} config
 * <pre>
 *  {
 *    path: {String},               log path to folder
 *    transports: {
 *      transportName: {            transport name (eg. File)
 *        options: {Object}         transport options
 *        <require: {String}>       require additional non-core transport
 *      },
 *      <...>                       other transports
 *    },
 *    levels: {Object},
 *    colors: {Object}
 *  }
 * </pre>
 *
 * @return {winston.Logger} logger - Winston Logger with promisified logging
 */
module.exports = config => {
  'use strict';

  const logger = new winston.Logger({
    // configuration of logger transports
    transports: Object.keys(config.transports).map(transport => {
      // get options for this specific transport
      const cfg = config.transports[transport];

      // remove transport if not defined options or set to false
      if (!cfg.options) {
        return;
      }

      // if require is needed expose winston.transports[required transport]
      if (cfg.require) {
        require(cfg.require);
      }

      // set name equal to transport
      cfg.options.name = cfg.options.name ? cfg.options.name : transport;

      // join absolute path to filename option to relative log path
      if (cfg.options.filename) {
        cfg.options.filename = path.resolve(__dirname, config.path + '/' +
          cfg.options.filename);
      }

      // initialize and return transport
      return new winston.transports[transport](cfg.options);
    }).filter(transport => !!transport),

    levels: config.levels,
    colors: config.colors
  });

  Object.keys(logger.levels).forEach(level => {
    const transportsCount = Object.keys(logger.transports).length;
    const vanilla = logger[level];
    logger[level] = function promiseLog() {
      const args = arguments;
      return new Promise(resolve => {
        let transports = transportsCount;
        const onLogging = () => {
          transports--;
          if (transports <= 0) {
            logger.removeListener('logging', onLogging);
            resolve();
          }
        };
        logger.on('logging', onLogging);
        vanilla.apply(logger, args);
      });
    };
  });
  return logger;
};
