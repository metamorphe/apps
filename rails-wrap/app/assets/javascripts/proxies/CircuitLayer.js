CircuitLayer.POSITIVE = new paper.Color("red");
CircuitLayer.NEGATIVE = new paper.Color("black");
CircuitLayer.NEUTRAL = new paper.Color("#CCC");
// CircuitLayer.NEUTRAL.saturation -= 0.5;
CircuitLayer.scaleable = false;
CircuitLayer.translateable = true;
CircuitLayer.rotateable = true;
CircuitLayer.silver = new paper.Color("#839CA5");
CircuitLayer.legend = function(parent, pt){
	legend = new paper.Group({
		parent: parent,
		name: "NC: artboard"
	});
	var positive =  new paper.Path.Rectangle({
		parent: legend, 
		fillColor: CircuitLayer.POSITIVE, 
		width: 15, 
		height: 15, 
		// strokeColor: "black", 
		strokeWidth: 0.5,
		position: new paper.Point(0, 0)
	});
	var ptext = new paper.PointText({
			parent: legend, 
			point: new paper.Point(0, 00),
			content: "POSITIVE",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			// fontWeight: 'bold', 
			fontSize: 12
	});
	ptext.point.x += ptext.bounds.width/4;
	ptext.point.y += ptext.bounds.height/3;
	var negative =  new paper.Path.Rectangle({
		parent: legend, 
		fillColor: CircuitLayer.NEGATIVE, 
		width: 15, 
		height: 15, 
		// strokeColor: "black", 
		strokeWidth: 0.5,
		position: new paper.Point(0, 20)
	});
	var netext = new paper.PointText({
			parent: legend, 
			point: new paper.Point(0, 20),
			content: "NEGATIVE",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			// fontWeight: 'bold', 
			fontSize: 12
	});
	netext.point.x += netext.bounds.width/4;
	netext.point.y += netext.bounds.height/3;
	var neutral =  new paper.Path.Rectangle({
		parent: legend, 
		fillColor: CircuitLayer.NEUTRAL, 
		width: 15, 
		height: 15, 
		// strokeColor: "black", 
		strokeWidth: 0.5,
		position: new paper.Point(0, 40)
	});
	var ntext = new paper.PointText({
			parent: legend, 
			point: new paper.Point(0, 40),
			content: "NEUTRAL",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			// fontWeight: 'bold', 
			fontSize: 12
	});
	ntext.point.x += ntext.bounds.width/4;
	ntext.point.y += ntext.bounds.height/3;

	var g =  new paper.Path.Rectangle({
		parent: legend, 
		fillColor: "#00A8E1", 
		width: 15, 
		height: 15, 
		// strokeColor: "black", 
		strokeWidth: 0.5,
		position: new paper.Point(0, 60)
	});
	var gtext = new paper.PointText({
			parent: legend, 
			point: new paper.Point(0, 60),
			content: "GUIDES",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			// fontWeight: 'bold', 
			fontSize: 12
	});
	gtext.point.x += gtext.bounds.width/4;
	gtext.point.y += gtext.bounds.height/3;


	legend.position = pt;
	legend.position.x -= legend.bounds.width;
	legend.position.y += 50;
	return legend;
}
function CircuitLayer(paper, parent, material){
	this.paper = paper;
	this.className = "CircuitLayer";

	this.layer = new paper.Layer({
		name: material + ":" + "CircuitLayer"
	});
	this.layer.remove();
	parent.addChild(this.layer);
	var legendPosition = paper.view.bounds.topRight.clone();
	this.legend = CircuitLayer.legend(this.layer, legendPosition);
	this.legend.remove();
}

CircuitLayer.prototype = {
	add: function(layer, single){
		var scope = this;
		if(single){
			layer.remove();
			layer.layerClass = scope.className;
			
			var cp = new paper.Group({
				parent: scope.layer,
				name: "CP: Added trace", 
				layerClass: scope.className, 
				children: [layer], 
				canvasItem: true
			});

			this.circuit_view();
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
		this.legend.remove();
		CircuitLayer.select_and_color_and_code(this.layer, ["CNP", "CGP", "CVP"], { strokeColor: "#C0C0C0", shadowBlur: 0, dashArray:[10, 1]});
		CircuitLayer.select_and_color_and_code(this.layer, ["CNT", "CGT", "CVT", "CVTB", "CGTB"], { fillColor: "#C0C0C0", shadowBlur: 0, dashArray: [10, 1]});

		paper.view.update();
	},
	trace_view: function(){
		this.legend.remove();
		CircuitLayer.select_and_color_and_code(this.layer, ["CNP", "CGP", "CVP"], 
			{ 
				strokeColor:CircuitLayer.silver, 
				dashArray:[], 
				shadowColor: new paper.Color(0.8),
			  	shadowBlur: 0,
			  	shadowOffset: new paper.Point(0, 0)
			});

		// console.log("CVT", EllustrateSVG.match(this.layer, {prefix: ["CVT", "CGT", "CNT"]}));
		CircuitLayer.select_and_color_and_code(this.layer, ["CNT", "CGT", "CVT", "CVTB", "CGTB"], 
			{ fillColor: CircuitLayer.silver, 
			  dashArray:[], 
			  shadowColor: new paper.Color(0.8),
			  shadowBlur: 0,
			  shadowOffset: new paper.Point(0, 0)
			});

		paper.view.update();
	},
	resetLegend: function(){
		this.legend.position = paper.view.bounds.topRight.clone();
		this.legend.position.x -= legend.bounds.width;
		this.legend.position.y += 50;
	},
	circuit_view: function(){
		this.addLegend();
		// this.legend.scaling = new paper.Point(this.paper.view.zoom, this.paper.view.zoom);
		// paper.view.bounds.topRight.clone();
		CircuitLayer.select_and_color_and_code(this.layer, ["CNT"], { shadowBlur: 0, fillColor: CircuitLayer.NEUTRAL}, CircuitLayer.NEUTRAL);
		CircuitLayer.select_and_color_and_code(this.layer, ["CNP"], { shadowBlur: 0, strokeColor: CircuitLayer.NEUTRAL}, CircuitLayer.NEUTRAL);
		CircuitLayer.select_and_color_and_code(this.layer, ["CVT", "CVTB"], { shadowBlur: 0, fillColor: CircuitLayer.POSITIVE}, CircuitLayer.POSITIVE);
		CircuitLayer.select_and_color_and_code(this.layer, ["CVP"], { shadowBlur: 0, strokeColor: CircuitLayer.POSITIVE}, CircuitLayer.POSITIVE);
		CircuitLayer.select_and_color_and_code(this.layer, ["CGT", "CGTB"], { shadowBlur: 0, fillColor: CircuitLayer.NEGATIVE}, CircuitLayer.NEGATIVE);
		CircuitLayer.select_and_color_and_code(this.layer, ["CGP"], { shadowBlur: 0, strokeColor: CircuitLayer.NEGATIVE}, CircuitLayer.NEGATIVE);

		paper.view.update();
	}, 
	addLegend: function(){
		this.layer.addChild(this.legend);
		this.resetLegend();
	}

}


CircuitLayer.select_and_color_and_code = function(collection, prefixes, style, polarity){
	var elements = EllustrateSVG.match(collection, { prefix: prefixes });
	_.each(elements, function(el, i, arr){
		el.style = style;
		el.polarity = polarity;
	});
}