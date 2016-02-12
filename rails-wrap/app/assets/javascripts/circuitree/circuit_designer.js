
var sr_model;
function CircuitDesigner(container){
	sr_model = new SheetResistanceModel(10);
	this.paper = paper;
	this.container = container;
	this.init();
	this.layer = new paper.Layer({
		name: "EL: Ellustrator SVG"
	});
	this.art_layer = new ArtworkLayer(paper, this.layer);
	this.circuit_layer = new CircuitLayer(paper, this.layer, "SI");

	this.animations = [];
	this.update();
	var self = this;
	this.animation_handler = new AnimationHandler(paper);
}
var visiting = [];
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
		return this;
	},
	findRoot: function(){
		var BATTERY = EllustrateSVG.match( this.circuit_layer.layer, { prefix: ["CVTB"]});

		_.each(BATTERY, function(el, i, arr){
			// el.selected = true;
			el.style.fillColor = "yellow";
		});
		console.log("BATTERY", BATTERY);
		visiting.push(BATTERY[0]);
	}, 
	nextNode: function(){
		var conductive = ["CGP", "CVP", "CNP", "CGB", "CVB", "CNB"];
		conductive = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductive });
		var parents = visiting;
		visiting = [];
		for(var i in parents){
			parents[i].style.strokeColor = "yellow";
			var intersects = TracePathTool.getAllIntersections(parents[i], conductive);

			visiting.push(_.map(intersects, function(el, i, arr){
				return el._curve2.path;
			}));
		}
		visiting = _.flatten(visiting);
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
		    	item.position = position;
				eSVG = new EllustrateSVG(item, scope);
	    	}
		});
	},
	loadJSON: function(json, callback){
		var scope = this;
		var item = this.paper.project.importJSON(json); 
		eSVG = new EllustrateSVG(item[0], scope);
   		scope.update();
	},
	json: function(){
		return paper.project.exportJSON({
			asString: true,
			precision: 5
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
			el.canvasItem = true;
		});
		console.log("4º: Add components", COMPONENTS);
		
		designer.circuit_layer.add(COMPONENTS);
		// $("#path-tool").click();
	}
}
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