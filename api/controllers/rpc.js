'use strict';

const util = require('util');
const amqp = require('../../lib/amqp');

const connConfig = {
  url: 'amqp://localhost'
};

const mainConn = amqp.createConnection(connConfig);

/*
const configHello = {
  name: 'hello_queue'
};

const simpleQueue = {
  init: (conn, config) => {
    return amqp.createChannel(conn)
    .then(ch => amqp.createSimpleQueue(ch, config.name || 'hello_queue'));
  },
  hello: (queue) => {
    const name = 'Stranger';
    const msg = util.format('Hello, %s!', name);

    if (!queue) {
      Error('controller not initialized');
    }
    queue.then(q => q.send(msg))
      .then(() => console.log('[x] Sent:', msg))
      .catch(err => console.error(err));
  }
};

const queue = mainConn.then(conn => simpleQueue.init(conn, configHello));
rpcQueue.hello(queue);
*/

const configRpc = {
  name: 'rpc_queue'
};

const rpcQueue = {
  init: (conn, config) => {
    return amqp.createChannel(conn)
      .then(ch => amqp.createReqResQueue(ch, config.name || 'rpc_queue'));
  },
  rpc: (rpc) => {
    const name = 'Stranger';
    const msg = util.format('Hello, %s!', name);

    if (!rpc) {
      Error('controller not initialized');
    }
    rpc.then(q => q.request(msg))
      .then(() => console.log('[x] Sent:', msg))
      .catch(err => console.error(err));
  }
};

const rpc = mainConn.then(conn => rpcQueue.init(conn, configRpc));
rpcQueue.rpc(rpc);

/*
const util = require('util');
const Promise = require('bluebird');
const Rx = require('rx');
const cuid = require('cuid');
const config = require('config').get('rpc');
// TODO: How should the client react if there are no servers running?

const ctrl = module.exports = {
  init: (AMQPconn, config) => {
    Promise.resolve(AMQPconn.createChannel()).then(ch => {

    });
    rpc.channel = amqp.conn.createChannel();
    rpc.replyQueue = Promise.resolve(rpc.channel).then(ch =>
      // random queue name generated for empty strings used to send replys to
      ch.assertQueue('', {
        // Queue only active while this process is alive, it will not perserve
        // replies to dead requests
        exclusive: true
      }));
    rpc.consumer = Promise.join(rpc.channel, rpc.replyQueue, (ch, q) =>
      ch.consume(q.queue, msg => {
        // TODO: create observable
      }, {noAck: true}));
  },
  rpc: (req, res, next) => {
    const name = req.swagger.params.name.value || 'stranger';
    const msg = util.format('Hello, %s!', name);
    const corr = cuid();

    if (!rpc.channel) {
      this.initAMQP(req.amqp);
    }

    Promise.join(rpc.channel, rpc.replyQueue, (ch, q) =>
      ch.sendToQueue(rpc.queueName, new Buffer(msg), {
        correlationId: corr,
        replyTo: q.queue
      })
    ).then(() => {
      // TODO: timeout
    }).catch(err => next(err));

    //trigger observable
  }
};
*/
