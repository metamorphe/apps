var GETN = function(id){
	return paper.project.getItem({id: id});
}
// GraphUtil.js
// Graph.processTraceIntersections = function(){
// 	var scope = this;
// 	var conductiveTraces = ["CGP", "CVP", "CNP"];
// 	conductiveTracesA = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
// 	_.each(conductiveTracesA, function(el, i, arr){
// 		el.self = true;	
// 		conductiveTracesB = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
// 		conductiveTracesB = _.reject(conductiveTracesB, function(el2, i2, arr2){
// 			return el2.self || el2.processed;
// 		});
		
// 		intersects = TracePathTool.getAllIntersections(el, conductiveTracesB);
		
// 		el.processed = true;
// 		_.each(intersects, function(el2, i2, arr2){
// 			// console.log("SET", _.map(conductiveTracesB, function(el){
// 			// 	return el.id;
// 			// }));
			
// 			var pathIn = el2._curve.path;
// 			var pathOut = el2._curve2.path;
// 			var offsetA = pathIn.getOffsetOf(el2.point);

// 			var polarity = TracePathTool.readPolarity(el2._curve2.path);

// 			var c_int = new paper.Path.Circle({
// 					parent: pathIn, 
// 					name: "C"+ polarity +"T: terminal from fragmentation",
// 					position: pathIn.getPointAt(offsetA).clone() ,
// 					radius: pathIn.style.strokeWidth * 2, 
// 					fillColor: pathIn.style.strokeColor, 
// 					polarity: pathIn.polarity,
// 					strokeWidth: 1, 
// 					pathIds: [pathIn.id, pathOut.id] 
// 				});
// 			graph.addNode(c_int);
// 			// Graph.processIntersection(pathIn, pathOut, el2.point);
			
// 			// conductiveTracesB = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
// 			// conductiveTracesB = _.reject(conductiveTracesB, function(el3, i3, arr3){
// 				// return el3.self || el3.processed;
// 			// });
// 		});

// 		el.self = false;		
// 	});
// }

Graph.processIntersection =  function(pathIn, pathOut, intPt){

	var offsetA = pathIn.getOffsetOf(intPt);
	var offsetB = pathOut.getOffsetOf(intPt);
	
	var npath_in = null;
	var npath_over = null;

	// console.log(pathIn.id, pathIn.length.toFixed(2), offsetA.toFixed(2), pathOut.id, pathOut.length.toFixed(2), offsetB.toFixed(2));

	if(!_.isNull(offsetA) && offsetA > 2 && offsetA < (pathIn.length - 2) ){
		npath_in = pathIn.split(offsetA);
		// var polarity = TracePathTool.readPolarity(pathIn);
		// var c = new paper.Path.Circle({
		// 	parent: pathIn.parent, 
		// 	position: intPt.clone(), 
		// 	name: "C"+ polarity +"T: terminal from fragmentation", 
		// 	radius: pathIn.style.strokeWidth, 
		// 	fillColor: pathIn.style.fillColor,//pLetterToCLPolarity(polarity), 
		// 	processed: true
		// });
		// var npt = npath_in.getNearestPoint(intPt);
		// _.each([pathIn, npath_in], function(el, i, arr){
		// 	if(el.contains(intPt)) return;
		// 	if(el.id != 40) return;
		// 	var pos = el.getOffsetOf(intPt * 1.0) / el.length;
		// 	console.log("POS", pos, el.id);
		// 	if(pos > 0.5) el.addSegments([intPt.clone()])
		// 	else el.insertSegments(0, [intPt.clone()]);
		// // el.firstSegment.point.x += 10
			
		// // 		// el.firstSegment.point.x += 10
		// 	console.log(el, el.contains(intPt));
		// });
		// pathIn.addSegments([intPt.clone()]);
		// console.log(pathIn.id, pathOut.id, "made", npath_in.id);
		npath_in.processed = true;

		// console.log("CONTAINS IN", "pathIn", pathIn.contains(intPt), "npath_in", npath_in.contains(intPt));
	}
	if(!_.isNull(offsetB) && offsetB > 2 && offsetB < (pathOut.length - 2)){
		npath_over = pathOut.split(offsetB);

		// _.each([pathOut, npath_over], function(el, i, arr){
		// 	if(el.contains(intPt)) return;
		// 	var pos = el.getOffsetOf(intPt * 1.0) / el.length;
		// 	if(pos > 0.5) el.addSegments([intPt.clone()])
		// 	else el.insertSegments(0, [intPt.clone()]);
		// });
		// console.log(pathIn.id, pathOut.id, "made", npath_over.id);

		// console.log("CONTAINS OUT", "pathOut", pathOut.contains(intPt), "npath_over", npath_over.contains(intPt));

		// var npt = npath_over.getNearestPoint(intPt);
		// var npt_offset = pathOut.getOffsetOf(npt);
		// var midPath = pathOut.length / 2.0;
		// if(npt_offset > midPath){
		// 	pathOut.addSegments([intPt.clone()]);
		// 	console.log("Made end", npt_offset, pathOut.length, npath_over.id);
		// }
		// else{
		//    pathOut.insertSegments(0, [intPt.clone()]);	
		//    // console.log("Made start", npt_offset, pathOut.length,  npath_over.id);		
		// }
		
	}
	

}

Graph.colorizeNodes = function(nodes, color){
	_.each(nodes, function(el, i, arr){
		el.colorize(color);
	});
	paper.view.update();
}



Graph.printAdjacencyList = function(){
	_.each(graph.nodes, function(el, i, arr){
		console.log(el.self.id, el.getChildren().join(','));

	});
}

Graph.printIDs = function(){
	_.each(graph.nodes, function(el, i, arr){
		var gtext = new paper.PointText({
						point: el.self.bounds.center.clone(),
						content: el.self.id,
						fontFamily: 'Arial',  
						fontSize: 6
				});
	});
	paper.view.update();
}
Graph.printAllPaths = function(s, d){
	// MARK ALL VERTICES AS NOT VISITED (WALKED)
	pr = [];
	Graph.printAllPathsUtil(s, d, 1, pr, "");
	// for(var i in paths)
	return pr;
	// return paths;
}
var cout = [];
var pathsTravelled = {};

Graph.printAllPathsUtil = function(u, d, level, results, head){
	console.log(level, u.self.id, d.self.id);
	if(head == "") head = u.self.id;
	else head = [head, u.self.id].join('-');
	u.visited = true;

	if(u.self.id == d.self.id){
		u.visited = false;
		pr.push(head);	
		return;
	}else{

		var children = _.map(u.getChildren(), function(el){ return GETN(el).node; });
		children = _.reject(children, function(el){ return el.visited});

		for(var i in children){
			var child = children[i];
			Graph.printAllPathsUtil(child, d, level + 1, results, head)
		}
		u.visited = false;

		return;	
	}
}