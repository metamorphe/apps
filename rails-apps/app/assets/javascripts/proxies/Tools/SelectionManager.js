function SelectionManager(){
	this.selection_group = [];
}
SelectionManager.prototype = {
	add: function(cluster, shiftKey){
		matched = _.filter(this.selection_group, function(el){
			return el.id == cluster.id
		})
		if(matched.length > 1) return;
		this.clear();
		this.selection_group = [cluster];
		cluster.selected = true;
		this.update();
	},
	rotate: function(angle){
		_.each(this.selection_group, function(el, i, arr){
			if(! el.rotateable) return;
			el.rotation = angle;
		});
	},
	translate: function(delta){
		_.each(this.selection_group, function(el, i, arr){
			if(! el.translateable) return;
			el.position.x += delta.x;
			el.position.y += delta.y;
		});
	},
	scale: function(sx, sy){
		_.each(this.selection_group, function(el, i, arr){
			if(! el.scaleable) return;
			el.scaling.x = sx;
			el.scaling.y = sy;
		});
	},
	update: function(){
		paper.view.update();
	},
	remove: function(){
		console.log("REMOVING", hm)
		_.each(this.selection_group, function(el, i, arr){
			el.selected = false;
			el.remove();
		});
		this.selection_group = [];
		hm.save();
	}, 
	clear: function(){
		var scope = this;
		_.each(this.selection_group, function(el, i, arr){
			el.selected = false;
		});
		this.selection_group = [];
	
	}
}