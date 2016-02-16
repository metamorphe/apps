
// zoom.js
$(function(){
	$("#zoom-in").click(function(){zoom.in();});
    $("#zoom-out").click(function(){zoom.out();});
    $("#homing").click(function(){zoom.home();});
    $("#scale").click(function(){
      if($(this).hasClass('active')){
        $(this).removeClass('active');
        zoom.hide_scale();
      } else{
        $(this).addClass('active');
        zoom.show_scale();
      }
    });
})
Zoom.STEP = 0.5;
Zoom.MAX = 10;
Zoom.MIN = 0.1;

function Zoom(starting_level, paper){
	this.level = starting_level;
	this.checkbounds();
	
	
}
Zoom.CMRuler = function(pt){
	var w = paper.view.size.width * 0.8;
	var ruler = new paper.Group();
	var from = new paper.Point(0 - 0.5, 0);
	var to = new paper.Point(w + 0.5, 0);
	var base_line = new paper.Path.Line({
						parent: ruler, 
						from: from, 
						to: to, 
						strokeWidth: 4, 
						strokeColor: "black"
					});
	var tickNo = 0;
	for(var i = 0.5; i < w; i+= Ruler.mm2pts(10)){

		var from = new paper.Point(i, 0);
		var to = new paper.Point(i, tickNo % 10 == 0 ? -15: -10);
		var tick = new paper.Path.Line({
						parent: ruler, 
						from: from, 
						to: to, 
						strokeWidth: 1, 
						strokeColor: "black"
					});

		if(tickNo % 10 == 0){
			var pos = new paper.Point(i, -20);
			var text = new paper.PointText({
				parent: ruler, 
				point: pos,
				content: tickNo,
				fillColor: 'black', 
				fontFamily: 'Arial', 
				// fontWeight: 'bold', 
				fontSize: 12
			});
			var text_adj = text.bounds.width / 2;
			text.point.x -= text_adj;
		}
		tickNo ++;
	}
	var pos = new paper.Point(-30, 0);
		var text = new paper.PointText({
			parent: ruler, 
			point: pos,
			content: "cm",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			fontWeight: 'bold', 
			fontSize: 12
		});
	var ruler_adj = ruler.bounds.height * 3;
	pt.y += ruler_adj;
	ruler.position = pt;
	
	return ruler;
}
Zoom.MMRuler = function(pt){
	var w = paper.view.size.width * 0.8;
	var ruler = new paper.Group();
	var from = new paper.Point(0 - 0.5, 0);
	var to = new paper.Point(w + 0.5, 0);
	var base_line = new paper.Path.Line({
						parent: ruler, 
						from: from, 
						to: to, 
						strokeWidth: 4, 
						strokeColor: "black"
					});
	var tickNo = 0;
	for(var i = 0.5; i < w; i+= Ruler.mm2pts(1)){

		var from = new paper.Point(i, 0);
		var to = new paper.Point(i, tickNo % 10 == 0 ? -15: -10);
		var tick = new paper.Path.Line({
						parent: ruler, 
						from: from, 
						to: to, 
						strokeWidth: 1, 
						strokeColor: "black"
					});

		if(tickNo % 10 == 0){
			var pos = new paper.Point(i, -20);
			var text = new paper.PointText({
				parent: ruler, 
				point: pos,
				content: tickNo,
				fillColor: 'black', 
				fontFamily: 'Arial', 
				// fontWeight: 'bold', 
				fontSize: 12
			});
			var text_adj = text.bounds.width / 2;
			text.point.x -= text_adj;
		}
		tickNo ++;
	}
	var pos = new paper.Point(-30, 0);
		var text = new paper.PointText({
			parent: ruler, 
			point: pos,
			content: "mm",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			fontWeight: 'bold', 
			fontSize: 12
		});
	var ruler_adj = ruler.bounds.height * 3;
	pt.y += ruler_adj;
	ruler.position = pt;
	
	return ruler;
}
Zoom.COIN = function(pt){
	var diam = Ruler.mm2pts(24.26);
		pt.x += diam;
		pt.y += diam;
		
		this.scale = paper.Path.Circle({
			center: pt, 
			radius: diam/2, 
			strokeColor: "black"
		});
		var pt = this.scale.bounds.leftCenter.clone();
		pt.x += 15;
		pt.y += 10;
		this.text = new paper.PointText({
			point: pt,
			content: "25¢",
			fillColor: 'black', 
			fontFamily: 'Arial', 
			fontWeight: 'bold', 
			fontSize: 25
		});
}
Zoom.prototype = {
	checkbounds: function(){
		if(this.level > Zoom.MAX) this.level = Zoom.MAX;
		if(this.level < Zoom.MIN) this.level = Zoom.MIN;
	},
	home: function(){
		sys.show("Homing the artboard.");
		var zoomFactorW = artboard.bounds.width / paper.view.size.width;
		var zoomFactorH = artboard.bounds.height / (paper.view.size.height -100);

		_.each(paper.project.layers, function(el, i, arr){
			var pos = paper.view.center.clone();
			pos.y -= 50;
			el.position = pos;
		});

		paper.view.zoom /= Math.max(zoomFactorW, zoomFactorH);
		designer.circuit_layer.resetLegend();
		paper.view.update();
	},
	in: function(){
		this.level += Zoom.STEP;
		this.checkbounds();
		this.update();
	},
	out: function(){
		this.level -= Zoom.STEP;
		this.checkbounds();
		this.update();
	}, 
	show_scale: function(){
		// console.log("showing scale");
		// var b = designer.nodes.bounds().bounds;
		var pt = artboard.bounds.center.clone();
		this.scale = Zoom.CMRuler(pt);

		
		// this.text.position = this.text.bounds.center;
		
		paper.view.update();
	},
	hide_scale: function(){
		// console.log("hiding scale");
		this.scale.remove();
		// this.scale.visibe = false;
		paper.view.update();
	},
	update: function(){
		paper.view.zoom = this.level;
		paper.view.update();
	}
}