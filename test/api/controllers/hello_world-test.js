const should = require('chai').should();
const request = require('supertest');
process.env.ALLOW_CONFIG_MUTATIONS = true;
const config = require('config');

const amqp = require('../../../lib/amqp')(config.get('amqp'));
const api = require('../../../lib/api')(config.get('api'));

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

describe('controllers', () => {
  const apiReady = done => {
    if (api.isReady) done();
    else {
      api.once('ready', done);
    }
  };

  before(done => apiReady(done));

  describe('hello_world', () => {
    describe('GET /hello', () => {
      it('should return a default string', done => {
        request(api).get('/hello')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);

            res.body.should.eql('Hello, stranger!');

            done();
          });
      });

      it('should accept a name parameter', done => {
        request(api)
          .get('/hello')
          .query({
            name: 'Scott'
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);

            res.body.should.eql('Hello, Scott!');

            done();
          });
      });
    });
  });
});
