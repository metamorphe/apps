function CanvasPanTool(){
	this.name = "CanvasPanTool";
	
	this.tool = new paper.Tool();
	this.tool.wrapper = this;
	var scope = this;

	this.tool.onMouseDrag = function(event){
		_.each(paper.project.layers, function(el, i, arr){
			el.position.x += event.delta.x;
			el.position.y += event.delta.y;
			scope.update();
		});
	}
	this.tool.onPinchMove = function(event){
		sys.show("Zooming to:" + event.scale);
		paper.view.zoom = event.scale;
		paper.view.update();
	}		
}


CanvasPanTool.prototype = {
	enable: function(){
		sys.log("Activated the Canvas Pan Tool.");
		console.log("Activated the Canvas Pan Tool.");
		var scope = this;
	   	this.hammertime = Hammer($('canvas')[0]);
	    this.hammertime.on('pinchmove', scope.tool.onPinchMove);
	},
	disable: function(){
	   console.log("Canvas Pan Disabled");
	   var scope  = this;
	   this.hammertime.off('pinchmove', scope.tool.onPinchMove);
	},
	update: function(){
		paper.view.update();
	}, 
	clear: function(){
		
	},
	selectAll: function(flag){
		paper.project.activeLayer.selected = flag;
	}
}