function SelectionManager(paper){
	this.paper = paper;
	this.collection = {};
	// var s = createSelectionRectangle([]);
	// this.selection_rectangle = s.rect;
	// this.selection_group = s.group;
	this.selection_group = [];
}
SelectionManager.prototype = {
	add: function(cluster, shiftKey){
		var inCollection = _.includes(_.keys(this.collection), cluster.canvasItem.guid);
		if(shiftKey && inCollection){
			this.remove(cluster);
			this.update();
		}
		else{
			// if(!shiftKey && !inCollection) 
			this.clear();
			this.collection[cluster.canvasItem.guid] = cluster;
			this.selection_group = [cluster];
			cluster.selected = true;
			this.update();
		}
	},
	rotate_each: function(){

	},
	rotate: function(angle){
		// this.selection_rectangle.rotation = angle;
		_.each(this.selection_group, function(el, i, arr){
			if(! eval(el.layerClass + ".rotateable")) return;
			el.rotation = angle;
		});
	},
	translate: function(delta){
		// this.selection_rectangle.position.x += delta.x;
		// this.selection_rectangle.position.y += delta.y;
		_.each(this.selection_group, function(el, i, arr){
			// console.log(el);
			if(! eval(el.layerClass + ".translateable")) return;
			el.position.x += delta.x;
			el.position.y += delta.y;
		});
	},
	scale: function(sx, sy){
		// this.selection_rectangle.scaling.x = sx;
		// this.selection_rectangle.scaling.y = sy;
		_.each(this.selection_group, function(el, i, arr){
			if(! eval(el.layerClass + ".scaleable")) return;
			el.scaling.x = sx;
			el.scaling.y = sy;
		});
	},
	update: function(){
		// this.selection_rectangle.remove();
		// var s = createSelectionRectangle(_.values(this.collection));
		// this.selection_rectangle = s.rect;
		// this.selection_group = s.group;
		// this.paper.project.activeLayer.addChild(this.selection_rectangle);
	},
	remove: function(){
		// cluster.canvasItem.selection_rectangle.remove();
		// cluster.canvasItem.path.selected = false;
		// delete this.collection[cluster.canvasItem.guid];
		_.each(this.selection_group, function(el, i, arr){
			el.selected = false;
			el.remove();
		});
		this.selection_group = [];
	}, 
	clear: function(){
		var scope = this;
		_.each(this.selection_group, function(el, i, arr){
			el.selected = false;
		});
		this.selection_group = [];
		// _.each(this.collection, function(el, i, arr){
		// scope.remove(el);
		// scope.remove();
		// });
		// this.collection = {};
		// this.update();
	}
}