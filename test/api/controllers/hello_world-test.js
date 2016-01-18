const should = require('chai').should();
const request = require('supertest');

const api = require('../../app');

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
