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
	this.raster_record = []; 

}

CircuitDesigner.prototype = {
	getRasters: function(){
		rasters = EllustrateSVG.get({prefix: ["RST"]});
		rasters = _.map(rasters, function(el){
			if(current_mode == "draw"){
				return {filename: el.filename, x: el.position.x, y: el.position.y, w: el.width, h: el.height}
			}
			return {filename: el.filename, x: el.position.x + 145, y: el.position.y, w: el.width, h: el.height}
		});

		return rasters;
	},
	saveRasters: function(){
		key = "raster_cache_" + design.id;
		rasters = this.getRasters()
		rasters = JSON.stringify(rasters);
		storage.set(key, rasters);
	},
	loadRasters: function(rasters){
		var scope = this;
		key = "raster_cache_" + design.id;
		rasters = eval(storage.get(key));
		_.each(rasters, function(el, i, arr){
			if(current_mode == "draw"){
				scope.addRaster(el.filename, new paper.Point(el.x, el.y), el.w, el.h);
			}else{
				scope.addRaster(el.filename, new paper.Point(el.x - 145, el.y), el.w, el.h);
			}
		});
	},
	makeLayers: function(){
		while(paper.project.layers.length > 0) paper.project.layers[0].remove();
		
		this.layer = new paper.Layer({ name: "EL: Ellustrator SVG" });
		this.art_layer = new ArtworkLayer(paper, this.layer);
		this.circuit_layer = new CircuitLayer(paper, this.layer, "SI");
		this.paper.view.update();
	},
	init: function(){
		// setups paperjs 
		var c = this.container;
		this.canvas = DOM.tag("canvas")
				.prop('resize', true)
				.height(c.height() - 50)
				.width(c.width());

		c.append(this.canvas);	

		this.paper = new paper.PaperScope();
		this.paper.setup(this.canvas[0]);
		this.height = this.paper.view.size.height;
		this.width = this.paper.view.size.width;

	    zoom = new Zoom(this.paper.view.zoom, this.paper);

		this.paper.view.zoom = 1;	
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
	addRaster: function(filename, position, dWidth, dHeight){
		var scope = this;
		var scale = 0.35;
		var rasterImage = $('<img></img>')
			.attr({
				src: filename, 
			}).css({
				position: "absolute", 
				bottom: 0, 
				left:  0, 
				width: "100px", 
				display: "none",
				"z-index": 100000
			}).load(function(){
				var raster = new paper.Raster({
					name: "RST:" + filename,
					parent: designer.art_layer.layer,
					image: this, 
					position: position, 
					canvasItem: true, 
					layerClass: "ArtworkLayer", 
					filename: filename
				});
				if(_.isUndefined(dWidth)){
					var w = raster.size.width * scale;
					var h = raster.size.height * scale;
					raster.size = new paper.Size(w, h);
				}
				else{
					raster.size = new paper.Size(dWidth, dHeight);
				}
				

				// hm.save();
				paper.view.update();		
			});

		$('#sandbox').append(rasterImage);	
	}, 
	addSVG: function(filename, position, callback){
		var scope = this;
		
		this.paper.project.importSVG(filename, {
	    	onLoad: function(item) { 
		    	item.position = position;
				eSVG = new EllustrateSVG(item, scope, CircuitDesigner.UNIT_ADD);
	    		hm.save();
	    		zoom.home();
	    		zoom.home();
	    	}
		});
	},
	loadJSON: function(json, clearCanvas){
		var scope = this;
		if(clearCanvas == CircuitDesigner.BLANK_CANVAS){
			this.clear();
			sys.log("Clearing canvas!");
		}
		var item = this.paper.project.importJSON(json); 
		item[0].remove();

		eSVG = new EllustrateSVG(item[0], scope, CircuitDesigner.ARTBOARD_ADD);
   		scope.update();
   		$('#shade').fadeOut(1000);
	},
	json: function(){
		return paper.project.exportJSON({
			asString: true,
			precision: 5
		});
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
	return EllustrateSVG.get({terminal_helper: true});
}


                 
