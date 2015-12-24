const config = {
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
};
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('../logger')(config);
chai.should();
chai.use(sinonChai);

describe('logger', () => {
  describe('promised logging', () => {
    it('should be called once', done => {
      const spy = sinon.spy();
      logger.on('logging', spy);
      logger.debug('debug test').then(() => {
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
      logger.verbose('verbose test').then(() => {
        spy.should.have.callCount(2);
        setTimeout(() => {
          spy.should.have.callCount(2);
          done();
        }, 250);
      });
    });
  });
});
