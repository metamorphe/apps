//    d88b d888888b  d888b  d8888b. d88888b .d8888. d888888b  d888b  d8b   db d88888b d8888b. 
//    `8P'   `88'   88' Y8b 88  `8D 88'     88'  YP   `88'   88' Y8b 888o  88 88'     88  `8D 
//     88     88    88      88   88 88ooooo `8bo.      88    88      88V8o 88 88ooooo 88oobY' 
//     88     88    88  ooo 88   88 88~~~~~   `Y8b.    88    88  ooo 88 V8o88 88~~~~~ 88`8b   
// db. 88    .88.   88. ~8~ 88  .8D 88.     db   8D   .88.   88. ~8~ 88  V888 88.     88 `88. 
// Y8888P  Y888888P  Y888P  Y8888D' Y88888P `8888Y' Y888888P  Y888P  VP   V8P Y88888P 88   YD 
JigDesigner.SVG = 0;
JigDesigner.JSON = 1;  
JigDesigner.EXPORT_DEFAULT = JigDesigner.SVG;                                                                                        
                             
function JigDesigner(container, svg){
	this.paper;
	this.container = container;
	this.svg = svg;
	this.gauge = 14;
	this.init();

	save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	

	latest_event =  _.max(save_events);
	this.current_save = latest_event;

}

// var point_manip = null;

