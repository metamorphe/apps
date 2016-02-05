
var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 10
};
TransformTool2.ROTATING = 1;
TransformTool2.SCALING = 2;
TransformTool2.TOUCH = 0;

function tS(v){
	if(v == TransformTool2.ROTATING)
		return "TRANSFORM.ROTATE";
	if(v == TransformTool2.SCALING)
		return "TRANSFORM.SCALE";
	return "TRANSFORM.NULL";
}

function TransformTool2(paper){
	this.paper = paper;
	this.name = "TransformTool2";

	this.tool = new paper.Tool();
	this.tool.distanceThreshold = 10;
	this.sm = new SelectionManager(paper);
	this.pinching = false;
	this.rotating = false;
	var scope = this;

	var whatDidIHit = function(positionOnCanvas){
		hitResult = scope.paper.project.hitTest(positionOnCanvas, hitOptions);	
		if(_.isNull(hitResult)) return "canvas";
		else{ return "element"; }
	}
	var route = function(event, allowableSubEvents, eventFN){
		// Recalibrate event point geometry
		// console.log("PINCHING", scope.pinching);
		if(_.isUndefined(event.center)){
			var positionOnCanvas = event.point;
		}else{
			event.center.y -= $('canvas').offset().top;
			var positionOnCanvas = scope.paper.view.viewToProject(new paper.Point(event.center.x, event.center.y));
		}
		// START
		if(["rotatestart", "pinchstart", "tap"].indexOf(event.type) != -1){
			var hitType = whatDidIHit(positionOnCanvas);
			scope.canvas_item_type = hitType;
			console.log("Hit test", hitType);		
			if(allowableSubEvents.indexOf(scope.canvas_item_type) != -1){
				scope[scope.canvas_item_type][eventFN](event, hitResult, scope);
			}
		}
		// DRAG	
		else if(["rotatemove", "mousedrag", "pinchmove"].indexOf(event.type) != -1) {
			// Route accordingly...		
			if(allowableSubEvents.indexOf(scope.canvas_item_type) != -1){
				scope[scope.canvas_item_type][eventFN](event, scope);
			}
			scope.update();
		}
		// STOP
		else if(["rotateend","pinchend"].indexOf(event.type) != -1) {
			if(allowableSubEvents.indexOf(scope.canvas_item_type) != -1){
				scope[scope.canvas_item_type][eventFN](event, scope);
			}
			scope.update();
			// console.log("Setting to null")
			// scope.canvas_item_type = null;
		}
	}
	this.tool.onTap = function(event){
		route(event, ["canvas", "element"], "onTap");
	}
	this.tool.onPinchMove = function(event){
		scope.pinching = true;
		route(event, ["canvas", "element"], "onPinchMove");
	}
	this.tool.onPinchStart = function(event){
		route(event, ["canvas", "element"], "onPinchStart");
	}
	this.tool.onPinchEnd = function(event){
		scope.pinching = false;
		route(event, ["canvas", "element"], "onPinchEnd");
	}
	this.tool.onRotateMove = function(event){
		scope.rotating = true;
		route(event, ["canvas", "element"], "onRotateMove");
	}
	this.tool.onRotateStart = function(event){
		route(event, ["canvas", "element"], "onRotateStart");
	}
	this.tool.onRotateEnd = function(event){
		scope.rotating = false;
		route(event, ["canvas", "element"], "onRotateEnd");
	}
	this.tool.onMouseDrag = function(event){
		route(event, ["element"], "onMouseDrag");
	}
	

}


