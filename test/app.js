process.env.ALLOW_CONFIG_MUTATIONS = true;
const config = require('config');

const amqp = require('../lib/amqp')(config.get('amqp'));
const api = require('../lib/api')(config.get('api'));

// initialize amqp and connect to the MQ server
amqp.connect(config.get('amqp.url'), config.get('amqp').socketOptions)
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
  .then(() => {
    api.emit('ready');
    api.isReady = true;
  })
  // handle any error on the promise chain (breaks it)
  .catch(error => {
    // if amqp was initialized close the connection before throw
    if (amqp.conn) amqp.conn.close();
    // make sure error is logged properly and then throw it
    throw error;
  });

module.exports = {
  api: api,
  amqp: amqp
};