JigDesigner.prototype = {
	addBackground: function(){
		var rectangle = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(paper.view.size.width * paper.view.zoom, paper.view.size.height * paper.view.zoom));
		var bg = new paper.Path.Rectangle(rectangle);
		bg.fillColor = new paper.Color(0);
		bg.sendToBack();	

	},
	update: function(){
		console.log("Importing", this.svg);
		if(typeof this.paper == "undefined") return;

		var scope = this;
		this.paper.project.activeLayer.removeChildren();
		
			if(_.isUndefined(scope.svgSym)){
				this.importSVG(function(){
				});
			} 	   
		
		paper.view.update();
	},
	clear: function(){
		// paper.project.activeLayer.removeChildren();
		this.paper.project.clear();
		this.wirepaths.clear();
		this.paper.view.update();
	},
	loadJSON: function(json, callback){
		console.log("Loading json", json);
		var scope = this;
		// this.paper.project.activeLayer.removeChildren();

		var item = this.paper.project.importJSON(json); 
		
		var layer = item[0];
		for(var i = 0; i < layer.children.length; i ++){
			var group = layer.children[i];

	    	
			scope.toolbox.tools.anchortool.toolholder.setSVG(item);
			group.position = paper.view.center;

			_.each(Utility.unpackChildren(group, []), function(value, key, arr){
				var w  = new WirePath(scope.paper, value);
				scope.wirepaths.add(w.id, w);
				console.log("loading ", w.path.name);
				factory.activePath = w.id;
			});
		}
    	scope.toolbox.tools.anchortool.toolholder.selectAll(false);
    	paper.tool = null;
    	
    	item.selected = true;
    	$('#transform-tool').click().focus();
    	
  		paper.project.activeLayer.addChild(group);
	
	},
	addSVG: function(filenamer, position, callback){
		console.log("position", position);
		var scope = this;
		this.paper.project.importSVG(filenamer, {
	    	onLoad: function(item) { 
		    	
		    	paper.project.activeLayer.addChild(item);
		   
		    	paper.view.update();
		    	if(_.isUndefined(position))
			    	item.position = paper.view.center;
			    else
			    	item.position = position;

    			scope.toolbox.tools.anchortool.toolholder.setSVG(item);
    			// scope.wirepaths = new Wires();

    			_.each(Utility.unpackChildren(item, []), function(value, key, arr){
    				var w  = new WirePath(scope.paper, value);
    				scope.wirepaths.add(w.id, w);
    				console.log("filename", filenamer);
    				w.path.name = filenamer;
    				factory.activePath = w.id;
    			});

		    	scope.toolbox.tools.anchortool.toolholder.selectAll(false);
		    	// paper.tool = null;
		    	
		    	item.selected = true;
		    	$('#transform-tool').click().focus();
	    }});
	},
	importSVG: function(callback){
		var scope = this;
		console.log(scope);
		this.paper.project.importSVG(this.svg, {
	    	onLoad: function(item) { 
		    	scope.svgSym = item;
		    	;
		    	paper.project.activeLayer.addChild(item);

		    	paper.view.update();
		    	item.position = paper.view.center;

    			scope.toolbox.tools.anchortool.toolholder.setSVG(item);
    			scope.wirepaths = new Wires();

    			_.each(Utility.unpackChildren(item, []), function(value, key, arr){
    				var w  = new WirePath(scope.paper, value);
    				w.path.name = scope.svg;
    				scope.wirepaths.add(w.id, w);
    			});

		    	scope.toolbox.tools.anchortool.toolholder.selectAll(false);
		    	// paper.tool = null;
		    	$('#transform-tool').click().focus();
	    }});
	},
	init: function(){
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

	    this.toolbox = new Toolbox(this.paper, $("#toolbox"));	
	    this.toolbox.add("anchortool", $('#anchor-tool'), new AnchorPointTool(this.paper));
		this.toolbox.add("vectortool", $('#vector-tool'),  new VectorTool(this.paper));
		this.toolbox.add("transformtool", $('#transform-tool'),  new TransformTool(this.paper));
		this.update();
		
		return this;
	},
	save: function(){
		var s = Math.floor(Date.now() / 1000);
		var timestamp_key = "saveevent_" + s;
		console.log("Timestamp", timestamp_key);
		storage.set(timestamp_key, this.export(JigDesigner.JSON, false));
		this.current_save = s;
	},
	redo: function(){
		var save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	
		var scope = this;
		var rel_events = _.filter(save_events, function(t){
			return t > scope.current_save; 
		});
		// console.log(save_events, rel_events, this.current_save);
		
		if(_.isEmpty(rel_events)){ 
			console.log("Can't redo...");
			return;
		}
		this.clear();
		rel_event = _.min(rel_events);
		console.log("redoing", rel_event);
	
		this.loadJSON(storage.get('saveevent_' + rel_event));
		this.current_save = rel_event;
		

	},
	undo: function(){
		var save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	
		var scope = this;
		var rel_events = _.filter(save_events, function(t){
			return t < scope.current_save; 
		});
		
		if(_.isEmpty(rel_events)){ 
			console.log("Can't undo...");
			return;
		}
		this.clear();
		rel_event = _.max(rel_events);

		// console.log("undoing", rel_event);
		
		this.loadJSON(storage.get('saveevent_' + rel_event));
		this.current_save = rel_event;
		

	}, 
	revert: function(){
		save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	

		if(_.isEmpty(save_events)){
			console.log("No save events to revert to...");
			return;
		}

		console.log("save events", save_events);
		last_event =  _.min(save_events);

		this.clear();
		console.log("loading json", last_event);

		this.loadJSON(storage.get('saveevent_' + last_event))
		this.current_save = last_event;
		
	}, 
	clear_history: function(){
		storage.clear();
		this.clear();
		this.save();
	},
	fast_forward: function(){
		save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	

		if(_.isEmpty(save_events)){
			console.log("No save events to revert to...");
			return;
		}

		console.log("save events", save_events);
		last_event =  _.max(save_events);

		this.clear();
		console.log("loading json", last_event);

		this.loadJSON(storage.get('saveevent_' + last_event))
		this.current_save = last_event;
		
	}, 
	export: function(mode, downloadFlag){
		// var prev = this.paper.view.zoom;
		// this.paper.view.zoom = 1;
		// default
		var exp;
		var filename = $('#filename').val();
		if(filename == ""){	filename = "export"; }
		filename = filename.split('.')[0];

		if(_.isUndefined(mode))
			mode = JigDesigner.EXPORT_DEFAULT;

		if(_.isUndefined(downloadFlag))
			downloadFlag = true;

		
		if(mode == JigDesigner.SVG){
			console.log("Exporting file as SVG");
			exp = this.paper.project.exportSVG({
				asString: true,
				precision: 5
			});
			if(downloadFlag)
				saveAs(new Blob([exp], {type:"application/svg+xml"}), filename + ".svg")
		}
		else if(mode == JigDesigner.JSON){

			console.log("Exporting file as JSON");
			exp = this.paper.project.exportJSON({
				asString: true,
				precision: 5
			});
			if(downloadFlag)
				saveAs(new Blob([exp], {type:"application/json"}), filename + ".json")
		}


			// exp = this.canvas[0].toDataURL("image/png");
		// else 
			// exp = "No mode was specified";
		
	
		// console.log(exp);
		// this.paper.view.zoom = prev;

		return exp;
	}
}
                                                              
                                                              

