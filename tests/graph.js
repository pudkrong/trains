'use strict';

const Graph = require('../lib/graph');
const Node = require('../lib/node');
const CustomError = require('../lib/custom-error');

describe('Graph', () => {
  let graph, a, b, c, d, e;
  before(() => {
    graph = new Graph();
    graph.loadRouteViaFile(__dirname + '/../input.txt');

    a = graph.nodes.get('a');
    b = graph.nodes.get('b');
    c = graph.nodes.get('c');
    d = graph.nodes.get('d');
    e = graph.nodes.get('e');
  });

  it('should return 9 for A-B-C', () => {
    expect(graph.getDistance([a, b, c])).to.be.equal(9);
  });

  it('should return 5 for A-D', () => {
    expect(graph.getDistance([a, d])).to.be.equal(5);
  });

  it('should return 13 for A-D-C', () => {
    expect(graph.getDistance([a, d, c])).to.be.equal(13);
  });

  it('should return 22 for A-E-B-C-D', () => {
    expect(graph.getDistance([a, e, b, c, d])).to.be.equal(22);
  });

  it('should return "NO SUCH ROUTE" for A-E-D', () => {
    expect(graph.getDistance([a, e, d])).to.be.equal('NO SUCH ROUTE');
  });

  it('should return 2 routes for C-C with maximum 3 stops', () => {
    const paths = graph.getAllPathsWithMaxStops(c, c, 3);
    expect(paths.length).to.be.equal(2);
    expect(paths).to.deep.include({ path: [ 'c', 'd', 'c' ], cost: 16 });
    expect(paths).to.deep.include({ path: [ 'c', 'e', 'b', 'c' ], cost: 9 });
  });

  it('should return 3 routes for A-C with exactly 4 stops', () => {
    const paths = graph.getAllPathsWithExactStops(a, c, 4);
    expect(paths.length).to.be.equal(3);
    expect(paths).to.deep.include({ path: [ 'a', 'b', 'c', 'd', 'c' ], cost: 25 });
    expect(paths).to.deep.include({ path: [ 'a', 'd', 'c', 'd', 'c' ], cost: 29 });
    expect(paths).to.deep.include({ path: [ 'a', 'd', 'e', 'b', 'c' ], cost: 18 });
  });

  it('should return 9 for the shortest route from A to C', () => {
    const path = graph.getShortestPath(a, c);
    expect(path.cost).to.be.equal(9);
    expect(path.path).to.deep.equal([ 'a', 'b', 'c' ]);
  });

  it('should return 9 for the shortest route from B to B', () => {
    const path = graph.getShortestPath(b, b);
    expect(path.cost).to.be.equal(9);
    expect(path.path).to.deep.equal([ 'b', 'c', 'e', 'b' ]);
  });

  it('should return 7 routes from C to C with less than 30', () => {
    const paths = graph.getAllPathsLessThanMaxDistance(c, c, 30);
    expect(paths.length).to.be.equal(7);
    expect(paths).to.deep.include({ path: [ 'c', 'd', 'c' ], cost: 16 });
    expect(paths).to.deep.include({ path: [ 'c', 'e', 'b', 'c' ], cost: 9 });
    expect(paths).to.deep.include({ path: [ 'c', 'e', 'b', 'c', 'd', 'c' ], cost: 25 });
    expect(paths).to.deep.include({ path: [ 'c', 'd', 'c', 'e', 'b', 'c' ], cost: 25 });
    expect(paths).to.deep.include({ path: [ 'c', 'd', 'e', 'b', 'c' ], cost: 21 });
    expect(paths).to.deep.include({ path: [ 'c', 'e', 'b', 'c', 'e', 'b', 'c' ], cost: 18 });
    expect(paths).to.deep.include({ path: [ 'c', 'e', 'b', 'c', 'e', 'b', 'c', 'e', 'b', 'c' ], cost: 27 });
  });
});
