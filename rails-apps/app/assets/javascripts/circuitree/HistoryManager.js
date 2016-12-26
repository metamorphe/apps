// HistoryManager.js

function HistoryManager(storage){
	this.current_save = this.getHead();
	this.save_buffer = [];
	this.init();
}

HistoryManager.prototype = {
	init: function(){
		var scope = this;
		if(this.getHead() == Number.NEGATIVE_INFINITY){
			if(design.svg.url)
				designer.addContent(true, design.svg.url, true);
		}else{
			this.trimToHead();
			this.loadEvent(this.current_save);
		}
	},
	clear_all: function(){
		var scope = this;
		designer.clear();
		designer.setupSurface();
		this.save();
		paper.view.update();
	},
	loadEvent: function(key){
		var data = JSON.parse(storage.get(key.to_s));
		
		if(data && data.canvas)
			designer.addContent(false, data.canvas, true);

		if(data && data.rasters)
			_.each(data.rasters, function(raster){
				designer.addRaster(false, raster.filename, new paper.Point(raster.x, raster.y), raster.w, raster.h);
			});
		paper.view.update();
	},
	removeTail: function(){
		var save_events = this.getHistory();
		var tail = this.getTail();
		storage.remove(tail.to_s);
	},
	trimToHead: function(){
		var scope = this;
		var save_events = this.getHistory();
		_.chain(save_events).filter(function(event){
			return event.timestamp > scope.current_save.timestamp; 
		}).each(function(event){
			storage.remove(event.to_s);
		});
	},
	getHead: function(){
		return _.max(this.getHistory(), function(h){return h.timestamp});
	}, 
	getTail: function(){
		return _.min(this.getHistory(), function(h){return h.timestamp});
	}, 
	redo: function(){
		var scope = this;
		sys.show("Redoing last action");

		var events = _.chain(this.getHistory()).filter(function(event){
			return event.timestamp > scope.current_save.timestamp; 
		}).value();

		if(events.length == 0) return;

		lastEvent = _.min(events, function(event){ return event.timestamp});
		this.loadEvent(lastEvent);

		this.current_save = lastEvent;
	},
	undo: function(){
		var scope = this;
		sys.show("Redoing last action");

		var events = _.chain(this.getHistory()).filter(function(event){
			return event.timestamp < scope.current_save.timestamp; 
		}).value();

		if(events.length == 0) return;

		lastEvent = _.max(events, function(event){ return event.timestamp});
		this.loadEvent(lastEvent);

		this.current_save = lastEvent;
		vm.update();
	}, 
	clear_history: function(){
		// storage.clear();
		// sys.show("Clearing browser history.");
	}, 
	// GOOD
	clearForSave: function(){
		paper.project.deselectAll();
		// DON'T SAVE RASTERS
		this.save_buffer = PaperUtil.queryPrefix("RST");
		PaperUtil.call(this.save_buffer, 'remove')
		paper.view.update();		
	}, 
	unclearForSave: function(){
		var parent = PaperUtil.queryPrefix("ELD")[0];
		_.each(this.save_buffer, function(el){
			parent.addChild(el);
		});
		paper.view.update();
	}, 
	generateKey: function(){
		var type = "save";
		var design_id = design.id;
		var timestamp = Math.floor(Date.now() / 1000);
		var key =  [design_id, type, timestamp].join('_');
		return {to_s: key, timestamp: timestamp};
	},
	parseKey: function(key){
		var keyparse = key.split("_");
		if(keyparse.length > 3) return {id: 0, type: "invalid", timestamp: 0}
		return {id: parseInt(keyparse[0]), type: keyparse[1], timestamp: parseInt(keyparse[2]), to_s: key}
	},
	save: function(){
		var key = this.generateKey();
		console.log(key);
		var save_data = {
			rasters: designer.getRasters(), 	
		}
		this.clearForSave();
		save_data["canvas"] = designer.json();

		// PRUNE THE TREE
		// If you are not at head of the list, then remove. 
		if(this.current_save != this.getHead()) this.trimToHead();
		
		storage.set(key.to_s, JSON.stringify(save_data));
		this.current_save = key;

		this.unclearForSave();
	}, 
	getHistory: function(){
		var scope = this;
		var keys = _.map(storage.keys(), function(key){
			return scope.parseKey(key);
		});	
		keys = _.filter(keys, function(key){
			return key.id == design.id;
		});
		return keys;
	},
	server_save: function(){
		this.clearForSave();
		var scope = this;
		var json  =  designer.json();
		var name = design.name.trim();
		var png = designer.png();
		var svg = designer.svg();

		var data = {
			image: png,
			json: json, 
			svg: svg, 
			name: name
		}
		console.log("SAVING TO SERVER");

		$.ajax({
		  url: '/designs/' + design.id + "/design_update",
		  type: 'POST',
		  data: data,
		  success: function(data) {
		    sys.log("Saved to the server!");
		    scope.unclearForSave();
		  }
		});
	}
}