TransformTool2.prototype = {
	enable: function(){
	   var scope = this;
	   console.log("Touch Tools Activated");
	   this.hammertime = Hammer($('canvas')[0]);
	   this.hammertime.get('rotate').set({ enable: true });
	   this.hammertime.get('pinch').set({ enable: true });
	   this.hammertime.on('tap', scope.tool.onTap);
	   this.hammertime.on('pinchstart', scope.tool.onPinchStart);
	   this.hammertime.on('pinchend', scope.tool.onPinchEnd);
	   this.hammertime.on('pinchmove', scope.tool.onPinchMove);
	   this.hammertime.on('rotatestart', scope.tool.onRotateStart);
	   this.hammertime.on('rotateend', scope.tool.onRotateEnd);
	   this.hammertime.on('rotatemove', scope.tool.onRotateMove);
	   $('#remove-element').click(function(){
	   	 scope.sm.remove();
	   });
	},
	disable: function(){
	   console.log("Touch Tools Disabled");
	   var scope  = this;
	   this.hammertime.off('tap', scope.tool.onTap);
	   this.hammertime.off('pinchstart', scope.tool.onPinchStart);
	   this.hammertime.off('pinchend', scope.tool.onPinchEnd);
	   this.hammertime.off('pinchmove', scope.tool.onPinchMove);
	   this.hammertime.off('rotatestart', scope.tool.onRotateStart);
	   this.hammertime.off('rotateend', scope.tool.onRotateEnd);
	   this.hammertime.off('rotatemove', scope.tool.onRotateMove);
	},
	update: function(){
		this.paper.view.update();
	}, 
	clear: function(){
	},
	selectAll: function(flag){
	}, 
	element: {
		onTap: function(event, hitResult, scope){
			console.log("pTap");
			var cluster = hitResult.item;
			while(_.isUndefined(cluster.canvasItem))
				cluster = cluster.parent;
			scope.sm.add(cluster, event.srcEvent.shiftKey);
		},
		onPinchStart: function(event, scope){
			console.log("pStart");
			scope.pinching = true;
		},
		onPinchMove: function(event, scope){
			console.log("pMove");
			scope.pinching = true;
			scope.sm.scale(event.scale, event.scale);
		},
		onPinchEnd: function(event, scope){
			console.log("pEnd");
			scope.pinching = false;
		},
		onRotateStart: function(event, hitResult, scope){
			console.log("rStart");
			scope.rotating = true;
		},
		onRotateMove: function(event, scope){
			console.log("rMove");
			scope.rotating = true;
			scope.sm.rotate(event.rotation);
		},
		onRotateEnd: function(event, scope){
			console.log("rEnd");
			scope.rotating = false;
		},
		onMouseDrag: function(event, scope){	
			if(scope.pinching || scope.rotating) return;

			console.log("mousedrag", event.delta);
			scope.sm.translate(event.delta);
		},
	},
	
	transform: {
		onMouseDown: function(event, hitResult, scope){
			if(["segment"].indexOf(hitResult.type) != -1){
				// var cluster = hitResult.item;
				// while(_.isUndefined(cluster.canvasItem))
				// 	cluster = cluster.parent;
				var rect = hitResult.item;
				var group = rect.group;
				
				var isRotate = hitResult.segment.index >= 2 && hitResult.segment.index <= 4;
				var isScale = !isRotate;

			    if(isRotate){
			    	scope.action = TransformTool2.ROTATING;
			    }
			    if(isScale){
			    	scope.action = TransformTool2.SCALING;
			    }
			}
		},
		onMouseDrag: function(event, scope){	
			console.log(tS(scope.action));
			if(scope.action == TransformTool2.SCALING){
				var path_bounds = scope.sm.selection_rectangle.bounds.clone();   
				var center = path_bounds.center.clone();   
				var diag = event.point.subtract(center).length;
				var init_diag = scope.sm.selection_rectangle.init_size;
				var ratio = diag/init_diag;
				scope.sm.scale(ratio, ratio);
			}
			if(scope.action == TransformTool2.ROTATING){
				var angle = event.point.subtract(scope.sm.selection_rectangle.pivot).angle + 90;
				scope.sm.rotate(angle);
			}
			
		},
		onMouseUp: function(event, scope){
			scope.action = null;
		}
	},
	canvas: {
		onPinchStart: function(event, scope){
			console.log("pStart");
			scope.pinching = true;
		},
		onPinchMove: function(event, scope){
			console.log("pMove");
			scope.pinching = true;
			scope.sm.scale(event.scale, event.scale);
		},
		onPinchEnd: function(event, scope){
			console.log("pEnd");
			scope.pinching = false;
		},
		onRotateStart: function(event, hitResult, scope){
			console.log("rStart");
			scope.rotating = true;
		},
		onRotateMove: function(event, scope){
			console.log("rMove");
			scope.rotating = true;
			scope.sm.rotate(event.rotation);
		},
		onRotateEnd: function(event, scope){
			console.log("rEnd");
			scope.rotating = false;
		},
		onTap: function(event, hitResult, scope){
			scope.canvas_item_type = null;
			scope.sm.clear();
		},
		onMouseDown: function(event, hitResult, scope){
			scope.sm.clear();
		},
		onMouseDrag: function(event, scope){

		},
		onMouseUp: function(event, scope){

		}
	},
	pan:  {
		onMouseDown: function(event, hitResult, scope){
			console.log("PANNING", hitResult.type);
			// GET SELECTED ITEM
			if(["stroke", "fill", "segment"].indexOf(hitResult.type) != -1){
				var cluster = hitResult.item;
				while(_.isUndefined(cluster.canvasItem))
					cluster = cluster.parent;
				scope.sm.add(cluster, event.event.shiftKey);
			}
		},
		onMouseDrag: function(event, scope){
			// TRANSLATE
			scope.sm.translate(event.delta);
		},
		onMouseUp: function(event, scope){
		
		}
	}
}


