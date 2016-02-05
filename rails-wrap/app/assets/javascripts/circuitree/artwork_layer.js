// Artwork Layer
// Artwork elements are CanvasElements
// Applies filters to all Artwork elements added
// Lock/unlock position
var last_added = null;
ArtworkLayer.scaleable = true;
ArtworkLayer.translateable = true;
ArtworkLayer.rotateable = true;

function ArtworkLayer(paper, parent){
	this.paper = paper;
	this.className = "ArtworkLayer";
	this.layer = new paper.Layer({ 
		name: "NC: ArtworkLayer"
	});
	this.layer.remove();
	parent.addChild(this.layer);
}

ArtworkLayer.prototype = {
	add: function(layer){
		var scope = this;
		_.each(layer, function(el, i, arr){
			el.remove();
			el.layerClass = scope.className;
			scope.layer.addChild(el);
		});
	}, 
	remove: function(id){
		
	}
}
