function Materials(dom){
	this.dom = dom;
	this.materials = _.map(this.dom.children(), function(value, key, arr){
		var gauge = parseInt($(value).attr('data-gauge'));
		var color = $(value).attr('data-color');
		
		$(value).attr('value', key);
		var mat = new Material(gauge, color);
		return mat;
	});
}
Materials.prototype = {
	at: function(i){
		return this.materials[i];
	}
}

function Material(gauge, color){
	this.gauge = gauge;
	this.diameter = Ruler.gauge2mm(gauge);
	this.color = color;
}
Material.prototype = {
	getStyle: function(){
		return {
			strokeColor: this.color,
			strokeWidth: Ruler.mm2pts(this.diameter)
		};
	}
}