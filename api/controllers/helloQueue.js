'use strict';

const util = require('util');
const amqp = require('../../lib/amqp');

const ctrl = module.exports = {
  init: (conn, config) => {
    return amqp.createChannel(conn)
      .then(ch => amqp.createSimpleQueue(ch, config.name || 'hello_queue'))
      .tap(queue => ctrl.queue = queue);
  },
  hello: (req, res, next) => {
    const name = req.swagger.params.name.value || 'stranger';
    const msg = util.format('Hello, %s!', name);

    if (!ctrl.queue) {
      next(new Error('controller not initialized'));
    }
    ctrl.queue.send(msg)
      .then(() => res.json(msg))
      .catch(err => next(err));
  }
};
