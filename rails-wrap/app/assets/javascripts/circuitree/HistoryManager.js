// HistoryManager.js


function HistoryManager(storage){
	this.storage = storage;
	this.current_save = this.getHead();	
}


HistoryManager.prototype = {
	getHistory: function(){
		save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	
		return save_events;
	}, 
	getHead: function(){
		return _.max(this.getHistory());
	}, 
	server_save: function(){
		paper.view.update();
		var json  =  designer.json();
		
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

		// sys.log("Saving to the server!");
	},
	save: function(){
		var tool = designer.toolbox.clearTool();
		var s = Math.floor(Date.now() / 1000);
		var timestamp_key = "saveevent_" + s;
		storage.set(timestamp_key, designer.json());
		this.current_save = s;
		// If you are not at head of the list, then remove. 

		if(!_.isNull(tool)){
			tool.dom.click();
		}

		// sys.log("Saved design!");
	}, 
	redo: function(){
		designer.toolbox.clearTool();
		var save_events = this.getHistory();

		var scope = this;
		// GET ALL EVENTS THAT OCCURED AFTER
		var rel_events = _.filter(save_events, function(t){
			return t > scope.current_save; 
		});
		
		if(_.isEmpty(rel_events)){ 
			sys.show("Can't redo...");
			return;
		}
		rel_event = _.min(rel_events);

		console.log("redoing", rel_event);
		
		designer.loadJSON(eval(storage.get('saveevent_' + rel_event)), CircuitDesigner.BLANK_CANVAS);
		this.current_save = rel_event;
		sys.show("Redoing last action");
	},
	undo: function(){
		designer.toolbox.clearTool();
		var save_events = this.getHistory();
		var scope = this;
		var rel_events = _.filter(save_events, function(t){
			return t < scope.current_save; 
		});
		
		if(_.isEmpty(rel_events)){ 
			sys.show("Can't undo...");
			return;
		}
		rel_event = _.max(rel_events);
		
		designer.loadJSON(eval(storage.get('saveevent_' + rel_event)), CircuitDesigner.BLANK_CANVAS);
		this.current_save = rel_event;
		sys.show("Undoing last acition");
	}, 

	clear_history: function(){
		designer.toolbox.clearTool();
		designer.toolbox.clearTool();
		storage.clear();
		sys.show("Clearing browser history.");
	},
	revert: function(){
		designer.toolbox.clearTool();
		save_events = this.getHistory();

		if(_.isEmpty(save_events)){
			console.log("No save events to revert to...");
			return;
		}

		console.log("save events", save_events);
		last_event =  _.min(save_events);

		console.log("loading json", last_event);

		this.loadJSON(eval(storage.get('saveevent_' + last_event)), CircuitDesigner.BLANK_CANVAS);
		this.current_save = last_event;
		sys.log("Undoing all changes");
		this.clear_history();
	}
}
