'use strict';

// A multi-transport async logging library
const EventEmitter = require('events');
const amqplib = require('amqplib');
const Promise = require('bluebird');
const _ = require('lodash');
const cuid = require('cuid');

// socketOptions http://www.squaremobius.net/amqp.node/ssl.html
// consider purge channel, recover channel

// consider check if there are consumers for the
// queue

// register listener to process interruption to close connection log
const closeConnOnSIGINT = conn => {
  const SIGINTListener = () => {
    conn.close();
    process.exit();
  };
  process.once('SIGINT', SIGINTListener);
  return SIGINTListener;
};

const createConnection = config => Promise.resolve(amqplib.connect(config.url,
  config.socketOptions)).tap(closeConnOnSIGINT);

const createChannel = conn => Promise.resolve(conn.createChannel());

const createSimpleQueue = (ch, name, options) => {
  return Promise.resolve(ch.assertQueue(name, options)).then(q => {
    q.channel = ch;
    q.send = (msg, opts) =>
      Promise.resolve(q.channel.sendToQueue(q.queue, new Buffer(msg), opts));
    return q;
  });
};

const createReqResQueue = (ch, name, options) => {
  const _opts = options || {};
  const requestQueue = createSimpleQueue(ch, name,
    _.defaults(_opts.request || {}));

  const responseQueue = createSimpleQueue(ch,
    _opts ? _opts.responseQueue : '',
    _.defaults(_opts.response || {}, {
      exclusive: true
    }));

  const events = new EventEmitter();

  const consumer = responseQueue.then(res => Promise.resolve(ch.consume(res.queue,
    msg => events.emit(msg.properties.correlationId || 'msg', msg),
    _.defaults(_opts.consumer || {}, {
      noAck: true
    })))
  );

  return Promise.join(requestQueue, responseQueue, consumer, (req, res) => ({
    name,
    req,
    res,
    events,
    channel: ch,
    request: (msg, opts) => {
      const corr = cuid();
      let listener;

      const request = req.send(msg, _.defaults({
        correlationId: corr,
        replyTo: res.queue
      }, opts));

      const reply = new Promise(resolve => {
        listener = resolve;
        events.once(corr, resolve);
      }).timeout(_opts.timeout || 5000, corr + ' response timed out');

      reply.catch(Promise.TimeoutError, () =>
        events.removeListener(corr, listener));

      return Promise.join(reply, request, message => message);
    }
  }));
};

module.exports = {
  createConnection,
  createChannel,
  createSimpleQueue,
  createReqResQueue
};