function SelectionManager(paper){
	this.paper = paper;
	this.collection = {};
	// var s = createSelectionRectangle([]);
	// this.selection_rectangle = s.rect;
	// this.selection_group = s.group;
	this.selection_group = [];
}
SelectionManager.prototype = {
	add: function(cluster, shiftKey){
		var inCollection = _.includes(_.keys(this.collection), cluster.canvasItem.guid);
		if(shiftKey && inCollection){
			this.remove(cluster);
			this.update();
		}
		else{
			// if(!shiftKey && !inCollection) 
			this.clear();
			this.collection[cluster.canvasItem.guid] = cluster;
			this.selection_group = [cluster];
			cluster.selected = true;
			this.update();
		}
	},
	rotate_each: function(){

	},
	rotate: function(angle){
		// this.selection_rectangle.rotation = angle;
		_.each(this.selection_group, function(el, i, arr){
			if(! eval(el.layerClass + ".rotateable")) return;
			el.rotation = angle;
		});
	},
	translate: function(delta){
		// this.selection_rectangle.position.x += delta.x;
		// this.selection_rectangle.position.y += delta.y;
		_.each(this.selection_group, function(el, i, arr){
			console.log(el);
			if(! eval(el.layerClass + ".translateable")) return;
			el.position.x += delta.x;
			el.position.y += delta.y;
		});
	},
	scale: function(sx, sy){
		// this.selection_rectangle.scaling.x = sx;
		// this.selection_rectangle.scaling.y = sy;
		_.each(this.selection_group, function(el, i, arr){
			if(! eval(el.layerClass + ".scaleable")) return;
			el.scaling.x = sx;
			el.scaling.y = sy;
		});
	},
	update: function(){
		// this.selection_rectangle.remove();
		// var s = createSelectionRectangle(_.values(this.collection));
		// this.selection_rectangle = s.rect;
		// this.selection_group = s.group;
		// this.paper.project.activeLayer.addChild(this.selection_rectangle);
	},
	remove: function(){
		// cluster.canvasItem.selection_rectangle.remove();
		// cluster.canvasItem.path.selected = false;
		// delete this.collection[cluster.canvasItem.guid];
		_.each(this.selection_group, function(el, i, arr){
			el.selected = false;
			el.remove();
		});
		this.selection_group = [];
	}, 
	clear: function(){
		var scope = this;
		// _.each(this.collection, function(el, i, arr){
		// scope.remove(el);
		scope.remove();
		// });
		// this.collection = {};
		// this.update();
	}
}
