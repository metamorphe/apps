function Artwork(svgPath, loadFN){
	this.svgPath = svgPath;
	this.extension = svgPath.split(".");
	this.extension = this.extension[this.extension.length - 1];
	this.svg = null;
}

Artwork.prototype = {
	/**
	 * Returns an arrays of strings, where each string is the name
	 * of a queryable object, prefix included.
	 */
	clone: function(){
		cl = new Artwork(this.svgPath, this.loadFN, true);
		cl.svg = this.svg.clone();
		return cl;
	},
	remove: function(){
		this.svg.remove();
	},
	queryable: function(){
		return _.map(this.query({}), function(el){
			return el.name;
		});
	},
	import:  function(loadFN, type) {
		var scope = this;
		if(this.extension == "SVG"){
		 	paper.project.importSVG(this.svgPath, function(item) {
		 		var wrapper = scope.queryPrefix("ELD");
		 		if(wrapper.length > 0)
		 			paper.project.activeLayer.addChildren(wrapper.children);
		 		else
		 			paper.project.activeLayer.addChild(wrapper);
		 		
		 		scope.svg = paper.project.activeLayer;
	 			// PaperUtil.fitToViewWithZoom(scope.svg, paper.view.bounds.expand(-280))
			    loadFN(scope);
			});
		}
	 	else{
			console.log("IMPLEMENTATION JSON IMPORT");
		}
	},
	query: function(selector){
		return PaperUtil.query(this.svg, selector);
	},
	queryPrefix: function(selector){
		return this.query({prefix: [selector]});
	}
}

Artwork.getPrefix = function(item){
	if(_.isUndefined(item)) return "";
	if(_.isUndefined(item.name)) return "";
	// if(item.name.split(":").length < 2) return "";
	if(item.name.split(":").length < 2) return "";
	return item.name.split(":")[0].trim();
}

Artwork.getPrefixItem = function(item){
	if(_.isUndefined(item)) return "";
	if(item.split(":").length < 2) return "";
	return item.split(":")[0].trim();
}


Artwork.getName = function(item){
	if(_.isUndefined(item)) return "";
	if(_.isUndefined(item.name)) return "";
	if(item.name.split(":").length < 2) return "";
  return item.name.split(":")[1].trim();
}