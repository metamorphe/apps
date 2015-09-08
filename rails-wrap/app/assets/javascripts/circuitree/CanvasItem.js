

function CanvasItem(paper, path, type, terminals){
	if(_.isUndefined(terminals)) terminals = [];

	this.className = "CanvasItem";
	this.paper = paper;
	this.id = path.id;

	
	this.type = type;
	this.path = new paper.Group([path]);
	this.path.canvasItem = this;

	this.path.applyMatrix = true;
	// if(!_.isUndefined(this.path.parent)){
	// 	this.path.parent.applyMatrix = true;
	// }
	this.name = path.name;

	// transformation rectangle
	this.ref_x = false;
	this.ref_y = false;
	
	this.init_bounds = path.bounds.clone().expand(10, 10);
	this.selection_rectangle = this.initSelectionRectangle();
	
	// c.remove();
	// c.parent.removeChild(c);
	// this.path.addChild(c);
	// var g = new paper.Group([this.path, c]);
	// paper.project.activeLayer.addChild(c);
	if(terminals.length > 0) this.addTerminals(terminals);
}
CanvasItem.prototype = {
	setOpacity: function(val){
		this.path.opacity = val;
	},
	getBounds: function(){
		return this.path.bounds;
	},
	addTerminals: function(config){
		var b = this.path.bounds;
		this.terminals = {};
		console.log("TERM", this.path.className);
		// console.log(this.name, b);
		if(config.indexOf('w') != -1){
			this.terminals['w'] = this.paper.Path.Circle({
				fillColor: "red", 
				radius: 5, 
				position: b.leftCenter, 
				name: "terminal", 
				parent: this.path
			});

		}
		if(config.indexOf('e') != -1){
			this.terminals['e']  = this.paper.Path.Circle({
				fillColor: "black", 
				radius: 5, 
				position: b.rightCenter, 
				name: "terminal", 
				parent: this.path
			});
		}
		if(config.indexOf('s') != -1){
			this.terminals['s']  = this.paper.Path.Circle({
				fillColor: "red", 
				radius: 5, 
				position: b.bottomCenter, 
				name: "terminal", 
				parent: this.path
			});
		}
		if(config.indexOf('n') != -1){
			this.terminals['n']  = this.paper.Path.Circle({
				fillColor: "black", 
				radius: 5, 
				position: b.topCenter, 
				name: "terminal", 
				parent: this.path
			});
		}
	}, 
	duplicate: function(){
		var p = this.path.clone();
		var wp = new CanvasItem(paper, p);
		wp.material = this.material;
		wp.reflect_x = this.reflect_x;
		wp.reflect_y = this.reflect_y;
		wp.path.id = 47;
		wp.path.position.x +=5;
		wp.update();
		return wp;
	},
	reflect_x: function(){
		this.ref_x != this.ref_x;
		this.path.scaling.x *= -1;
		this.paper.view.update();
	},
	reflect_y: function(){
		this.ref_y != this.ref_y;
		this.path.scaling.y *= -1;
		this.paper.view.update();
	},
	remove: function(){
		this.path.remove();
		this.selection_rectangle.remove();
	},
	initSelectionRectangle: function() {
	    var b = this.path.bounds.clone().expand(10, 10);
	    selectionRectangle = new paper.Path.Rectangle(b);
	    
	   	selectionRectangle.position = b.center.clone();
	 
	    selectionRectangle.pivot = selectionRectangle.position;
	    selectionRectangle.insert(2, new paper.Point(b.center.x, b.top));
	    selectionRectangle.insert(2, new paper.Point(b.center.x, b.top-25));
	    selectionRectangle.insert(2, new paper.Point(b.center.x, b.top));
	    selectionRectangle.strokeWidth = 1;
	    selectionRectangle.strokeColor = '#00A8E1';
	    selectionRectangle.name = "selection rectangle";
	    selectionRectangle.selected = true;
	    selectionRectangle.ppath = this.path;
	    selectionRectangle.item = this;
	    selectionRectangle.ppath.pivot = selectionRectangle.pivot;
	   	selectionRectangle.remove();


		selectionRectangle.position = this.path.bounds.center.clone();
				
        this.init_size = new paper.Point(b.left, b.bottom).subtract(b.center).length;
        selectionRectangle.applyMatrix = true;
	
	    return selectionRectangle;
	}, 
	updateHandles: function(){
		this.selection_rectangle.remove()
		this.selection_rectangle = this.initSelectionRectangle();
	}
}




