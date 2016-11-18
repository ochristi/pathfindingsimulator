var Model = function(w, h) {
// 	var w = w,
// 		h = h;
	var playarea;
	var start,
		end;
	var path,
		visited;
	var algo = function(){};
	
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
	
	function init() {
		playarea = new Array(h);
		for (var y = 0; y < h; y++) {
			playarea[y] = new Array(w);
			for (var x = 0; x < w; x++) {
				playarea[y][x] = false;
			}
		}
// 		console.log(playarea);
		algo = astar;
	}
	init();
	
	function generateMaze() {
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				playarea[y][x] = true;
			}
		}
		
		// returns neighbors with 1 cell between for walls
		function getWalledNeighbors(x, y) {
			var nbr = [];
			try {
			if (x > 1 && playarea[y][x - 2])
				nbr.push({x: x - 2, y: y});
			if (y > 1 && playarea[y - 2][x])
				nbr.push({x: x, y: y - 2});
			if (x < w - 2 && playarea[y][x + 2])
				nbr.push({x: x + 2, y: y});
			if (y < h - 2 && playarea[y + 2][x])
				nbr.push({x: x, y: y + 2});
			} catch(e) {
				console.log("error", x, y);
			}
			return nbr;
		}
		
		var i = 0;
		var maxSteps = (h-1)*(w-1)/2 - 1;
		var nodeQueue = [{x: 1+2*getRandomInt(0, w/2), y: 1+2* getRandomInt(0, h/2)}];
		
		var current = nodeQueue.shift();
		playarea[current.y][current.x] = false;
		
		while (i < maxSteps /*|| nodeQueue.length > 0*/) {
			i++;
			var nbr = getWalledNeighbors(current.x, current.y);
			
			if (nbr.length > 0) {
				var pick = nbr[getRandomInt(0, nbr.length)];
				nodeQueue.push(pick);
				playarea[(current.y + pick.y)/2][(current.x + pick.x)/2] = false;
				playarea[pick.y][pick.x] = false;
				current = pick;
			} else {
				if (nodeQueue.length > 0) {
					current = nodeQueue.shift();
				} else {
					break;
				}
			}
		}
	}
	
	function getNeighbors(x, y) {
		var nbr = [];
		if (x > 0 && !playarea[y][x - 1])
			nbr.push({x: x - 1, y: y});
		if (y > 0 && !playarea[y - 1][x])
			nbr.push({x: x, y: y - 1});
		if (x < w - 1 && !playarea[y][x + 1])
			nbr.push({x: x + 1, y: y});
		if (y < h - 1 && !playarea[y + 1][x])
			nbr.push({x: x, y: y + 1});
		return nbr;
	}
	
	function pointInArr(el) {
		return el.x == this.x && el.y == this.y;
	}
	
	function heuristic(from, to) {
		var dx = Math.abs (to.x - from.x);
		var dy = Math.abs (to.y - from.y);
		return dx + dy;
	}
	
	function dijkstra() {
		console.log("dijkstra");
		if (!(start && end)) return;
		visited = [];
//  1  function Dijkstra(Graph, source):
//  2
//  3      create vertex set Q
		var nodeQueue = [];
//  4
//  5      for each vertex v in Graph:             // Initialization
//  6          dist[v] ← INFINITY                  // Unknown distance from source to v
//  7          prev[v] ← UNDEFINED                 // Previous node in optimal path from source
//  8          add v to Q                          // All nodes initially in Q (unvisited nodes)
//  9
// 10      dist[source] ← 0                        // Distance from source to source
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				if (!playarea[y][x]) {
					if (x == start.x && y == start.y)
						nodeQueue.push({x: x, y: y, d: 0, pre: undefined});
					else
						nodeQueue.push({x: x, y: y, d: Number.MAX_SAFE_INTEGER, pre: undefined});
				}
			}
		}
