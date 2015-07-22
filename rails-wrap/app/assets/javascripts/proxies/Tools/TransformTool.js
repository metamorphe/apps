

var values = {
	paths: 5,
	minPoints: 5,
	maxPoints: 15,
	minRadius: 30,
	maxRadius: 90
};

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

var selectionRectangleScale=null;
var selectionRectangleScaleNormalized=null;
var selectionRectangleRotation=null;

var segment, path, selectionRectangleSegment;
var movePath = false;


function TransformTool(paper){
	this.paper = paper;
	this.selectedPoint = null;
	this.selectedHandle = null;
	this.selectedStroke = null;
	this.activeSelectionRectangle = null;
	this.tool = new paper.Tool();

	this.tool.distanceThreshold = 10;

	var scope = this;

	this.tool.onMouseDown = function(event){
		segment = path = null;
		var hitResult = paper.project.hitTest(event.point, hitOptions);
		
		if (!hitResult){
			console.log("no hit")
			if(!_.isNull(scope.activeSelectionRectangle)){
	        	scope.activeSelectionRectangle.remove();
	        	scope.activeSelectionRectangle = null;
	        }
			scope.selectedStroke = null;
			return;
		}
		
		if (hitResult) {
			path = hitResult.item;

			if(!_.isNull(scope.activeSelectionRectangle) && scope.activeSelectionRectangle.id != path.id && scope.selectedStroke.id != path.id){
				scope.activeSelectionRectangle.remove();
				scope.activeSelectionRectangle = null;	
			}	


			if(_.isNull(scope.activeSelectionRectangle)){

				scope.activeSelectionRectangle = factory.wirepaths.at(path.id).selection_rectangle;
				scope.activeSelectionRectangle.position = path.bounds.center.clone();
				
				scope.activeSelectionRectangle.rotation = 0;
				scope.activeSelectionRectangle.prevScale = scope.activeSelectionRectangle.ppath.scaling;
				scope.activeSelectionRectangle.prevRot = scope.activeSelectionRectangle.ppath.rotation;
				scope.paper.project.activeLayer.addChild(scope.activeSelectionRectangle);
				scope.selectedStroke = path;
			}
			

			if (hitResult.type == 'segment') {
				if(scope.activeSelectionRectangle != null && path.name == "selection rectangle")
				{
	                console.log('selectionRectangle');
	                if(hitResult.segment.index >= 2 && hitResult.segment.index <= 4)
	                {
	                    selectionRectangleRotation = 0;
	                }
	                else
	                {
	                   
						selectionRectangleScale =  0;
                
	                }
				}
	            else
	                segment = hitResult.segment;
			} 
		}

	
	}
	
	this.tool.onMouseUp = function(event){
		selectionRectangleScale = null;
    	selectionRectangleRotation = null;		
	}
	this.tool.onMouseMove = function(event){
		paper.project.activeLayer.selected = false;
		if (event.item)
		{
			event.item.selected = true;
		}
	    if(scope.activeSelectionRectangle)
	        scope.activeSelectionRectangle.selected = true;
	}

	this.tool.onMouseDrag = function(event){
		if (selectionRectangleScale!=null)
		{	
			var path_bounds = scope.activeSelectionRectangle.ppath.bounds.clone();//.expand(10);         
			var diag = event.point.subtract(path_bounds.center.clone()).length;
			var init_diag =  scope.activeSelectionRectangle.wire.init_size;
			
			var ratio = diag/init_diag;
			var rect_ratio = ratio;
			rect_ratio /= scope.activeSelectionRectangle.prevScale.x;
			
	        console.log("ratio", ratio, "diag", diag, "init", scope.activeSelectionRectangle.wire.init_size);
	        scaling = new paper.Point(ratio, ratio);
	        rect_scaling = new paper.Point(rect_ratio, rect_ratio);

	        scope.activeSelectionRectangle.scaling = rect_scaling;
	        scope.activeSelectionRectangle.ppath.scaling = scaling;
	        return;
		}
		else if(selectionRectangleRotation!=null)
		{
	        rotation = event.point.subtract(selectionRectangle.pivot).angle + 90;
	        scope.activeSelectionRectangle.ppath.rotation = rotation;
	        scope.activeSelectionRectangle.rotation = rotation - scope.activeSelectionRectangle.prevRot ;
	        return;
		}


		if(!_.isNull(scope.activeSelectionRectangle)){
		  scope.activeSelectionRectangle.position.x += event.delta.x;
		  scope.activeSelectionRectangle.position.y += event.delta.y;
		}
		if(!_.isNull(scope.selectedStroke)){
		  scope.selectedStroke.position.x += event.delta.x;
		  scope.selectedStroke.position.y += event.delta.y;
		}
	}		
}


TransformTool.prototype = {
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