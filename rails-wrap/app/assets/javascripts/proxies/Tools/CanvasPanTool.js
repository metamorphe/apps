function CanvasPanTool(paper){
	this.paper = paper;
	this.tool = new paper.Tool();
	var scope = this;


	this.tool.onMouseDown = function(event){
		
	}

	this.tool.onMouseUp = function(event){
	
	}

	this.tool.onMouseDrag = function(event){
		console.log("Dragging", paper.view.center);
		_.each(paper.project.layers, function(el, i, arr){
			el.position.x += event.delta.x;
			el.position.y += event.delta.y;
			scope.update();
		});
	}		
}


CanvasPanTool.prototype = {
	enable: function(){
		console.log("Canvas Pan Activated");
	},
	update: function(){
		this.paper.view.update();
	}, 
	clear: function(){
		
	},
	selectAll: function(flag){
		this.paper.project.activeLayer.selected = flag;
	}, 
	setSVG: function(svg){
		this.svg = svg;
	}
}