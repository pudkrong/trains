# Graph

### Prerequisition
Node version 6.5.0 or later

### Installation
```
$ npm install
$ npm test
```

### Thought

There are 3 main components in this project as following

1. `Node` represents a town
2. `Edge` represents a route for a `Node`
3. `Graph` contains all logics to calculate routes

### Edge
Edge object presents routes of a Node to other Nodes with weight
```
{
  id: 'id',
  node: Node,
  next: Map { 
    node: Node,
    weight: 1
  }
}
```

### Graph
Graph object has main functions as following

#### addRoute (from, to, distance) 
`addRoute` will create Edge object for the given data

#### getDistance ([Node])
`getDistance` will traverse via edge

#### _findAllPathsWithMaxStops (start, destination, max)
`_findAllPathsWithMaxStops` is used to find all possible routes from start to destination with stops less than or equal the given max. It will return all routes with its cost including ones with same start and destination.

### getAllPathsWithMaxStops (start, destination, max)
`getAllPathsWithMaxStops` will use internal function `_findAllPathsWithMaxStops` to get all routes, then filter out one with same start and destination.

### getAllPathsWithExactStops (start, destination, max)
`getAllPathsWithExactStops` will use internal function `_findAllPathsWithMaxStops` to get all routes, then filter onces with have the same given stops.

### getShortestPath (start, destination)
`getAllPathsWithExactStops` will use internal function `_findAllPathsWithMaxStops` to get all routes. However, the tricky part is the max stops to pass in. The worst case is the stops will be the same as number of nodes.

### getAllPathsLessThanMaxDistance (start, destination, max)
We can use `_findAllPathsWithMaxStops` to find all routes. However, the tricky part is the max stops to pass in. We can calculate based on the assumption that the max stop will be the max distance deviding by the shortest path between 2 towns.

