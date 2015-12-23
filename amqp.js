// A multi-transport async lconfigogging library
const amqp = require('amqplib');

// socketOptions http://www.squaremobius.net/amqp.node/ssl.html

module.exports = (config, cb) => {
  amqp.connect(config.url, config.socketOptions).then(conn => {
    cb(null, {
      conn: conn,
      register: app => app.use((req, res, next) => {
        req.ampq = Object.create(null);
        req.ampq.conn = conn;
        req.ampq.config = config;
        next();
      })
    });
  }, err => cb(err));
};
