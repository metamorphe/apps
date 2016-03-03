
var EPSILON = 2;
Graph.test = function(){
	Graph.printIDs();
	
	// console.log("ROOT:", r.getID(), ", SINK:", s.getID());

	Graph.printAdjacencyList();
	// console.log("S", s);
	// r = graph.getSourceNode();
	// console.log("R", r);
	

	// s = graph.getSinkNode();
// 	r = paper.project.getItem({id: 55}).node;
// 	s = paper.project.getItem({id: 70}).node;

// 	results = Graph.printAllPaths(r, s);
// 	console.log("RESULTS:", results);
// 	var color = new paper.Color("red");
// 	hue = 0;

// 	ptgs = _.map(results, function(el, i, arr){
// 		// if(i != 4) return;
// 		// console.log(el);
// 		myColor = color.clone();
// 		myColor.hue = hue;
// 		var ptg = new PathToGround(el, myColor);
// 		hue += 20;
// 		return ptg;
// 	});
// 	min = _.min(ptgs, function(ptg){ return ptg.length;});
// 	paper.project.addChild(min.solution);
}

function Graph(){
	this.className = "Graph";
	this.nodes = [];
	this.breakUpSelfIntersections();
	this.breakUpIntersections();
	this.generateBlobPaths();
	this.processEnds();

	// var path33 = Node.get(33);
	// this.splitPathAtOffsets(path33, [50]);
	// splitPathAtOffsets: function(path, offsets){
	

	// this.processTraceIntersections();	
	// this.processEnds();

}


