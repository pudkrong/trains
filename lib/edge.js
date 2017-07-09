'use strict';

const CustomError = require('./custom-error');

class Edge {
  constructor (start, destination, distance) {
    this.id = start.id;
    this.node = start;
    this.next = new Map();

    this.addDestination(destination, distance);
  }

  addDestination (destination, distance) {
    if (this.node.id == destination.id) throw new CustomError(`Start and end nodes cannot be the same (${destination.name})`);

    if (this.next.has(destination.id)) throw new CustomError(`Route ${this.node.name} => ${destination.name} already exists`);

    this.next.set(destination.id, {
      node: destination,
      weight: distance
    });

    return this;
  }
}

module.exports = Edge;
