function EllustrateSVG(svg){
	this.svg = svg;

	this.setupSurface();

	if(this.svg != "")
		this.load();
	paper.view.update();
}

EllustrateSVG.prototype = {
	
	// parse: function(flag){
		// Remove non-ellustrator elements
		// var scope = this;
		// // console.log("Adding ", this.svg);
		// // SPECIFICATION
		// // console.log("1º: Removing dud elements");
		// var NEL = this.select( { prefix: ["NEL"]});
		// _.each(NEL, 
		// 	function(el, i, arr){ el.remove();}
		// );

		// // // Base canvas, if not added
		// var paper_size = PaperSetup.orientation(PaperSetup.types.A4, 'hoz');

		// if(flag == CircuitDesigner.ARTBOARD_ADD){
		// 	var ARTBOARD = this.select(
		// 		{ 
		// 		  prefix: ["NCB"]
		// 		});


		// 	if(ARTBOARD.length == 0){
		// 		// console.log("Adding artboard", ARTBOARD);
		// 		artboard = new paper.Group({
		// 			parent: designer.art_layer.layer,
		// 			position: paper.view.center,
		// 			name: "NCB: artboard", 
		// 			canvasItem: true
		// 		});
				
		// 		var p = paper.Path.Rectangle({
		// 			parent: artboard, 
		// 			width: Ruler.mm2pts(paper_size.width),
		// 			height: Ruler.mm2pts(paper_size.height),
		// 			fillColor: "white", 
		// 			shadowColor: new paper.Color(0.8),
		//     		shadowBlur: 10,
		//     		shadowOffset: new paper.Point(0, 0), 
		//     		canvasItem: true, 
		//     		name: "NCB: artboard", 
		// 		});
		// 		var gtext = new paper.PointText({
		// 				parent: artboard, 
		// 				point: artboard.bounds.topRight.clone(),
		// 				content: "A4",
		// 				fillColor: 'gray', 
		// 				fontFamily: 'Arial', 
		// 				fontWeight: 'bold', 
		// 				fontSize: 20, 
		// 				name: "NCB: artboard"
		// 		});
			
		// 		var gtext_adj = gtext.bounds;
		// 		gtext.point.x -= gtext_adj.width + 15;
		// 		gtext.point.y += gtext_adj.height + 10;
			
				
		// 	}else{
		// 		// console.log("Using artboard", ARTBOARD);
		// 		artboard = ARTBOARD[0];
		// 		designer.art_layer.layer.addChild(ARTBOARD[0]);
			
		// 	}
			
		// }
		// // zoom.home();


		// // console.log(ARTBOARD[0].bounds);
		// var ART = this.select(
		// 	{ 
		// 	  prefix: ["ART"]
		// 	});
		// // console.log("2º: Add art layer to base", ART);
		// designer.art_layer.add(ART);
		// _.each(ART, function(el, i, arr){
		// 	el.canvasItem = true;
		// });
		
		
		// var CIRCUIT_LAYER = this.select(
		// 		{ 
		// 	  		prefix: ["SI"]
		// 		}
		// 	);
		// // CIRCUIT_LAYER[0].remove();
		// // console.log("3º: Add circuit layer to base", CIRCUIT_LAYER);
		// var COMPONENTS = this.select(
		// 		{ 
		// 	  		prefix: ["CP"]
		// 		}
		// 	);

		// _.each(COMPONENTS, function(el, i, arr){
		// 	el.canvasItem = true;
		// });
		// // console.log("4º: Add components", COMPONENTS);
		
		// designer.circuit_layer.add(COMPONENTS);
		// // $("#path-tool").click();
	// }
}

