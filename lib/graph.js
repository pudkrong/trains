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

  /**
   * Loads a route via file.
   * File shuld follow this format i.e. AB5, AC6 where as A,B, C are Node and 5, 6 are distance between 2 nodes
   *
   * @param      {String}  path    The path to route file
   */
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

  /**
   * Add distance from Node A to B with distance
   * @param     {Node}    from     From Node
   * @param     {Node}    to       To Node
   * @param     {Number}  distance Distance between From to To nodes
   * return     {Graph}   For chainable
   */
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

  /**
   * Get distance for give nodes
   * @param  {Array(Node)}           nodes Array of Node
   * @return {Number|String}    Distance via each node or 'NO SUCH ROUTE' if cannot find any route
   */
  getDistance (nodes) {
    if (nodes.length < 2) throw new CustomError(`Please specify both start and destination nodes`);
    if ((nodes.length == 2) && (nodes[0].id == nodes[1].id)) return 0;

    const result = this._traverse(nodes, 0);

    return (result) ? result : 'NO SUCH ROUTE';
  }

  _traverse (nodes, acc) {
    const start = nodes.shift();
    const to = nodes[0];
    const weight = this._getDistanceFromNodeToNode(start, to);

    if (weight === null) return null;

    if (nodes.length != 1) {  
      return this._traverse(nodes, acc + weight);
    } else {
      return acc + weight;
    }
  }

  _getDistanceFromNodeToNode (start, to) {
    const edge = this.routes.get(start.id);
    if (!edge) return null;

    const data = edge.next.get(to.id);
    return data ? data.weight : null;
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

  /**
   * Get all routes with the given max stops
   * @param  {Node}           start         Start Node
   * @param  {Node}           destination   Destination Node
   * @param  {Number}         max           Maximum stops
   * @return {Array(Object)}                Array of object { path: [id, id], cost: Number }
   */
  getAllPathsWithMaxStops (start, destination, max) {
    const paths = this._findAllPathsWithMaxStops(start, destination, max);
    const filteredPaths = paths.filter((path) => {
      return (path.path.length > 1);
    });

    return filteredPaths;
  }

  /**
   * Get all routes with exact stops
   * @param  {Node}           start         Start Node
   * @param  {Node}           destination   Destination Node
   * @param  {Number}         max           Number of stops
   * @return {Array(Object)}                Array of object { path: [id, id], cost: Number } 
   */
  getAllPathsWithExactStops (start, destination, max) {
    const paths = this._findAllPathsWithMaxStops(start, destination, max);
    const filteredPaths = paths.filter((path) => {
      return (path.path.length == (max + 1));
    });

    return filteredPaths;
  }

  /**
   * Get all routes that have less than the given distance
   * @param  {Node}           start         Start Node
   * @param  {Node}           destination   Destination Node
   * @param  {Number}         max           Number of stops
   * @return {Array(Object)}                Array of object { path: [id, id], cost: Number } 
   */
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

  /**
   * Get shortest route for the given start and destination nodes
   * @param  {Node}           start         Start Node
   * @param  {Node}           destination   Destination Node
   * @return {Object}                       Object { path: [id, id], cost: Number } 
   */
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
