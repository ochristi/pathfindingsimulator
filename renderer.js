var Renderer = function() {
	
	var canvas,
		ctx;
	var model = Model(23, 17);
	var tilesize = 15;
	var clickHandler;
		
	function init() {
		canvas = document.createElement("canvas");
		canvas.id = "simulationarea";
		ctx = canvas.getContext("2d");

		canvas.width = model.w * (tilesize + 1) - 1;
		canvas.height = model.h * (tilesize + 1) - 1;
		document.body.appendChild(canvas);
		
		ctx.fillStyle = "#0085c1";
		
		canvas.addEventListener("click", clickHandler, false);
		
		document.getElementsByName("algo").forEach(function(el) {
			el.addEventListener("click", function(e, target) {
// 				console.log(e.target.value);
				model.setAlgo(e.target.value);
				draw();
			}, false);
		});
		
		return ctx;
	};
	
	function clickHandler(e) {
		var x = Math.floor(e.offsetX / (tilesize + 1));
		var y = Math.floor(e.offsetY / (tilesize + 1));
//  		console.log(e);
		if (e.ctrlKey) {
			model.setStartEnd(x,y);
		} else if (e.shiftKey) {
			model.unsetTile(x,y);
		} else {
			model.setTile(x, y);
		}
		draw();
	};
	
	function fillTile(x, y) {
		ctx.fillRect(x * (tilesize+1), y * (tilesize+1), tilesize, tilesize);
	};
	
	function drawGrid() {
		var previousStyle = ctx.strokeStyle;
		ctx.strokeStyle = "lightgrey";
		for (var y = 1; y < model.h; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * (tilesize+1) - 0.5);
			ctx.lineTo(model.w * (tilesize + 1), y * (tilesize+1) - 0.5);
			ctx.stroke();
		}
		for (var x = 1; x < model.w; x++) {
			ctx.beginPath();
			ctx.moveTo(x * (tilesize+1) - 0.5, 0);
			ctx.lineTo(x * (tilesize+1) - 0.5, model.h * (tilesize + 1));
			ctx.stroke();
		}
		ctx.strokeStyle = previousStyle;
	}
	
	function drawVisited() {
		var previousStyle = ctx.fillStyle;
		ctx.fillStyle = "#9cd6ff";
		if (model.visited) {
			model.visited.forEach(function(el) {

				fillTile(el.x, el.y);
			});
		}
		ctx.fillStyle = previousStyle;
	}
	
	
	function drawStartEnd() {
		var previousStyle = ctx.fillStyle;
		if (model.start) {
			ctx.fillStyle = "#73d600";
			fillTile(model.start.x, model.start.y);
		}
		if (model.end) {
			ctx.fillStyle = "#d80f00";
			fillTile(model.end.x, model.end.y);
		}
		ctx.fillStyle = previousStyle;
	}
	
	function drawPath() {
		var previousStyle = ctx.fillStyle;
		ctx.fillStyle = "#ffc164";
		if (model.path) {
			model.path.forEach(function(el) {
				fillTile(el.x, el.y);
			});
		}
		ctx.fillStyle = previousStyle;
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid();
		drawVisited();
		drawStartEnd();
		drawPath();
		for (var y = 0; y < model.h; y++) {
			for (var x = 0; x < model.w; x++) {
				if(model.playarea[y][x])
					fillTile(x, y);
			}
		}
	};
	
	init();
	drawGrid();
	return {
		model: model,
		draw: draw
	}
};

var r;

window.addEventListener("DOMContentLoaded", function() {
	r = Renderer();
// 	r.model.setTile(2, 3);
// 	r.model.setTile(3, 4);
// 	r.model.setTile(4, 3);
	r.draw();
	
	var mazeButton = document.getElementById("maze");
	mazeButton.addEventListener("click", function() {
		r.model.generateMaze();
		r.draw();
	});
}, false);