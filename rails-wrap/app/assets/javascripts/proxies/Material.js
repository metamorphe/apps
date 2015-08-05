function Materials(dom){

	this.dom = dom;

	this.materials = {};
	var scope = this;
	_.each(this.dom, function(el, i, arr){
		var componentType = $(el).data("component-type");
		scope.materials[componentType] = _.map($(el).children(), function(component, key, arr){
					var properties = {};
					var data_properties = _.filter(component.attributes, function(e, j, arr2){
						return e.name.indexOf("data") == 0;
					});	
					var data_properties = _.each(data_properties, function(e, j, arr2){
						var s = e.name.split('-');
						s = s.splice(1)
						var key = s[0];
						var secondary_key = s.slice(1).join("_").replace("-", "_");
						
						if(!(key in properties)) properties[key] = {};
						
						properties[key][secondary_key] = e.value;
					});
					// var gauge = parseInt($(value).attr('data-gauge'));
					// var color = $(value).attr('data-color');

					// $(value).attr('value', key);
					// var mat = new Material(gauge, color);
					return properties;
				});
	});
	console.log(this.materials);
}
Materials.prototype = {
	at: function(i){
		return this.materials[i];
	}, 
	find: function(other){
		for(var i in this.materials){
			if(this.materials[i].equals(other))
				return i;
		}
		return -1;
	}
}

function Material(gauge, color){
	this.gauge = gauge;
	this.diameter = Ruler.gauge2mm(gauge);
	this.color = new paper.Color(color);
}
Material.prototype = {
	getStyle: function(){
		return {
			strokeColor: this.color,
			strokeWidth: Ruler.mm2pts(this.diameter), 
			shadowColor: new paper.Color(0.2, 0.2, 0.2), 
			shadowBlur: Ruler.mm2pts(this.diameter) * 2, 
			shadowOffset: new paper.Point(Ruler.mm2pts(this.diameter)/2, Ruler.mm2pts(this.diameter)/2)
		};
	}, 
	equals: function(m){
		return m.gauge == this.gauge && m.color.toCanvasStyle() == (this.color.toCanvasStyle());
	}
}

Material.detectMaterial =  function(path){
	var s = path.style;
	var gauge = Ruler.pts2gauge(parseFloat(s.strokeWidth));
	var color = s.strokeColor;
	return new Material(gauge, color);
}