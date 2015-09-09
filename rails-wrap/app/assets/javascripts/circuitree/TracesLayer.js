function TracesLayer(paper){
	this.paper = paper;
	this.className = "TracesLayer";
	this.collection = [];
	this.lock_mode = false;
	this.draw_mode = false;
	this.well_mode = false;
	this.debug_mode = false;
}

TracesLayer.prototype = {
	get: function(id){
		return this.collection[id];
	},
	add: function(item, terminals_config){
		console.log("Adding traces el", item.id, item.name, terminals_config);
		var ci = new CanvasItem(this.paper, item, this.className + "Element", terminals_config)
		ci.trace_id = guid();
		this.collection.push(ci);
		this.update(true);
	}, 
	drawify: function(){
		var scope = this;
		if(scope.draw_mode){
			_.each(scope.collection, function(el, i, arr){
				// el.addTerminals();
			});
		}				
		else{
			_.each(scope.collection, function(el, i, arr){
				// el.removeTerminals();
			});
		}
	},
	lockify: function(){
		var scope = this;
		if(scope.lock_mode){
			// lock true logic
			$('#lock').addClass("btn-warning").removeClass("btn-ellustrator");

		}				
		else{
			$('#lock').removeClass("btn-warning").addClass("btn-ellustrator");
			// lock false logic
		}
	},
	update: function(bypass){
		this.lockify();
		this.drawify();
		paper.view.update();
	}, 
	getAllTraces: function(){
		return this.collection;
	}
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}