var path; 
function TracePathTool(paper){
	this.paper = paper;
	this.selectedPoint = null;
	this.selectedHandle = null;
	this.selectedStroke = null;
	this.tool = new paper.Tool();

	this.tool.distanceThreshold = 10;
	
	var scope = this;

	this.tool.onMouseDown = function(event){
		console.log("down");
		var components = designer.nodes.select();

		path = new paper.Path({
			strokeColor: "#C0C0C0",
			strokeWidth: 20
		});
    	path.add(event.point);
    	
    	var terminals = _.map(components, function(el, i, attr){
    		return el.terminals;
    	});
    	var terminals = _.flatten(terminals);
    	var intersects = TracePathTool.getAllInsides(path, terminals);
    	console.log("intersects", intersects);
    	if(intersects.length == 0) path.remove();
    	else path.style.strokeColor = intersects[0].style.fillColor;
    }
	this.tool.onMouseUp = function(event){
		var components = designer.nodes.select();

		var terminals = _.map(components, function(el, i, attr){
    		return el.terminals;
    	});
    	var terminals = _.flatten(terminals);
    	var intersects = TracePathTool.getAllIntersections(path, terminals);
    	
    	intersects = _.uniq(intersects);
    	console.log("intersects up", intersects);
    	console.log(path.style.strokeColor.red,  intersects[1].style.fillColor.red);
    	if(intersects.length == 0) path.remove();
    	else if(path.style.strokeColor.red != intersects[1].style.fillColor.red) path.remove();
		else path.simplify();
	}

	this.tool.onMouseDrag = function(event){
		path.add(event.point);
	}	
}


TracePathTool.prototype = {
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

TracePathTool.getAllIntersections = function(path, wires){
		intersections = _.reduce(wires, function(memo, el){
	 		var a = path.getIntersections(el);
			if(a.length > 0) memo.push(el);
			return memo;
	 	}, []);
		return _.flatten(intersections);
	} 
TracePathTool.getAllInsides = function(path, wires){
		intersections = _.reduce(wires, function(memo, el){
	 		var a = path.isInside(el.bounds);
			if(a) memo.push(el);
			return memo;
	 	}, []);
		return _.flatten(intersections);
	} 
	

