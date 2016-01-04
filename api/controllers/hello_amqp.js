'use strict';

const util = require('util');
const Promise = require('bluebird');
const hello = {
  queueName: 'hello'
};

module.exports = {
  hello: (req, res, next) => {
    const name = req.swagger.params.name.value || 'stranger';
    const msg = util.format('Hello, %s!', name);

    if (!hello.channel) {
      hello.channel = req.amqp.conn.createChannel();
    }

    if (!hello.queue) {
      hello.queue = Promise.resolve(hello.channel).then(ch =>
        ch.assertQueue(hello.queueName, {
          durable: false
        }));
    }

    Promise.resolve(hello.channel)
      .then(ch => [ch, hello.queue])
      .spread(ch => ch.sendToQueue(hello.queueName, new Buffer(msg)))
      .then(() => res.json(msg))
      .catch(err => next(err));
  }
};
