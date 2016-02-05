var sr_model;
// CircuitDesigner.defaultTool = $('#transform-tool');

function CircuitDesigner(container){
	sr_model = new SheetResistanceModel(10);
	this.paper = paper;
	this.container = container;
	

	this.init();
	this.layer = new paper.Layer({
		name: "EL: Ellustrator SVG"
	});
	// this.traces_layer = new TracesLayer(paper);
	this.art_layer = new ArtworkLayer(paper, this.layer);
	this.circuit_layer = new CircuitLayer(paper, this.layer, "SI");

	this.animations = [];
	this.update();
	var self = this;
	this.animation_handler = new AnimationHandler(paper);
}

CircuitDesigner.prototype = {

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
	    // CircuitDesigner.defaultTool.click();

		return this;
	},
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
	    		// if(fileType == "artwork" || fileType == "battery" || fileType == "prettycircuit"){
	    			// item.sendToBack();
	    			// scope.art_layer.add(item);
			    	// CircuitDesigner.retainGroup(item, position, callback, scope);
			    	// item.sendToBack();
			    	item.position = position;
					eSVG = new EllustrateSVG(item, scope);
	    		// }

	    	}
		});
	},
	loadJSON: function(json, callback){
		var scope = this;
		var item = this.paper.project.importJSON(json); 
		// console.log(item);
		// item[0].remove();
		// if(_.isUndefined(item) || item.length < 2) return;
		// item[0].remove();
		// item[1].position = paper.view.center;
		eSVG = new EllustrateSVG(item[0], scope);

   		scope.update();
	},
	
	save: function(){
		this.toolbox.clearTool();
		var s = Math.floor(Date.now() / 1000);
		var timestamp_key = "saveevent_" + s;
		console.log("Timestamp", timestamp_key);
		storage.set(timestamp_key, JigExporter.export(this.paper, this.canvas, JigExporter.JSON, false));
		this.current_save = s;
	}, 
	server_save: function(){
		// for(var i in paper.project.layers){
		// 	if(i > 0) paper.project.layers[i].remove();
		// }
		// for(var i in paper.project.layers){
		// 	if(i > 0) paper.project.layers[i].remove();
		// }
		// for(var i in paper.project.layers){
		// 	if(i > 0) paper.project.layers[i].remove();
		// }
		paper.view.update();
		var json  =  paper.project.exportJSON({
			asString: true,
			precision: 5
		});
		var name = $("#design-name b").html().trim();
		var data = {
			json: json, 
			name: name
		}

		$.ajax({
		  url: '/designs/' + design.id + "/design_update",
		  type: 'POST',
		  data: data,
		  success: function(data) {
		    console.log(data);
		  }
		});
	}
}
                 
var test; 

var eSVG = null;


function EllustrateSVG(svg, designer){
	this.svg = svg;
	this.designer = designer;
	this.parse();
}

EllustrateSVG.prototype = {
	match: function(collection, match){
		// Prefix extension
		if("prefix" in match){
			var prefixes = match["prefix"];

			match["name"] = function(item){				
				var p = EllustrateSVG.getPrefixItem(item); 
				return prefixes.indexOf(p) != -1;
			}
			delete match["prefix"];
		}
		return collection.getItems(match);
	},
	select: function(match){
		return this.match(this.svg, match);
	},
	parse: function(){
		// Remove non-ellustrator elements
		var scope = this;
		battery = this.svg;
		// console.log("Adding ", this.svg);
		// SPECIFICATION
		// console.log("1º: Removing dud elements");
		var NEL = this.select( { prefix: ["NEL"]});
		_.each(NEL, 
			function(el, i, arr){ el.remove();}
		);
		
		
		var ART = this.select(
			{ 
			  prefix: ["ART"]
			});
		// console.log("2º: Add art layer to base", ART);
		designer.art_layer.add(ART);
		_.each(ART, function(el, i, arr){
			el.canvasItem = true;
		});
		
		
		var CIRCUIT_LAYER = this.select(
				{ 
			  		prefix: ["SI"]
				}
			);
		// CIRCUIT_LAYER[0].remove();
		console.log("3º: Add circuit layer to base", CIRCUIT_LAYER);
		var COMPONENTS = this.select(
				{ 
			  		prefix: ["CP"]
				}
			);

		_.each(COMPONENTS, function(el, i, arr){
			console.log(el.name);
			el.canvasItem = true;
		});
		console.log("4º: Add components", COMPONENTS);
		
		designer.circuit_layer.add(COMPONENTS);
		$("#path-tool").click();
	}
}
var battery;
EllustrateSVG.match = function(collection, match){
	if("prefix" in match){
		var prefixes = match["prefix"];

		match["name"] = function(item){				
			var p = EllustrateSVG.getPrefixItem(item); 
			return prefixes.indexOf(p) != -1;
		}
		delete match["prefix"];
	}
	return collection.getItems(match);
}
EllustrateSVG.getPrefixItem = function(item){
	if(_.isUndefined(item)) return "";
	if(item.split(":").length < 2) return "";
	return item.split(":")[0].trim();
}
// EllustrateSVG.getPrefix = function(item){
// 	if(_.isUndefined(item)) return "";
// 	if(_.isUndefined(item.name)) return "";
// 	if(item.name.split(":").length < 2) return "";
// 	return item.name.split(":")[0].trim();
// }
// EllustrateSVG.getName = function(item){
// 	var res = item.name.split(":")[1].trim();
// 	res = res.replace(/_/g, "");
// 	return 
// }

                                                              

