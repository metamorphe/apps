TracePathTool.SHORT_MESSAGE = "You are shorting your circuit. Avoid crossing any paths or connecting to terminals that aren't the same color (polarity).";

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 0
};
var trace;

function TracePathTool(paper){
	this.paper = paper;
	this.tool = new paper.Tool();
	var scope = this;

	this.tool.onMouseDown = function(event){
		designer.circuit_layer.layer.activate();
		hitResult = scope.paper.project.hitTest(event.point, hitOptions);
		// console.log("TRACE", hitResult.item.name);
	
		if(_.isNull(hitResult)) scope.canvas_item_type = "canvas";
		else{
			path = hitResult.item;
			var prefix = EllustrateSVG.getPrefixItem(path.name);

			if(["CGT", "CVT", "CNT"].indexOf(prefix) != -1) scope.canvas_item_type = "trace";
			else if(["CGP", "CVP", "CNP"].indexOf(prefix) != -1) scope.canvas_item_type = "trace";
			else if(["CGB", "CVB", "CNB"].indexOf(prefix) != -1) scope.canvas_item_type = "blob";
			else scope.canvas_item_type = "canvas";
		} 
		if(_.isUndefined(scope[scope.canvas_item_type])) return;
		scope[scope.canvas_item_type].onMouseDown(event, hitResult, scope);
    }
    this.tool.onMouseDrag = function(event){
    	if(_.isUndefined(scope[scope.canvas_item_type])) return;
		scope[scope.canvas_item_type].onMouseDrag(event, scope);
	}	
	this.tool.onMouseUp = function(event){
		if(_.isUndefined(scope[scope.canvas_item_type])) return;
		scope[scope.canvas_item_type].onMouseUp(event, scope);
		scope.canvas_item_type = null;
	}

}

TracePathTool.prototype = {
	enable: function(){
		console.log("Trace Tool Activated");
		designer.circuit_layer.circuit_view();
	},
	disable: function(){
		designer.circuit_layer.trace_view();
	},
	update: function(){
		this.paper.view.update();
	}, 
	clear: function(){

	},
	trace: {
		onMouseDown: function(event, hitResult, scope){
	  		var path = hitResult.item;
			start_terminal = path;

			trace = new paper.Path({
				strokeColor: path.polarity,
				strokeWidth: 4,
				name: "trace"
			});

	    	trace.add(event.point);

	    	var polarity = detectPolarity(trace);

	    	var terminals = ["C"+ polarity +"T"];
			terminals = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: terminals });
			
			_.each(terminals, function(el, i, arr){
				el.scaling = new paper.Point(1.1, 1.1);	
			});
		}, 
		onMouseDrag: function(event){
			trace.add(event.point);
		}, 
		onMouseUp: function(event, scope){
			
			var polarity = detectPolarity(trace);

			// GET ALL CONDUCTIVE offending_elements
			var conductive = ["CGP", "CVP", "CNP", "CGB", "CVB", "CNB"];
			conductive = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductive });
		

	     	// Visual characteristics on MouseUp			
			var terminals = ["CGT", "CVT", "CNT"];
			terminals = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: terminals });
			
			_.each(terminals, function(el, i, arr){
				el.scaling = new paper.Point(1.0, 1.0);	
			});
			
			// var intersects = TracePathTool.getAllIntersections(trace, conductive);
			// conductive[2].selected = true;
			

			var intersects = TracePathTool.getAllIntersections(trace, conductive)
			// console.log("WHY", intersects[1]._curve.path.name);
			// console.log("WHY", intersects[1]._curve2.path.name);
			var i_group = new paper.Group();
			_.each(intersects, function(el, i, arr){
				var c = new paper.Path.Circle({
					position: el.point,
					radius: el.path.strokeWidth * 1.1, 
					fillColor: el._curve2.path.style.strokeColor
				});
				i_group.addChild(c);
			});
			// intersects[0].path.remove();			
			// Are all connections of the same polarity
			var valid_connection = true;
			var offending_elements = [trace];
			for(var i in intersects){
				var el = intersects[i];
				if(detectPolarity(el._curve2.path) != polarity){
					valid_connection = false;
					offending_elements.push(el.path);
					break;
				}
			}
			if(valid_connection){
				if(_.isNull(trace)) return;
    		
	    		trace.simplify();
	    		
	    		trace.name = "C" + polarity + "P: trace";
	    		designer.circuit_layer.add(trace, true);
	    		trace = null;

			} else{


	    		var animations = [];
				alerter.alert(TracePathTool.SHORT_MESSAGE,
			    		function(){
							_.each(offending_elements, function(el, i, arr){
							console.log("Strobing", el.name);
							el.style = {
								shadowColor: "blue",
								shadowBlur: 30,
								shadowOffset: new paper.Point(0, 0)
							}
							animations.push(designer.animation_handler.add(function(event){
								var t = Math.sin(event.count/5); //[-1, 1]
								t += 1; //[0, 2];
								t /= 2; //[0, 1];
								el.shadowColor.alpha = t;
							}, 1.5,
							function(){
								el.shadowColor.alpha = 0;
								if(trace) trace.remove();
								i_group.remove();
							}));
		    			});
							
						},
			    		"Remove the shorting path"
		    		);
		    }
		}
	},

}
TracePathTool.getAllIntersections = function(path, wires){
	var intersects = [];
	for(var i in wires){
		var s = trace.getIntersections(wires[i]);
		if(s.length > 0)
			intersects.push(s);
	}
	return _.flatten(intersects);
} 

function detectPolarity(trace){
	if(trace.style.strokeColor.equals(CircuitLayer.POSITIVE))
		return "V";
	if(trace.style.strokeColor.equals(CircuitLayer.NEUTRAL))
		return "N";
	if(trace.style.strokeColor.equals(CircuitLayer.NEGATIVE))
		return "G";
}
