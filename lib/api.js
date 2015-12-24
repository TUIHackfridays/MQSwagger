const path = require('path');

const SwaggerExpress = require('swagger-express-mw');
const express = require('express');
const Promise = require('bluebird');

module.exports = config => {
  const api = express();
  const appRoot = path.resolve(__dirname, '../', config.appRoot || './');
  // returns promisified swagger middleware creation
  api.init = () => Promise.promisify(SwaggerExpress.create)({
    appRoot: appRoot, // required config
  }).then(swaggerExpress => {
    // install middleware
    swaggerExpress.register(api);
  });
  api.start = () => Promise.promisify(api.listen)(config.port);
  return api;
};
