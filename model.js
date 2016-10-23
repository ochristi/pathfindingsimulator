var Model = function(w, h) {
// 	var w = w,
// 		h = h;
	var playarea;
	var start,
		end;
	var path;
	
	function init() {
		playarea = new Array(h);
		for (var y = 0; y < h; y++) {
			playarea[y] = new Array(w);
			for (var x = 0; x < w; x++) {
				playarea[y][x] = false;
			}
		}
// 		console.log(playarea);
	}
	init();
	
	function getNeighbors(x, y) {
		var nbr = [];
		if (x > 1 && !playarea[y][x - 1])
			nbr.push({x: x - 1, y: y});
		if (y > 1 && !playarea[y - 1][x])
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
	
	function astar() {
		if (!(start && end)) return;
		var visited = [];
		var nodeQueue = [start]; // sorted list by current cost
		
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
				} else if (pathDst < nInQ.d) {
				} else {
					update = false;
				}
				if (update) {
					nInQ.pre = current;
					nInQ.d = pathDst;
					nInQ.e = nInQ.d + heuristic(nInQ, end);
				}
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
				astar();
			}
		} else {
			start = {x: x, y: y};
		}
		console.log(start, end);
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
		playarea: playarea,
		setTile: function(x, y) {
			changeTile(x, y, true);
			if (start && end) astar();
		},
		unsetTile: function(x, y) {
			changeTile(x, y, false);
		},
		setStartEnd: setStartEnd,
		astar: astar
	}
};

var m = Model(15, 15);