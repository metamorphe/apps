var sr_model;
var artboard;
CircuitDesigner.BLANK_CANVAS = 1;
CircuitDesigner.UNIT_ADD = 2;
CircuitDesigner.ARTBOARD_ADD = 3;

  // $(window).bind('beforeunload', function(event) {
  //   designer.saveRasters();
  // });

  // $(window).bind("pagehide", function(){
  //    designer.saveRasters();
  // });


var confirmOnPageExit = function (e) {
    return "Make sure you save!";
};
var exitSexy = function (e) {
	// hm.server_save();
	console.log("DONT FORGET TO REENABLE ME")
};
        

function CircuitDesigner(container){
	this.container = container;
	sr_model = new SheetResistanceModel(10);
	this.init();
	this.animation_handler = new AnimationHandler();
	paper.view.update();
	window.onunload = exitSexy;
}

CircuitDesigner.prototype = {
	init: function(){
		var c = this.container;
		this.canvas = DOM.tag("canvas")
				.prop('resize', true)
				.height(c.height() - 50)
				.width(c.width());
		c.append(this.canvas);	
		paper = new paper.PaperScope();
		paper.setup(this.canvas[0]);
		this.height = paper.view.size.height;
		this.width = paper.view.size.width;
		paper.view.zoom = 1;	
		this.setupSurface();
		return this;
	},
	setupSurface: function(){
		paper.project.activeLayer.name = "ELD: Ellustrate Circuit Design";
		PaperSetup.makePaper(PaperSetup.types.A4.horizontal);
	},
	clear: function(){
		paper.project.clear();
		paper.view.update();
	},
	addContent: function(save, url, clear, position){
		var scope = this;
		// console.log('ADDING', url)
		if(url[0] == "["){ var extension = "JSON"; }
		else{
			var extension = url.split('.');
			extension = extension[extension.length - 1].toUpperCase();
		}

		if(clear){
			this.clear();
			paper.project.activeLayer.name = "ELD: Ellustrator Circuit Sketch";
			var parent = PaperUtil.queryPrefix("ELD")[0];
		}

		var loadingFunction =  function(item) {
			if(! _.isUndefined(position)) item.position = position;
			item.remove();
			var parent = PaperUtil.queryPrefix("ELD")[0];
			PaperUtil.set(PaperUtil.query(item, {prefix:["NCB"]}), {parent: parent});  
			PaperUtil.set(PaperUtil.query(item, {prefix:["ART"]}), {parent: parent});
			PaperUtil.set(PaperUtil.query(item, {prefix:["CP"]}),  {parent: parent});   
			scope.bindTransforms();
			if(save) hm.save();
		}
		switch(extension){
			case "SVG":
				paper.project.importSVG(url, {
			    	onLoad: loadingFunction
				});
				break;
			case "JSON":
				json = paper.project.importJSON(url);
				this.bindTransforms();
				// loadingFunction(json[0]);
				break;
			default:
				console.log("DID NOT RECOGNIZE", extension, "AS A VALID ELLUSTRATOR FILE.");
				break;
		}
	},
	bindTransforms: function(){
		PaperUtil.set(PaperUtil.query(paper.project, {prefix:["NCB"]}), {
			canvasItem: true, 
			translateable: true,
			scaleable: false, 
			rotateable: false
		});  
		PaperUtil.set(PaperUtil.query(paper.project, {prefix:["RST"]}), {
			canvasItem: true, 
			translateable: true,
			scaleable: true, 
			rotateable: true, 
		});   
		PaperUtil.set(PaperUtil.query(paper.project, {prefix:["ART"]}), {
			canvasItem: true, 
			translateable: true,
			scaleable: true, 
			rotateable: true, 
			
		});
		PaperUtil.set(PaperUtil.query(paper.project, {prefix:["CP"]}), {
			canvasItem: true, 
			translateable: true,
			scaleable: false, 
			rotateable: true, 
		});   
	},
	json: function(){
		return paper.project.exportJSON({
			asString: true,
			precision: 5
		});
	}, 
	png: function (argument) {
	  	paper.view.zoom = 1;
      	paper.view.update();
      	return designer.canvas[0].toDataURL("image/png");              	
	},
	svg: function(){
		paper.view.zoom = 1;
		paper.view.update();
		paper.project.activeLayer.fitBounds(PaperUtil.queryPrefix("NCB")[0].bounds);
		paper.view.update();
		return paper.project.exportSVG({ 
			asString: true,
			precision: 5
		});
	},	
	getRasters: function(){
		rasters = PaperUtil.queryPrefix("RST");
		return _.map(rasters, function(raster){
			return {filename: raster.filename, x: raster.position.x, y: raster.position.y, w: raster.width, h: raster.height}
		});
	},
	addRaster: function(save, filename, position, dWidth, dHeight){
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
					parent: PaperUtil.queryPrefix("ELD")[0],
					image: this, 
					position: position, 
					canvasItem: true, 
					filename: filename, 
					translateable: true, 
					rotateable: true, 
					scaleable: true
				});
				if(_.isUndefined(dWidth)){
					var w = raster.size.width * scale;
					var h = raster.size.height * scale;
					raster.size = new paper.Size(w, h);
				}
				else{
					raster.size = new paper.Size(dWidth, dHeight);
				}
				if(save) hm.save();
				scope.bindTransforms();
				paper.view.update();		
			});
		$('#sandbox').append(rasterImage);	
		
		
	}
}


                 
