// where the magic happens

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
		
		var fn = document.getElementById("fn").value;
		
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "model.php?fn="+encodeURIComponent(fn), true);
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
				
				function closeModels() {
					document.body.removeChild(models);
					document.getElementById("content").setAttribute("class", "");
				}
				
				var close = document.createElement("div");
				close.setAttribute("class", "close");
				close.addEventListener("click", function() {
					closeModels();
				});
				models.appendChild(close);
				
				this.response.forEach(function(modelname) {
					var modelXhr = new XMLHttpRequest();
					modelXhr.responseType = 'json';
					modelXhr.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							var model = document.createElement("div");
							model.setAttribute("class", "model");
							
							models.appendChild(model);
							
							var res = modelXhr.response;
							
							var tinyCanvas = document.createElement("canvas");
							tinyCanvas.setAttribute("class", "framed");
							var tinyRenderer = Renderer({
								w: res.w, h: res.h,
								tilesize: 3,
								canvas: tinyCanvas,
								grid: false
								
							});
							model.appendChild(tinyCanvas);
							
							tinyRenderer.model.loadJson(res);
							tinyRenderer.model.bfs();
							tinyRenderer.draw();
							
							var name = document.createElement("div");
							name.innerText = modelname;
							model.appendChild(name);
							
							model.addEventListener("click", function() {
								r.model = tinyRenderer.model;
								for (var algoInput of document.getElementsByName("algo")) {
									if (algoInput.checked) {
										var algo = algoInput.value;
										break;
									}
								}
								r.model.setAlgo(algo);
								r.draw();
								closeModels();
							});
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