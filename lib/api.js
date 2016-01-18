'use strict';

const path = require('path');
const http = require('http');

const SwaggerExpress = require('swagger-express-mw');
const express = require('express');
const Promise = require('bluebird');

// TODO: SwaggerUi = require('swagger-tools/middleware/swagger-ui');

// returns promisified swagger middleware creation
module.exports = config => {
  const api = express();
  const appRoot = path.resolve(__dirname, '../', config.appRoot || './');
  api.swagger = () => Promise.promisify(SwaggerExpress.create,
    {context: SwaggerExpress})({appRoot}).tap(swaggerExpress =>
    // install middleware
    swaggerExpress.register(api));
  api.start = () => {
    const server = http.createServer(api);
    return Promise.fromCallback(server.listen.bind(server, config.port))
      .return(server);
  };
  return api;
};
