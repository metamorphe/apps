
var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 15
};

var HIT_TEST_BOUNDING_RADIUS = 15;


function DeleteTool(){
	this.name = "DeleteTool";

	this.tool = new paper.Tool();
	this.tool.wrapper = this;

	this.tool.distanceThreshold = 10;
	sm.clear();
	this.sm = sm;	
	this.circles = []

	var scope = this;

	var whatDidIHit = function(positionOnCanvas){
		hitResult = paper.project.hitTest(positionOnCanvas, hitOptions);	
		if(_.isNull(hitResult)) return {type: "canvas", result: hitResult}

		var hit = hitResult.item;
		while(_.isUndefined(hit.canvasItem) && hit.parent)
			hit = hit.parent;

		var prefix = PaperUtil.getPrefix(hit);
		if(["NCB"].indexOf(prefix) > -1) return {type: "canvas", result: hitResult};
		else{ return {type: "element", result: hit} }
	}
	var route = function(event, allowableSubEvents, eventFN){
		// Recalibrate event point geometry

		if(_.isUndefined(event.center)){
			var positionOnCanvas = event.point;
		}else{
			event.center.y -= $('canvas').offset().top;
			var positionOnCanvas = paper.view.viewToProject(new paper.Point(event.center.x, event.center.y));
		}
		// START
		if(["mousedown", "mousedrag", "mouseup"].indexOf(event.type) != -1){
			var hit = whatDidIHit(positionOnCanvas);
			var hitType = hit.type;
			var hitResult = hit.result;
			scope.canvas_item_type = hitType;
			if(allowableSubEvents.indexOf(scope.canvas_item_type) != -1){
				scope[scope.canvas_item_type][eventFN](event, hitResult, scope);
			}
		}

	}
	
	this.tool.onMouseDown = function(event){
		route(event, ["element", "canvas"], "onMouseDown");
	}

	this.tool.onMouseUp = function(event){
		route(event, ["element", "canvas"], "onMouseDown");
	}
	this.tool.onMouseDrag = function(event){
		route(event, ["element", "canvas"], "onMouseDrag")
	}
}


DeleteTool.prototype = {
	enable: function(){
	   var scope = this;
	   sys.log("Activated the delete tool.");
	   // this.hammertime = Hammer($('canvas')[0]);
	   // this.hammertime.on('tap', scope.tool.onTap);
	},
	disable: function(){
	   console.log("Touch Tools Disabled");
	   var scope  = this;
	   // this.hammertime.off('tap', scope.tool.onTap);
	   paper.project.deselectAll();
	   this.update();
	},
	update: function(){
		paper.view.update();
	}, 
	clear: function(){
	},

	element: {
		onMouseDrag: function(event, hit, scope){
			sm.add(hit, event.event.shiftKey);
			sm.remove();
			// hm.save();
		},
		onMouseDown: function(event, hit, scope){

			sm.add(hit, event.event.shiftKey);
			sm.remove();
			// hm.save();
		},
		onMouseUp: function(){
		}
	},
	transform: {
	},
	canvas: {
		onMouseDrag: function(event, hitResult, scope){
		},
		onMouseDown: function(event, hitResult, scope){		
		}, 
		onMouseUp: function(){
		}
	},
	pan:  {
	}
}



