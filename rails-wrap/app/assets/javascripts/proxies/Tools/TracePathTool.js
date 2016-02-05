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
		}, 
		onMouseDrag: function(event){
			trace.add(event.point);
		}, 
		onMouseUp: function(event, scope){
   			// Get all conductive elements on the board
			// var terminals = designer.circuit_layer.getAllTerminals();
			// var traces = designer.traces_layer.getAllTraces();
			// var conductive = _.flatten([terminals, traces]);


			// // Find all unique non-self referential intersections with those elements
	  //   	var intersects = TracePathTool.getAllIntersections(trace, conductive);
			// intersects = _.uniq(intersects);
	  //   	intersects = _.reject(intersects, function(el, i, arr){
	  //   		return el.parent.canvasItem.id == start_terminal.parent.canvasItem.id;
	  //   	});

	  //   	// Visual characteristics on MouseUp			
			// _.each(terminals, function(el, i, arr){
			// 	el.scaling = new paper.Point(1.0, 1.0);	
			// });
			


	  //   	// Handle intersections
	  //   	// Hanging trace
	  //   	if(intersects.length == 0){
	  //   		trace.simplify();
	  //   		trace.remove();
	  //   		scope.lastTrace = designer.traces_layer.add(trace);
	  //   		start_terminal = null;
	  //   		return;
	  //   	}
	  //   	// Are all connections of the same polarity
	  //   	var offending_elements = [trace];
	  //   	var polarity = start_terminal.name == "trace" ? start_terminal.style.strokeColor : start_terminal.style.fillColor;
	  //   		var valid_connection = _.reduce(intersects, function(memo, el, i, arr){
	  //   			var el_polarity = el.name == "trace" ? el.style.strokeColor : el.style.fillColor;
	  //   			var valid = polarity.equals(el_polarity);
	  //   			if(!valid) offending_elements.push(el);
	  //   			return memo && valid;
	  //   	}, true);

	  //   	if(valid_connection){
	  //   		trace.simplify();
	  //   		trace.remove();
   //  			scope.lastTrace = designer.traces_layer.add(trace);;
	  //   	}
	  //   	else{
	  //   		// error message
	  console.log(trace);
	  		if(_.isNull(trace)) return;
    		
    		trace.simplify();
    		var polarity = detectPolarity(trace);
    		trace.name = "C" + polarity + "P: trace";
    		designer.circuit_layer.add(trace, true);
    		trace = null;
	  //   		var animations = [];
    			

	  //   		alerter.alert(TracePathTool.SHORT_MESSAGE,
		 //    		function(){
			// 			_.each(offending_elements, function(el, i, arr){
			// 			console.log("Strobing", el.name);
			// 			el.style = {
			// 				shadowColor: "blue",
			// 				shadowBlur: 30,
			// 				shadowOffset: new paper.Point(0, 0)
			// 			}
			// 			animations.push(designer.animation_handler.add(function(event){
			// 				var t = Math.sin(event.count/5); //[-1, 1]
			// 				t += 1; //[0, 2];
			// 				t /= 2; //[0, 1];
			// 				el.shadowColor.alpha = t;
			// 			}, 1.5,
			// 			function(){
			// 				el.shadowColor.alpha = 0;
			// 				if(trace) trace.remove();
			// 			}));
	  //   			});
						
			// 		},
		 //    		"Remove the shorting path"
	  //   		);
	    		
	  //   	}


	  //   	// State variable update
			// start_terminal = null;
		}
	},

}

function detectPolarity(trace){
	if(trace.style.strokeColor.equals(CircuitLayer.POSITIVE))
		return "V";
	if(trace.style.strokeColor.equals(CircuitLayer.NEUTRAL))
		return "N";
	if(trace.style.strokeColor.equals(CircuitLayer.NEGATIVE))
		return "G";
}
