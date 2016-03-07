

var sr_model;
var artboard;
CircuitDesigner.BLANK_CANVAS = 1;
CircuitDesigner.UNIT_ADD = 2;
CircuitDesigner.ARTBOARD_ADD = 3;
function CircuitDesigner(container){
	sr_model = new SheetResistanceModel(10);
	this.paper = paper;
	this.container = container;
	this.temp = null;
	this.init();
	this.makeLayers();

	this.animations = [];
	this.update();
	var self = this;
	this.animation_handler = new AnimationHandler(paper);
	this.state = {};

}
var visiting = [];
// mm base
var PaperTypes = {
	A4: { 
		  width: 210, 
		  height: 297
		}
}
function PaperSetup(){

}
PaperSetup.orientation = function(paper_type, t){
	if(t == "hoz"){
		return {width: paper_type.height, height: paper_type.width}
	}
	else return paper_type;
}

CircuitDesigner.prototype = {
	makeLayers: function(){
		while(paper.project.layers.length > 0)
			paper.project.layers[0].remove();
		this.layer = new paper.Layer({
			name: "EL: Ellustrator SVG"
		});
		this.art_layer = new ArtworkLayer(paper, this.layer);
		this.circuit_layer = new CircuitLayer(paper, this.layer, "SI");
		this.paper.view.update();
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
		return this;
	},
	update: function(){
		if(typeof this.paper == "undefined") return;
		paper.view.update();
	},

	clear: function(){
		this.makeLayers();
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
				eSVG = new EllustrateSVG(item, scope, CircuitDesigner.UNIT_ADD);
	    	}
		});
	},
	loadJSON: function(json, clearCanvas){
		var scope = this;
		if(clearCanvas == CircuitDesigner.BLANK_CANVAS){
			this.clear();
			sys.log("Clearing canvas!");
		}
		// sys.log(json);
		var item = this.paper.project.importJSON(json); 
		// console.log(item[]);
		item[0].remove();

		eSVG = new EllustrateSVG(item[0], scope, CircuitDesigner.ARTBOARD_ADD);

   		scope.update();
	},
	json: function(){
		return paper.project.exportJSON({
			asString: true,
			precision: 5
		});
	}, 
	clearForSave: function(){
		this.state.tool = this.toolbox.clearTool();
		this.temp = getTerminalHelpers();
		this.temp = _.map(this.temp, function(el, i, arr){
			var e = {parent: el.parent, el: el}
			el.remove();
			return e;
		});
		this.circuit_layer.legend.remove();		
	}, 
	svg: function(){
		this.clearForSave();
		var filename = $('#design-name b').html().trim().replace(/ /g, "_").toLowerCase();
 

		if(_.isUndefined(filename)) filename = "export";
		if(filename == "") filename = "export"; 
		filename = filename.split('.')[0];

		console.log("Exporting file as SVG");
		zoom = 1;

		paper.view.update();

		exp = paper.project.exportSVG({ 
			asString: true,
			precision: 5
		});

		saveAs(new Blob([exp], {type:"application/svg+xml"}), filename + ".svg")
		this.unclearForSave();
	},	
	unclearForSave: function(){
		if(!_.isNull(this.state.tool)){
			console.log("Tool reenable", this.state.tool.name);
			this.state.tool.dom.addClass('btn-warning').removeClass('btn-ellustrate');
			this.toolbox.reenable(this.state.tool.name);
		}
		if(!_.isNull(this.temp)){
			_.each(this.temp, function(el, i, arr){
				el.parent.addChild(el.el);
			});
			this.temp = null;
		}

		this.paper.view.update();
	}
}
var getTerminalHelpers = function(){
	return paper.project.getItems({terminal_helper: true});
}
                 
var test; 

var eSVG = null;
function EllustrateSVG(svg, designer, flag){
	this.svg = svg;
	this.designer = designer;
	this.parse(flag);
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
	parse: function(flag){
		// Remove non-ellustrator elements
		var scope = this;
		// console.log("Adding ", this.svg);
		// SPECIFICATION
		// console.log("1º: Removing dud elements");
		var NEL = this.select( { prefix: ["NEL"]});
		_.each(NEL, 
			function(el, i, arr){ el.remove();}
		);

		// // Base canvas, if not added
		var paper_size = PaperSetup.orientation(PaperTypes.A4, 'hoz');

		if(flag == CircuitDesigner.ARTBOARD_ADD){
			var ARTBOARD = this.select(
				{ 
				  prefix: ["NCB"]
				});


			if(ARTBOARD.length == 0){
				// console.log("Adding artboard", ARTBOARD);
				artboard = new paper.Group({
					parent: designer.art_layer.layer,
					position: paper.view.center,
					name: "NCB: artboard", 
					canvasItem: true
				});
				var p = paper.Path.Rectangle({
					parent: artboard, 
					width: Ruler.mm2pts(paper_size.width),
					height: Ruler.mm2pts(paper_size.height),
					fillColor: "white", 
					shadowColor: new paper.Color(0.8),
		    		shadowBlur: 10,
		    		shadowOffset: new paper.Point(0, 0), 
		    		canvasItem: true, 
		    		name: "NCB: artboard", 
				});
				var gtext = new paper.PointText({
						parent: artboard, 
						point: artboard.bounds.topRight.clone(),
						content: "A4",
						fillColor: 'gray', 
						fontFamily: 'Arial', 
						fontWeight: 'bold', 
						fontSize: 20, 
						name: "NCB: artboard"
				});
			
				var gtext_adj = gtext.bounds;
				gtext.point.x -= gtext_adj.width + 15;
				gtext.point.y += gtext_adj.height + 10;
				
			}else{
				// console.log("Using artboard", ARTBOARD);
				artboard = ARTBOARD[0];
				designer.art_layer.layer.addChild(ARTBOARD[0]);
			
			}
			
		}


		// console.log(ARTBOARD[0].bounds);
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
		// console.log("3º: Add circuit layer to base", CIRCUIT_LAYER);
		var COMPONENTS = this.select(
				{ 
			  		prefix: ["CP"]
				}
			);

		_.each(COMPONENTS, function(el, i, arr){
			el.canvasItem = true;
		});
		// console.log("4º: Add components", COMPONENTS);
		
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

EllustrateSVG.getPrefix = function(item){
	if(_.isUndefined(item)) return "";
	if(_.isUndefined(item.name)) return "";
	if(item.name.split(":").length < 2) return "";
	return item.name.split(":")[0].trim();
}