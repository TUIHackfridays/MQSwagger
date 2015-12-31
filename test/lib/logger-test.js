const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

const logger = require('../../lib/logger')({
  levels: {
    debug: 1,
    verbose: 0
  },
  transports: {
    Debug: {
      type: 'Console',
      options: {
        level: 'debug',
        silent: true
      }
    },
    Verbose: {
      type: 'Console',
      options: {
        level: 'verbose',
        silent: true
      }
    }
  }
});

describe('logger', () => {
  describe('promised logging', () => {
    it('should be called once', done => {
      const spy = sinon.spy();
      logger.on('logging', spy);
      logger.promise.debug('debug test').then(() => {
        spy.should.have.callCount(1);
        setTimeout(() => {
          spy.should.have.callCount(1);
          done();
        }, 250);
      });
    });

    it('should be called twice', done => {
      const spy = sinon.spy();
      logger.on('logging', spy);
      logger.promise.verbose('verbose test').then(() => {
        spy.should.have.callCount(2);
        setTimeout(() => {
          spy.should.have.callCount(2);
          done();
        }, 250);
      });
    });
  });
});
