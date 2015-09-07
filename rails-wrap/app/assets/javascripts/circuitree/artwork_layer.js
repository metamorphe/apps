// Artwork Layer
// Artwork elements are CanvasElements
// Applies filters to all Artwork elements added
// Lock/unlock position


function ArtworkLayer(paper){
	this.paper = paper;
	this.className = "ArtworkLayer";
	this.collection = [];
	this.ghost_mode = false;
	this.lock_mode = false;
}

ArtworkLayer.prototype = {
	get: function(id){
		return this.collection[id];
	},
	add: function(item){
		console.log("Adding artwork", item.id, item.name);
		var ci = new CanvasItem(this.paper, item, this.className + "Element")
		ci.art_id = this.collection.length;
		this.collection.push(ci);
		this.update(true);
	}, 
	lockify: function(){
		var scope = this;
		if(scope.lock_mode){
			// lock true logic
			$('#ghost').prop("disabled", true);
			$('#lock').addClass("btn-warning").removeClass("btn-ellustrator");

		}				
		else{
			$('#ghost').prop("disabled", false);
			$('#lock').removeClass("btn-warning").addClass("btn-ellustrator");
			// lock false logic
		}
	},
	ghostify: function(bypass){

		if(_.isUndefined(bypass)) bypass = false;
	
		if(!bypass)
		  if(this.lock_mode) return;

		var scope = this;
		if(scope.ghost_mode){
			_.each(this.collection, function(el, i, arr){
				el.setOpacity(0.3);
			});				
			$('#ghost').addClass("btn-warning").removeClass("btn-ellustrator");
		}
		else{
			_.each(this.collection, function(el, i, arr){
				el.setOpacity(1.0);
			});
				$('#ghost').removeClass("btn-warning").addClass("btn-ellustrator");
		}
		
	},
	update: function(bypass){
		this.ghostify(bypass);
		this.lockify();
		paper.view.update();
	}
}