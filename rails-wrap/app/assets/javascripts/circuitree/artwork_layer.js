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
			el.style = {
						fillColor: "#00A8E1",
						shadowColor: new paper.Color(0.8),
    					shadowBlur: 0,
    					shadowOffset: new paper.Point(0, 0)
    				};
			scope.layer.addChild(el);
		});
	}, 
	remove: function(id){
		
	}, 
	ghostify: function(){
		if(this.layer.opacity == 1)
			this.layer.opacity = 0.5;
		else
			this.layer.opacity = 1;
		paper.view.update();
	}, 
	print_mode: function(mode){
		if(mode){
			this.layer.opacity = 1; 
			this.layer.style = {
				fillColor: "black", 
				shadowBlur: 0
			}
		}
		else{
			this.layer.style = {
						fillColor: "white",
						shadowColor: new paper.Color(0.8),
    					shadowBlur: 10,
    					shadowOffset: new paper.Point(0, 0)
    				};
    			}

	}
}
