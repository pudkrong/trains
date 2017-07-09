'use strict';

const CustomError = require('./custom-error');

class Node {
  constructor (id, name) {
    this.id = id;
    this.name = name || this.id;
  }
}

module.exports = Node;
