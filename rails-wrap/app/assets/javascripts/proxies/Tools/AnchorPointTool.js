function AnchorPointTool(paper){
	this.paper = paper;
	this.selectedPoint = null;
	this.selectedHandle = null;
	this.selectedStroke = null;
	this.tool = new paper.Tool();

	this.tool.distanceThreshold = 10;
	
	var scope = this;

	this.tool.onMouseDown = function(event){
		hitResult = scope.paper.project.hitTest(event.point, {segments: true, stroke: true, handles: true});
		console.log(hitResult);
		if(! _.isNull(hitResult)){
			if(hitResult.type == "segment"){
				scope.selectedPoint = hitResult.segment.point;
				hitResult.item.fullySelected = true;
			}
			else if(hitResult.type == "handle-in"){
				scope.selectedHandle = hitResult.segment.handleIn;
			}
			else if(hitResult.type == "handle-out"){
				scope.selectedHandle = hitResult.segment.handleOut;
			}
			else if(hitResult.type == "stroke"){
				var selected = hitResult.item.selected;
				var fullySelected = hitResult.item.fullySelected;
				scope.selectAll(false);

				if(fullySelected)
					hitResult.item.selected = false;
				else if(selected)
					hitResult.item.fullySelected = true;
				else
					hitResult.item.selected = true;

				scope.selectedStroke = hitResult.item;
				factory.activePath = scope.selectedStroke.id;
				factory.wirepaths.at(factory.activePath).updateDOM();
				factory.wirepaths.at(factory.activePath).updateHandles();
			}
		}else{
			scope.selectAll(false);
			scope.selectedStroke = null;
		}
		scope.update();
	}

	this.tool.onMouseUp = function(event){
		scope.selectedPoint = null;
		scope.selectedHandle = null;
		// scope.selectedStroke = null;
		scope.update();
	}

	this.tool.onMouseDrag = function(event){
		if(scope.selectedPoint){
			scope.selectedPoint.x += event.delta.x;
			scope.selectedPoint.y += event.delta.y;
		}
		if(scope.selectedHandle){
			scope.selectedHandle.x += event.delta.x;
			scope.selectedHandle.y += event.delta.y;
		}
		scope.update();
	}	
}


AnchorPointTool.prototype = {
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