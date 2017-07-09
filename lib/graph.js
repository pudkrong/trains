const CustomError = require('./custom-error');
const Node = require('./node');
const Edge = require('./edge');
const fs = require('fs');

class Graph {
  constructor () {
    // Keep all edges
    this.routes = new Map();
    // Keep all nodes
    this.nodes = new Map();
  }

  loadRouteViaFile (path) {
    const data = fs.readFileSync(path, { encoding: 'utf8' });
    const routes = data.split(',');
    routes.forEach((route) => {
      route = route.replace(/^\s+|\s+$/g, '');
      const matches = /^(\w)(\w)(\d+)$/g.exec(route);
      if (matches) {
        const startId = matches[1].toLowerCase();
        const startName = matches[1];
        const toId = matches[2].toLowerCase();
        const toName = matches[2];

        const startNode = this.nodes.get(startId) || new Node(startId, startName);
        const toNode = this.nodes.get(toId) || new Node(toId, toName);

        this.addRoute(startNode, toNode, Number(matches[3]));
      } else {
        console.error(`Invalid input "${route}"`);
      }
    });
  }

  addRoute (from, to, distance) {
    let edge = this.routes.get(from.id);
    if (!edge) {
      edge = new Edge(from, to, distance);
      this.routes.set(edge.id, edge);
    } else {
      edge.addDestination(to, distance);
    }

    this.nodes.set(from.id, from);
    this.nodes.set(to.id, to);

    return this;
  }

  getDistance (nodes) {
    if (nodes.length < 2) throw new CustomError(`Please specify both start and destination nodes`);
    if ((nodes.length == 2) && (nodes[0].id == nodes[1].id)) return 0;

    let distance = 0;
    let success = true;
    let current = nodes.shift(), next;
    while (current && nodes.length) {
      const currentEdge = this.routes.get(current.id);

      const next = nodes.shift();
      const nextEdge = currentEdge.next.get(next.id);
      if (nextEdge) {
        distance += nextEdge.weight;
        current = next;
      } else {
        success = false;
        break;
      }
    }

    return (success) ? distance : 'NO SUCH ROUTE';
  }

  _findAllPathsWithMaxStops (start, destination, max) {
    const stack = [];
    const paths = [];
    stack.push({ node: start, path: [start.id], cost: 0 });

    let next = stack.shift();
    while (next) {
      if (next.node.id == destination.id) {
        paths.push({ path: next.path, cost: next.cost });
      }

      if (next.path.length > max) {
        next = stack.shift();
        continue;
      }

      let edge = this.routes.get(next.node.id);
      if (edge) {
        edge.next.forEach((nextNode) => {
          stack.push({ node: nextNode.node, path: next.path.concat([ nextNode.node.id ]), cost: next.cost + nextNode.weight });
        });
      }

      next = stack.shift();
    }

    return paths;
  }

  getAllPathsWithMaxStops (start, destination, max) {
    const paths = this._findAllPathsWithMaxStops(start, destination, max);
    const filteredPaths = paths.filter((path) => {
      return (path.path.length > 1);
    });

    return filteredPaths;
  }

  getAllPathsWithExactStops (start, destination, max) {
    const paths = this._findAllPathsWithMaxStops(start, destination, max);
    const filteredPaths = paths.filter((path) => {
      return (path.path.length == (max + 1));
    });

    return filteredPaths;
  }

  getAllPathsLessThanMaxDistance (start, destination, max) {
    // TONOTE:: Using max stop method by assuming that the max stops will be 
    // the max distance devides by the shortest path between 2 nodes
    let shortestPathBetweenTwoNodes;
    this.routes.forEach((route) => {
      route.next.forEach((edge) => {
        if (!shortestPathBetweenTwoNodes || (shortestPathBetweenTwoNodes > edge.weight)) {
          shortestPathBetweenTwoNodes = edge.weight;
        }
      });
    });

    const paths = this.getAllPathsWithMaxStops(start, destination, Math.ceil(max / shortestPathBetweenTwoNodes));
    const filteredPaths = paths.filter((path) => {
      return path.cost < max;
    });

    return filteredPaths;
  }

  getShortestPath (start, destination) {
    // TODO:: Should use Dijkstra algorithm to find the shortest path?

    // The max number should be as number of nodes
    const paths = this._findAllPathsWithMaxStops(start, destination, this.nodes.size);
    const shortestPath = paths.reduce((acc, path) => {
      if ((path.path.length) > 1 && (!acc || (acc.cost > path.cost))) {
        acc = path;
      }

      return acc;
    }, null);

    return shortestPath;
  }
}

module.exports = Graph;
