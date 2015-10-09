function JuneTool(paper){
	this.paper = paper;
	this.selectedPoint = null;
	this.selectedHandle = null;
	this.selectedStroke = null;
	this.tool = new paper.Tool();

	this.tool.distanceThreshold = 10;
	
	var scope = this;
	var path;

	this.tool.onMouseDown = function(event){
		path = new Path();
		path.strokeColor = '#00000';
		path.add(event.point);
	}

	this.tool.onMouseUp = function(event){
	}

	this.tool.onMouseDrag = function(event){
		path.add(event.point);
	}	
}


Vector.prototype = {
	update: function(){
		this.paper.view.update();
	}, 
	selectAll: function(flag){
		this.paper.project.activeLayer.selected = flag;
	}, 
	setSVG: function(svg){
		this.svg = svg;
	}
}