// 11      
// 12      while Q is not empty:
		while (nodeQueue.length > 0) {
			var bestId = 0;
// 			var bestD = Number.MAX_SAFE_INTEGER;
// 13          u ← vertex in Q with min dist[u]    // Source node will be selected first
// 14          remove u from Q 
			var best = nodeQueue[0];
			for (var i = 0; i < nodeQueue.length; i++) {
				if (nodeQueue[i].d < best.d) {
					best = nodeQueue[i];
					bestId = i;
				}
			}
			
			best = nodeQueue.splice(bestId, 1)[0];
			visited.push(best);
			
			if (best.x == end.x && best.y == end.y) {
				path = [];
// 				console.log("finished", best);
				var pre = best.pre;
				while (pre.x != start.x || pre.y != start.y) {
					path.push(pre);
// 					console.log("step", pre);
					pre = pre.pre;
				}
				return;
			}
// 15          
// 16          for each neighbor v of u:           // where v is still in Q.
// 17              alt ← dist[u] + length(u, v)
// 18              if alt < dist[v]:               // A shorter path to v has been found
// 19                  dist[v] ← alt 
// 20                  prev[v] ← u 
// 21
			var nbr = getNeighbors(best.x, best.y);
			nbr.forEach(function(n) {
				var nInQ = nodeQueue.find(pointInArr, n);
				if (!nInQ) return;
				if (best.d + 1 < nInQ.d) {
					nInQ.d = best.d + 1;
					nInQ.pre = best;
				}
			});
		}
// 22      return dist[], prev[]
	}
	
	function astar() {
		console.log("astar");
		if (!(start && end)) return;
		// node: d=curent distance, e=expected (current cost + heuristic)
		visited = [];
		var nodeQueue = [start]; // sorted list by current cost
		start.d = 0;
		
		while (nodeQueue.length > 0) {
			var current = nodeQueue.shift();
			// reached goal
			if (current.x == end.x && current.y == end.y) {
				// TODO mark path
				path = [];
				console.log("finished", current);
				var pre = current.pre;
				while (pre.x != start.x || pre.y != start.y) {
					path.push(pre);
					pre = pre.pre;
				}
				return;
			}
			
			visited.push(current);
			
			var nbr = getNeighbors(current.x, current.y);
// 			console.log(nbr);
			
			nbr.forEach(function(n) {
// 				console.log(n);
				// we do not process visited neighbors
				if (visited.find(pointInArr, n)) {
					return;
				}
				var pathDst = current.d + 1;
				var nInQ = nodeQueue.find(pointInArr, n);
				var update = true;
				if (!nInQ) {
					nodeQueue.push(n);
					nInQ = n;
					nInQ.d = pathDst;
				} else if (pathDst < nInQ.d) {
				} else {
					update = false;
				}
				if (update) {
					nInQ.pre = current;
					nInQ.d = pathDst;
					var h = heuristic(nInQ, end);
					nInQ.e = nInQ.d + h;
				}
			});
			nodeQueue.sort(function(a, b) {
				return a.e - b.e;
			});
		}
	}
	
	function setStartEnd(x, y) {
		if(playarea[y][x])
			return;
		if (start) {
			if (end) {
				start = {x: x, y: y};
				end = undefined;
				path = [];
			} else {
				end = {x: x, y: y};
				algo();
			}
		} else {
			start = {x: x, y: y};
		}
// 		console.log(start, end);
	}
	
	function inRange(v, l, u) {
		return v >= l && v < u;
	}
	
	function changeTile(x, y, state) {
		if (inRange(x, 0, w) && inRange(y, 0, h))
			playarea[y][x] = state;
	};
	
	return {
		w: w,
		h: h,
		get start() {
			return start;
		},
		get end() {
			return end;
		},
		get path() {
			return path;
		},
		get visited() {
			return visited;
		},
		playarea: playarea,
		setTile: function(x, y) {
			changeTile(x, y, true);
			if (start && end) algo();
		},
		unsetTile: function(x, y) {
			changeTile(x, y, false);
			if (start && end) algo();
		},
		setStartEnd: setStartEnd,
		astar: astar,
		dijkstra: dijkstra,
		setAlgo: function(algoStr) {
			console.log("switching to", algoStr);
			switch(algoStr) {
				case "astar":
					algo = astar;
					break;
				case "dijkstra":
					algo = dijkstra;
					break;
				default:
			}
			algo();
		},
		generateMaze: generateMaze
	}
};
