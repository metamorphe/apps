CircuitDesigner.defaultTool = '#transform-tool'

function CircuitDesigner(container){
	this.paper = paper;
	this.container = container;
	this.circuit_layer = new CircuitLayer(paper);
	this.art_layer = new ArtworkLayer(paper);
	this.traces_layer = new TracesLayer(paper);
	console.log($(CircuitDesigner.defaultTool));
	$(CircuitDesigner.defaultTool).click();
	this.init();
	this.animations = [];
	this.update();
	var self = this;
	this.animation_handler = new AnimationHandler(paper);
}

CircuitDesigner.prototype = {
	getTree: function(){
		var scope = this;
		var traces = designer.traces_layer.getAllTraces();
		_.each(traces, function(el, i, arr){
			scope.getConnection(el);
		});
	}, 
	getConnection: function(trace){
			var terminals = designer.circuit_layer.getAllTerminals();
			var traces = designer.traces_layer.getAllTraces();
			var conductive = _.flatten([terminals, traces]);


			// Find all unique non-self referential intersections with those elements
	    	var intersects = TracePathTool.getAllIntersectionsRaw(trace, conductive);
	    	// console.log(intersects);
			intersects = _.uniq(intersects);

			_.each(intersects, function(el, i, arr){
				_.each(el.locations, function(loc, j, arr2){
					var c = new paper.Path.Circle({
						center: loc.point, 
						radius: 4, 
						fillColor: "purple"
					});
				});
			});

			intersects = _.map(intersects, function(el, i, arr){
				// console.log(el);
				var el = el.trace;
				while(_.isUndefined(el.canvasItem))
					el = el.parent;
				console.log(el.canvasItem.name);
				return el.canvasItem;
			});


	    	console.log(intersects);

	    	console.log(trace.bounds);

	    	var traceItem = trace;
	    	while(_.isUndefined(traceItem.canvasItem))
					traceItem = traceItem.parent;
			traceItem = traceItem.canvasItem;

			var circuit_label = traceItem.circuit_label;
			console.log(traceItem);
			console.log("polarity", traceItem.polarity_color.equals(CircuitLayer.POSITIVE));

			if(traceItem.polarity_color.equals(CircuitLayer.POSITIVE)){
				if(circuit_label == "") 
					circuit_label = _.some(intersects, function(el, i, arr){ return el.name == "battery"}) ? "R1": circuit_label;
				console.log("CIRCUIT r1", circuit_label);
				if(circuit_label == "") 
					circuit_label = _.some(intersects, function(el, i, arr){ return el.circuit_label == "R1"}) ? "R2": circuit_label;
				if(circuit_label == "") 
					circuit_label = _.some(intersects, function(el, i, arr){ return el.circuit_label == "R2"}) ? "R3": circuit_label;
				if(circuit_label == "") 
					circuit_label = _.some(intersects, function(el, i, arr){ return el.circuit_label == "R3"}) ? "R4": circuit_label;
				if(circuit_label == "") 
					circuit_label = _.some(intersects, function(el, i, arr){ return el.circuit_label == "R4"}) ? "R5": circuit_label;
				if(circuit_label == "") 
					circuit_label = _.some(intersects, function(el, i, arr){ return el.circuit_label == "R5"}) ? "R6": circuit_label;
				
				traceItem.circuit_label = circuit_label;
			}
			console.log(traceItem);
			textPos = trace.bounds.leftCenter.clone();
			textPos.x -= 20;
	    	var text = new paper.PointText({
			    point: textPos,
			    content: traceItem.circuit_label,
			    fillColor: 'black',
			    fontFamily: 'Futura PT',
			    // fontWeight: 'bold',
			    justification: "right",
			    fontSize: 18
			});
			console.log(trace.length + " Ω");

			var ohms = new paper.PointText({
			    point: text.bounds.expand(10).bottomCenter.clone(),
			    content: trace.length.toFixed(2) + " Ω",
			    fillColor: 'black',
			    fontFamily: 'Futura PT',
			    // fontWeight: 'bold',
			    justification: "center",
			    fontSize: 12
			});
			


			paper.view.update();

	    	// Handle intersections
	    	// Hanging trace
	    
	    	// Are all connections of the same polarity
	    	// var offending_elements = [trace];
	    	// var polarity = start_terminal.name == "trace" ? start_terminal.style.strokeColor : start_terminal.style.fillColor;
	    	// 	var valid_connection = _.reduce(intersects, function(memo, el, i, arr){
	    	// 		var el_polarity = el.name == "trace" ? el.style.strokeColor : el.style.fillColor;
	    	// 		var valid = polarity.equals(el_polarity);
	    	// 		if(!valid) offending_elements.push(el);
	    	// 		return memo && valid;
	    	// }, true);
	},
	init: function(){
		// setups paperjs 
		var c = this.container;
		this.canvas = DOM.tag("canvas")
				.prop('resize', true)
				.height(c.height())
				.width(c.width());

		c.append(this.canvas);	

		this.paper = new paper.PaperScope();
		this.paper.setup(this.canvas[0]);
		this.height = this.paper.view.size.height;
		this.width = this.paper.view.size.width;
		this.paper.view.zoom = 1.5;	
		var scope = this; 

		// Setups tools
	    this.toolbox = new Toolbox(this.paper, $("#toolbox"));	
	    this.toolbox.add("anchortool", $('#anchor-tool'), new AnchorPointTool(this.paper));
		this.toolbox.add("pathtool", $('#path-tool'),  new TracePathTool(this.paper));
		this.toolbox.add("transformtool", $('#transform-tool'),  new TransformTool2(this.paper));
		this.toolbox.add("pantool", $('#pan-tool'),  new PanTool(this.paper));
		this.toolbox.add("canvaspantool", $('#canvas-pan-tool'),  new CanvasPanTool(this.paper));
		this.toolbox.add("runtool", $('#run-tool'),  new RunTool(this.paper));
		this.toolbox.add("debugtool", $('#debug-tool'),  new DebugTool(this.paper));
		this.toolbox.add("fabtool", $('#fab-tool'),  new FabTool(this.paper));
		
		this.toolbox.enable("transformtool");
		return this;
	},
	update: function(){
		if(typeof this.paper == "undefined") return;
		paper.view.update();
	},

	clear: function(){
		this.paper.project.clear();
		this.update();
	},
	addSVG: function(filename, position, callback){
		
		var scope = this;
		var fileType = filename.split('/');
		fileType = fileType[fileType.length - 1];
		fileType = fileType.split('_');
		fileType = fileType[0].toLowerCase();
		console.log("filename", fileType, filename);
		this.paper.project.importSVG(filename, {
	    	onLoad: function(item) { 
	    		if(fileType == "artwork"){
	    			item.sendToBack();
	    			scope.art_layer.add(item);
			    	CircuitDesigner.retainGroup(item, position, callback, scope);
			    	// item.sendToBack();
	    		}
	    	}
		});
	},
	loadJSON: function(json, callback){
		var scope = this;

		var item = this.paper.project.importJSON(json); 
		var layer = item[0].children[0];	
		console.log("Loading json", layer);
		// if valid JSON
		if(!_.isUndefined(layer) && !_.isUndefined(layer.children)){  
	    	CircuitDesigner.decomposeImport(layer, paper.view.center, callback, scope);
		} else{
			console.log('No layer detected!');
		}

   		scope.update();
	},
	
	save: function(){
		this.toolbox.clearTool();
		var s = Math.floor(Date.now() / 1000);
		var timestamp_key = "saveevent_" + s;
		console.log("Timestamp", timestamp_key);
		storage.set(timestamp_key, JigExporter.export(this.paper, this.canvas, JigExporter.JSON, false));
		this.current_save = s;
	}
	
}
                 


CircuitDesigner.retainGroup = function(item, position, callback, scope){
	console.log("Retaining group", item.className);
	item.position = position;
	CircuitDesigner.defaultTool.click().focus();
}


CircuitDesigner.decomposeImport = function(item, position, callback, scope){
	
	if(_.isUndefined(position)) item.position = paper.view.center;
    else item.position = position;


	_.each(Utility.unpackChildren(item, []), function(value, key, arr){
		var path = value;
		if(path.name == "trace"){ path.remove(); return; }
		else if(path.name == "sticker_led"){ 
			scope.circuit_layer.add(path, ['n', 's']);
		}
		else if(path.name == "battery"){ 
			scope.circuit_layer.add(path, ['e', 'w']);
		}
		else scope.circuit_layer.add(path);
	});

	$(CircuitDesigner.defaultTool).click().focus();
}



                                                              

