'use strict';

const util = require('util');

/*
 Once you 'require' a module you can reference the things that it exports.
 These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions
 referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has
  an operationId named 'hello'.  Here, we specify that in the exports of this
  module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  /**
  * Hello controller function.<br />
  * Functions in a127 controllers used for operations should take two parameters:
  *
  * @alias hello
  * @param {object} req - A handle to the request object
  * @param {object} res - A handle to the response object
  *
  * @return {void}
 */
  hello: (req, res) => {
    // variables defined in the Swagger document can be referenced using
    //  req.swagger.params.{parameter_name}
    const name = req.swagger.params.name.value || 'stranger';
    const hello = util.format('Hello, %s!', name);

    // this sends back a JSON response which is a single string
    res.json(hello);
  }
};
