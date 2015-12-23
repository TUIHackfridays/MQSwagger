# MQSwagger
Boilerplate for building Swagger RESTful APIs that interface and route HTTP over AMQP

## How to generate the documentation pages.

To automatically generate the documentation pages use the command:
```
npm run gen-doc
```
in the the project root.

This makes use of [jsDoc](http://usejsdoc.org/).<br />
Document your functions by adding the documentation comments directly to the source code, right along side the code itself just like the example bellow.
```javascript
/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book(title, author) {
}
```
