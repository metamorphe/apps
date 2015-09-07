CircuitDesigner.defaultTool;


function CircuitDesigner(container){
	this.paper = paper;
	this.container = container;
	this.nodes = new Circuit();
	this.art_layer = new ArtworkLayer(paper);
	CircuitDesigner.defaultTool = $('#pan-tool');

	this.init();
	this.update();
		
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
		this.paper.view.zoom = 2.5;	
		var scope = this; 

		// Setups tools
	    this.toolbox = new Toolbox(this.paper, $("#toolbox"));	
	    this.toolbox.add("anchortool", $('#anchor-tool'), new AnchorPointTool(this.paper));
		this.toolbox.add("pathtool", $('#path-tool'),  new TracePathTool(this.paper));
		this.toolbox.add("transformtool", $('#transform-tool'),  new TransformTool(this.paper));
		this.toolbox.add("pantool", $('#pan-tool'),  new PanTool(this.paper));
		
		this.toolbox.enable("pantool");
		return this;
	},
	update: function(){
		if(typeof this.paper == "undefined") return;
		paper.view.update();
	},

	clear: function(){
		this.paper.project.clear();
		this.nodes.clear();
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
	    			scope.art_layer.add(item);
			    	CircuitDesigner.retainGroup(item, position, callback, scope);
	    		}
	    	}
		});
	},
	loadJSON: function(json, callback){
		var scope = this;
		scope.clear();

		var item = this.paper.project.importJSON(json); 
		var layer = item[0];	
		console.log("Loading json", layer);
		// if valid JSON
		if(!_.isUndefined(layer) && !_.isUndefined(layer.children)){  
	    		CircuitDesigner.retainGroup(layer, paper.view.center, callback, scope);
		} else{
			console.log('No layer detected!');
		}

    	paper.tool = null;
       	CircuitDesigner.defaultTool.click().focus();
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
	
	// paper.project.activeLayer.addChild(item);
	   
	// this.update();
	
	// if(_.isUndefined(position))
 //    	item.position = paper.view.center;
 //    else
 //    	item.position = position;

	CircuitDesigner.defaultTool.click().focus();
}



                                                              