var intersectionNodes = [];
Graph.prototype = {
	processEnds: function(){
		var scope = this;

		var traces = ["CGP", "CVP", "CNP", "TMP"];
		traces = EllustrateSVG.match(paper.project, { prefix: traces });
		
		var nodes = [];
		// add nodes to the ends
		_.each(traces, function(trace, i, arr){
				var start = trace.getPointAt(0).clone();
				var end = trace.getPointAt(trace.length).clone();
				
				n = new Node(trace, start);
				nodes.push(n);
				scope.addNode(n);
				// console.log("NODE", n.self.id);

				n = new Node(trace, end);
				nodes.push(n);
				scope.addNode(n);
				// console.log("NODE", n.self.id);
		});

		
		// EXTRACT EDGES
		var nodeSet = _.map(nodes, function(n){ return n.self });
		_.each(nodes, function(node, i, arr){
			var nodeC = node.self;
			var edges = scope.getNodeIntersections(node.self.id);

			// compare = _.reject(nodeSet, function(n){ return n.id == nodeC.id});
			// var edges = TracePathTool.getAllIntersections(nodeC, compare);
			// edges = _.map(edges, function(edge, i, arr){ return edge._curve2.path.id});
			// var pathID = nodeC.parent.id;

			pathBrother = _.reject(nodeC.path.terminals, function(term){
				return nodeC.id == term;
			});
			edges = _.flatten([pathBrother, edges]);
			// console.log(nodeC.id, "EDGES", edges);
			nodeC.node.setChildren(_.uniq(edges));
		});
		// CONSOLIDATE nodes
		

	},
	getNodeIntersections: function(nodeID){
		var nodePath = Node.get(nodeID);
		var nodeCs = paper.project.getItems({is_node: true});
		nodeCs = _.reject(nodeCs, function(n){ return n.id == nodeID});
		
		// var edges = TracePathTool.getAllIntersections(nodePath, compare);
		// var inners = TracePathTool.getAllInsides(nodePath, compare);
		

		// Node.get(80).position.isInside(Node.get(84).bounds)

		inside = _.filter(nodeCs, function(el, i, arr){
			return nodePath.position.isInside(el.bounds);
		});
		inside = _.map(inside, function(el, i, arr){
			return el.id;
		});
		nodeCs = _.map(nodeCs, function(el, i, arr){
			return el.id;
		});

		// edges = _.map(edges, function(edge, i, arr){ return edge._curve2.path.id});
		// console.log(edges, inners);
		// console.log(inside, nodeCs);
		return inside;
	},
	generateBlobPaths: function(){
		var scope = this;
		var blobs = ["CGB", "CVB", "CNB", "CNTB", "CVTB", "CGTB"];
		blobs = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: blobs });
		// console.log("Blob count", blobs.length);
		var traces = ["CGP", "CVP", "CNP"];		
		traces = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: traces });
		
		_.each(blobs, function(blob, i, arr){
			
			intersects = TracePathTool.getAllIntersections(blob, traces);
			// console.log(blob.id, intersects);
			_.each(intersects, function(its){
				// var point = its.point;
				var near = its._curve2.path.getNearestPoint(blob.position);
				var path = new paper.Path({
					name: "TMP: temporary",
					segments: [blob.position.clone(), near], 
					strokeColor: "yellow", 
					strokeWidth: 3,
					terminal_helper: true
				});
				blob.path = path;
			});	
		});
	},
	breakUpIntersections: function(){
		var scope = this;
		var conductiveTraces = ["CGP", "CVP", "CNP"];
		conductiveTracesA = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
		cuts = [];
		_.each(conductiveTracesA, function(el, i, arr){
			el.self = true;	
			conductiveTracesB = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
			conductiveTracesB = _.reject(conductiveTracesB, function(el2, i2, arr2){
				return el2.self || el2.processed;
			});
			// console.log("Intersecting", el.id)
			intersects = TracePathTool.getAllIntersections(el, conductiveTracesB);
			// console.log("Exiting", el.id)
			el.processed = true;

			_.each(intersects, function(el2, i2, arr2){
				var pathIn = el2._curve.path;
				var pathOut = el2._curve2.path;
				var point = el2.point.clone();
				var pointA = pathIn.getNearestPoint(point);
				var offsetA = pathIn.getOffsetOf(pointA);
				var pointB = pathOut.getNearestPoint(point);
				var offsetB = pathOut.getOffsetOf(pointB);
				// console.log(pathIn.id, pathOut.id, offsetA, offsetB, el2);

				if(offsetA && scope.isValidSplitLocation(pathIn, offsetA))
					cuts.push({point: point.clone(), path: pathIn.id, offset: offsetA});
				if(offsetB && scope.isValidSplitLocation(pathOut, offsetB))
					cuts.push({point: point.clone(), path: pathOut.id, offset: offsetB});
				// console.log("EXIT");
				// var position = pathIn.getPointAt(offsetA).clone();
				// var ids = [pathIn.id, pathOut.id];
				
				// // valid = scope.isValidNodeLocation(position);
				// // if(valid)
				// 	scope.addNode(new Node(pathIn, position, ids ));
				// console.log(valid);
					
			});
			el.self = false;		
		});
		
		cuts = _.groupBy(cuts, function(el, i, arr){
			return el.path;
		});

		// CUT IT OPEN
		_.each(cuts, function(el, pathID, arr){
			var pathID = parseInt(pathID);
			var offsets = _.pluck(el, "offset");
			scope.splitPathAtOffsets(Node.get(pathID), offsets);
			// console.log(pathID, offsets)
		});

		// console.log("CUTS", cuts);

	},
	isValidSplitLocation: function(path, offset){
		return offset > EPSILON && path.length - offset > EPSILON;
	}, 
	splitPathAtOffsets: function(path, offsets){
		var scope = this;
		offsets = _.sortBy(offsets);
		offsets = _.filter(offsets, function(e){
			return scope.isValidSplitLocation(path, e);
		});
		offsets = _.uniq(offsets);
		// console.log('Slicing', path.id, "@", offsets);

		var cut = 0;
		var newPath = path;
		var created = [];
		_.each(offsets, function(offset){
			newPath = newPath.split(offset - cut);
			created.push(newPath.id);
			cut += offset;
		});
		// console.log("Created:", created);
		return;
	},
	breakUpSelfIntersections: function(){
		var scope = this;
		var traces = ["CGP", "CVP", "CNP"];

		traces = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: traces });
		_.each(traces, function(el, i, arr){
			
			self_int = el.getIntersections(el);

			_.each(self_int, function(el2, i2, arr2){
				var path = el2._curve.path;
				var point = el2._point;
				var offsetBeforeLoop = path.getOffsetOf(point);
				var loop = path.split(offsetBeforeLoop);
				
				if(loop){
						black_magic = loop.clone();
						black_magic_2 = black_magic.split(1);
						if(black_magic_2){
							offsetPostLoop = black_magic_2.getOffsetOf(point);
							black_magic_2.remove();
							black_magic.remove();
							// end of magic
							var end_of_path = loop.split(offsetPostLoop);
							if(end_of_path){
								start_of_path = path;
								var ids = [start_of_path.id, end_of_path.id, loop.id]
							}
						}
					}

				});

			});
	},
	
	isValidNodeLocation: function(position){
		
		var loc = [];
		var valid =  _.reduce(intersectionNodes, function(memo, el){
					var d = el.point.getDistance(position);
					// console.log(el.self.id, d);
					if(d <= 3) loc.push(el.paths);
					return memo;//d > 3 && memo;
				}, true);
		return {valid: valid, paths: _.flatten(loc)}
	},
	addNode: function(node){
		this.nodes.push(node);
	},
	getSourceNode: function(){
		return EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CVTB"]})[0].id;	
	},
	getSinkNode: function(){
		return EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CGTB"]})[0].id;	
	},
	walkFrom: function(node){
		this.walked.push(node);
		node.walked = true;

		var children = node.getChildren();
		// rejected walked children
		children = _.reject(children, function(el, i, arr){ return el.walked;});
		// reject duplicates
		children = _.uniq(children, function(el, i, arr){ return el.self.id;});
		console.log("Node has", children.length, "children.");
		return children;		
	},
	update: function(){
		paper.view.update();
		return this;
	}
}



