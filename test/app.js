'use strict';

process.env.ALLOW_CONFIG_MUTATIONS = true;
const config = require('config');

const amqp = require('../lib/amqp');
const api = require('../lib/api')(config.get('api'));
const helloQueue = require('../api/controllers/helloQueue');

let connection;

// initialize amqp and connect to the MQ server
amqp.createConnection(config.get('amqp'))
  .then(conn => {
    connection = conn;
    return helloQueue.init(conn, config.get('controllers.helloQueue'));
  })
  .then(() => api.swagger())
  .then(() => api.start())
  .then(() => {
    api.emit('ready');
    api.isReady = true;
  })
  // handle any error on the promise chain (breaks it)
  .catch(error => {
    // if amqp was initialized close the connection before throw
    if (connection) connection.close();
    throw error;
  });

module.exports = api;
