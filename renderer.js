var Renderer = function(options) {
	
	var canvas,
		ctx,
		model,
		tilesize,
		clickHandler,
		grid = true,
		g;
	
	function loadOptions() {
		if (options) {
			model = Model(options.w, options.h);
			tilesize = options.tilesize;
			canvas = options.canvas;
			if (options.grid !== undefined) grid = options.grid;
		} else {
			model = Model(55, 35);
			tilesize = 10;
		}
		g = grid ? 1 : 0;
	}
		
	function init() {
		loadOptions();
		
		if (!canvas) {
			canvas = document.createElement("canvas");
			canvas.id = "simulationarea";

			document.getElementById("canvascontainer").appendChild(canvas);
			canvas.addEventListener("click", clickHandler, false);
		}
		canvas.width = model.w * (tilesize + g) - 1;
		canvas.height = model.h * (tilesize + g) - 1;
		ctx = canvas.getContext("2d");
		
		ctx.fillStyle = "#0085c1";
		
		return ctx;
	};
	
	function clickHandler(e) {
		var x = Math.floor(e.offsetX / (tilesize + g));
		var y = Math.floor(e.offsetY / (tilesize + g));
//  		console.log(e);
		if (e.ctrlKey) {
			if (e.altKey)
				model.setEnd(x,y);
			else
			 model.setStart(x,y);
		} else if (e.shiftKey) {
			model.unsetTile(x,y);
		} else {
			model.setTile(x, y);
		}
		draw();
	};
	
	function fillTile(x, y) {
		ctx.fillRect(x * (tilesize+g), y * (tilesize+g), tilesize, tilesize);
	};
	
	function drawGrid() {
		if (!grid) return;
		var previousStyle = ctx.strokeStyle;
		ctx.strokeStyle = "lightgrey";
		for (var y = 1; y < model.h; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * (tilesize+g) - 0.5);
			ctx.lineTo(model.w * (tilesize + g), y * (tilesize+g) - 0.5);
			ctx.stroke();
		}
		for (var x = 1; x < model.w; x++) {
			ctx.beginPath();
			ctx.moveTo(x * (tilesize+g) - 0.5, 0);
			ctx.lineTo(x * (tilesize+g) - 0.5, model.h * (tilesize + g));
			ctx.stroke();
		}
		ctx.strokeStyle = previousStyle;
	}
	
	function drawVisited() {
		var visited = 0;
		
		var previousStyle = ctx.fillStyle;
		ctx.fillStyle = "#9cd6ff";
		if (model.visited) {
			model.visited.forEach(function(el) {
				visited++;
				fillTile(el.x, el.y);
			});
			document.getElementById("visited").value = visited;
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
		var length = 1; // count of steps not path tiles
		var previousStyle = ctx.fillStyle;
		ctx.fillStyle = "#ffc164";
		if (model.path) {
			model.path.forEach(function(el) {
				length++;
				fillTile(el.x, el.y);
			});
			document.getElementById("length").value = length;
		}
		ctx.fillStyle = previousStyle;
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid();
		drawVisited();
		drawStartEnd();
		drawPath();
		
		console.log(model.playarea);
		
		for (var y = 0; y < model.h; y++) {
			for (var x = 0; x < model.w; x++) {
				if(model.playarea[y][x]) {
					fillTile(x, y);
				}
			}
		}
		document.getElementById("computationTime").value = model.computationTime ? model.computationTime.toFixed(3) + " ms" : "";
		
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
	r.draw();
	
	
	for (var el of document.getElementsByName("algo")) {
		el.addEventListener("click", function(e, target) {
			r.model.setAlgo(e.target.value);
			r.draw();
		}, false);
	};
	
	var mazeButton = document.getElementById("maze");
	mazeButton.addEventListener("click", function() {
		r.model.generateMaze();
		r.draw();
	});
	
	var dungeonButton = document.getElementById("dungeon");
	dungeonButton.addEventListener("click", function() {
		r.model.generateDungeon();
		r.draw();
	});
	
	var simpleButton = document.getElementById("simple");
	simpleButton.addEventListener("click", function() {
		r.model.generateSimple();
		r.draw();
	});
	
	var saveButton = document.getElementById("save");
	saveButton.addEventListener("click", function() {
		var serializedModel = r.model.toJson();
		
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "model.php", true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

		xhr.send(serializedModel);
	});
	
	var loadButton = document.getElementById("load");
	loadButton.addEventListener("click", function() {
		console.log("bbbep");
		var serializedModel = r.model.toJson();
		
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log(this.response);
				document.getElementById("content").setAttribute("class", "blur");
				var models = document.createElement("div");
				models.id = "models";
				
				this.response.forEach(function(modelname) {
					var modelXhr = new XMLHttpRequest();
					modelXhr.responseType = 'json';
					modelXhr.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							var model = document.createElement("div");
							model.setAttribute("class", "model");
							var name = document.createElement("div");
							name.innerText = modelname;
							
							models.appendChild(model);
							models.appendChild(name);
							
							var r = modelXhr.response;
							
							var tinyCanvas = document.createElement("canvas");
							tinyCanvas.setAttribute("class", "framed");
							var tinyRenderer = Renderer({
								w: r.w, h: r.h,
								tilesize: 3,
								canvas: tinyCanvas,
								grid: false
								
							});
							model.appendChild(tinyCanvas);
							tinyRenderer.model.loadJson(r);
							console.log(r);
							tinyRenderer.model.bfs();
							tinyRenderer.draw();
						}
					};
					modelXhr.open("GET", "models/" + modelname, true);
					modelXhr.send();
					
				});
				document.body.appendChild(models);
			}
		};
		
		xhr.open("GET", "model.php", true);
		xhr.send();
	});
}, false);