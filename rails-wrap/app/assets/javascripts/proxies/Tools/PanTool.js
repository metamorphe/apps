
var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

var selectionRectangleScale=null;
var selectionRectangleScaleNormalized=null;
var selectionRectangleRotation=null;


function PanTool(paper){
	this.paper = paper;
	this.selectedPoint = null;
	this.selectedHandle = null;
	this.selectedStroke = null;
	this.selectedCluster = null;
	this.activeSelectionRectangle = null;


	this.tool = new paper.Tool();
	this.tool.distanceThreshold = 10;

	var scope = this;


	this.tool.onMouseDown = function(event){
		hitResult = scope.paper.project.hitTest(event.point, hitOptions);
		
		if(_.isNull(hitResult)) scope.canvas_item_type = "canvas";
		else{
			path = hitResult.item;
			if(path.name == "selection rectangle") scope.canvas_item_type = "transform";
			else scope.canvas_item_type = "pan";
		} 
		console.log("MouseDown", scope.canvas_item_type);
		scope[scope.canvas_item_type].onMouseDown(event, hitResult, scope);
		scope.update();
	}

	this.tool.onMouseUp = function(event){
		console.log("MouseUp", scope.canvas_item_type);
		scope[scope.canvas_item_type].onMouseUp(event, scope);
		scope.canvas_item_type = null;
		scope.update();
	}

	this.tool.onMouseDrag = function(event){
		console.log(event);
		console.log("MouseDrag", scope.canvas_item_type);
		scope[scope.canvas_item_type].onMouseDrag(event, scope);
		scope.update();
	}		
}


PanTool.prototype = {
	update: function(){
		this.paper.view.update();
	}, 
	clear: function(){
		if(!_.isNull(this.activeSelectionRectangle)){
    		this.activeSelectionRectangle.remove();
    		this.activeSelectionRectangle = null;
    		this.selectAll(false);
			this.selectedStroke = null;
        }
		this.selectedStroke = null;
	},
	selectAll: function(flag){
		this.paper.project.activeLayer.selected = flag;
	}, 
	setSVG: function(svg){
		this.svg = svg;
	},
	transform: {
		onMouseDown: function(event, hitResult, scope){

		},
		onMouseDrag: function(event, scope){

		},
		onMouseUp: function(event, scope){

		}
	},
	canvas: {
		onMouseDown: function(event, hitResult, scope){
			scope.clear();
		},
		onMouseDrag: function(event, scope){
			scope.clear();
		},
		onMouseUp: function(event, scope){
			scope.clear();
		}
	},
	pan:  {
		onMouseDown: function(event, hitResult, scope){
			if(scope.selectedCluster && scope.selectedCluster.canvasItem.type == "ArtworkLayerElement"){
				if(designer.art_layer.lock_mode) return;
			}

			if(["stroke", "fill", "segment"].indexOf(hitResult.type) != -1){
			
				var cluster = hitResult.item;
				while(["Layer", "Group"].indexOf(cluster.className) == -1)
					cluster = cluster.parent;

				scope.activeSelectionRectangle = cluster.canvasItem.selection_rectangle;
				scope.activeSelectionRectangle.position = cluster.canvasItem.getBounds().center.clone();
				scope.paper.project.activeLayer.addChild(scope.activeSelectionRectangle);
				

				scope.selectedCluster = cluster;
				if(cluster.canvasItem.type == "ArtworkLayerElement"){
					if(designer.art_layer.lock_mode) return;
				}
			}
		},
		onMouseDrag: function(event, scope){
			if(scope.selectedCluster && scope.selectedCluster.canvasItem.type == "ArtworkLayerElement"){
				if(designer.art_layer.lock_mode) return;
			}
			if(scope.selectedCluster){
				scope.selectedCluster.position.x += event.delta.x;
				scope.selectedCluster.position.y += event.delta.y;
				scope.activeSelectionRectangle.position.x += event.delta.x;
				scope.activeSelectionRectangle.position.y += event.delta.y;
			}
		},
		onMouseUp: function(event, scope){
		}
	}
}