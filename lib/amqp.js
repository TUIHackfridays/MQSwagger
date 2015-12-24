// A multi-transport async logging library
const amqplib = require('amqplib');

const Promise = require('bluebird');

// socketOptions http://www.squaremobius.net/amqp.node/ssl.html

module.exports = config => {
  const amqp = Promise.promisifyAll(amqplib);
  amqp.config = config;
  // register listerner to process interrution to close connnection log
  amqp.closeConnOnSIGINT = conn => {
    const SIGINTListener = () => {
      conn.close();
      process.exit();
    };
    process.once('SIGINT', SIGINTListener);
    return SIGINTListener;
  };
  // register middleware
  amqp.register = (app) => {
    app.use((req, res, next) => {
      req.ampq = amqp;
      next();
    });
  };
  return amqp;
};
