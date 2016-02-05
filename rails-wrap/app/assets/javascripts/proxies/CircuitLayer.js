


CircuitLayer.POSITIVE = new paper.Color("red");
CircuitLayer.NEGATIVE = new paper.Color("black");
CircuitLayer.NEUTRAL = new paper.Color("aqua");

CircuitLayer.scaleable = false;
CircuitLayer.translateable = true;
CircuitLayer.rotateable = true;

function CircuitLayer(paper, parent, material){
	this.paper = paper;
	this.className = "CircuitLayer";

	this.layer = new paper.Layer({
		name: material + ":" + "CircuitLayer"
	});
	this.layer.remove();
	parent.addChild(this.layer);
}

CircuitLayer.prototype = {
	add: function(layer, single){
		var scope = this;
		if(single){
			layer.remove();
			layer.layerClass = scope.className;
			var cp = new paper.Group({
				name: "CP: Added trace"
			});
			cp.remove();
			scope.layer.addChild(cp);
			cp.addChild(layer);
			// scope.layer.addChild(layer);
			// this.circuit_view();
		}
		else{
			_.each(layer, function(el, i, arr){
				el.remove();
				el.layerClass = scope.className;
				scope.layer.addChild(el);
			});
			this.trace_view();
		}
	},
	print_view: function(){
		CircuitLayer.select_and_color_and_code(this.layer, ["CNP", "CGP", "CVP"], { strokeColor: "#C0C0C0", dashArray:[10, 1]});
		CircuitLayer.select_and_color_and_code(this.layer, ["CNT", "CGT", "CVT"], { fillColor: "#C0C0C0", dashArray: [10, 1]});

		paper.view.update();
	},
	trace_view: function(){
		CircuitLayer.select_and_color_and_code(this.layer, ["CNP", "CGP", "CVP"], { strokeColor: "#C0C0C0", dashArray:[]});
		CircuitLayer.select_and_color_and_code(this.layer, ["CNT", "CGT", "CVT"], { fillColor: "#C0C0C0", dashArray:[]});

		paper.view.update();
	},
	circuit_view: function(){
		CircuitLayer.select_and_color_and_code(this.layer, ["CNT"], { fillColor: CircuitLayer.NEUTRAL}, CircuitLayer.NEUTRAL);
		CircuitLayer.select_and_color_and_code(this.layer, ["CNP"], { strokeColor: CircuitLayer.NEUTRAL}, CircuitLayer.NEUTRAL);
		CircuitLayer.select_and_color_and_code(this.layer, ["CVT"], { fillColor: CircuitLayer.POSITIVE}, CircuitLayer.POSITIVE);
		CircuitLayer.select_and_color_and_code(this.layer, ["CVP"], { strokeColor: CircuitLayer.POSITIVE}, CircuitLayer.POSITIVE);
		CircuitLayer.select_and_color_and_code(this.layer, ["CGT"], { fillColor: CircuitLayer.NEGATIVE}, CircuitLayer.NEGATIVE);
		CircuitLayer.select_and_color_and_code(this.layer, ["CGP"], { strokeColor: CircuitLayer.NEGATIVE}, CircuitLayer.NEGATIVE);

		paper.view.update();
	}, 

}


CircuitLayer.select_and_color_and_code = function(collection, prefixes, style, polarity){
	var elements = EllustrateSVG.match(collection, { prefix: prefixes });
	_.each(elements, function(el, i, arr){
		el.style = style;
		el.polarity = polarity;
	});
}