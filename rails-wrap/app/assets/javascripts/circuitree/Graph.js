
var EPSILON = 2;
solutions = null;


function Graph(){
	this.className = "Graph";
	this.nodes = [];
	this.breakUpSelfIntersections();
	this.breakUpIntersections();
	this.generateBlobPaths();
	this.init();

}


var intersectionNodes = [];
Graph.prototype = {
	init: function(){
		this.processEnds();
		this.lines = $.map(paper.project.getItems({blob_line: true}), function(el, i){
			parent = el.parent;
			el.remove();
			return {el: el, parent: parent}
		});
	},
	
	regenerate: function(){
		console.log("Regenerating!");
		this.enable();
		nodeIDs = Node.toNodeIDs(this.nodes);
		Node.join(nodeIDs);
		this.removeNodes(nodeIDs);
		// END OF DESTRUCTION
		
		_.each(this.lines, function(line){
				line.parent.addChild(line.el);
		});
		this.init();
		paper.view.update();
	}, 
	find: function(id){
		return _.filter(graph.nodes, function(el, i, arr){ return el.id == id})[0];
	},
	getPathsToGround: function(){

		r = graph.getSourceNode();
		s = graph.getSinkNode();
		s = Node.get(s).path.terminals[0];
		r = Node.get(r).path.terminals[0];
		// console.log(r, s);
		r = paper.project.getItem({id: r}).node;
		s = paper.project.getItem({id: s}).node;

		results = Graph.printAllPaths(r, s);
		// console.log("RESULTS:", results);


		var color = new paper.Color("red");
		hue = 0;

		ptgs = _.map(results, function(el, i, arr){
			myColor = color.clone();
			myColor.hue = hue;
			var ptg = new EllustratePath(el, myColor);
			hue += 20;
			return ptg;
		});

		sorted = _.sortBy(ptgs, function(ptg){ return ptg.length;});
		// console.log("SOLUTIONS", sorted.length);

		sorted = _.uniq(ptgs, function(ptg){ 
			return (ptg.length / 20).toFixed(0);
		});
		// console.log("THRESHOLD SOLUTIONS", sorted.length);
		// _.each(sorted, function(el){
		// 	paper.project.addChild(el.solution);
		// 	paper.project.addChild(el.solution);
		// });
		solutions = sorted;
		return solutions;
	}, 
	enable: function(){
		_.each(this.nodes, function(node){
			node.enable();
		});
		paper.view.update();
	},
	disable: function(){
		_.each(this.nodes, function(node){
			node.disable();
		});
		paper.view.update();
	},
	processEnds: function(){
		var scope = this;

		var traces = ["CGP", "CVP", "CNP", "TMP"];
		traces = EllustrateSVG.match(paper.project, { prefix: traces });
		
		var nodes = [];
		// add nodes to the ends
		_.each(traces, function(trace, i, arr){
				var start = trace.getPointAt(0).clone();
				var end = trace.getPointAt(trace.length).clone();
				
				n = new Node([trace], start);
				nodes.push(n);
				scope.addNode(n);
				// console.log("NODE", n.self.id);

				n = new Node([trace], end);
				nodes.push(n);
				scope.addNode(n);
				// console.log("NODE", n.self.id);
		});

		
		// EXTRACT EDGES
		var nodeSet = _.map(nodes, function(n){ return n.self });
		_.each(nodes, function(node, i, arr){
			var nodeC = node.self;
			var edges = scope.getNodeIntersections(node.self.id);
			// console.log(nodeC.id, "P_EDGES", edges)
			// compare = _.reject(nodeSet, function(n){ return n.id == nodeC.id});
			// var edges = TracePathTool.getAllIntersections(nodeC, compare);
			// edges = _.map(edges, function(edge, i, arr){ return edge._curve2.path.id});
			// var pathID = nodeC.parent.id;
			
			terminals = _.reduce(nodeC.paths, function(memo, path){
				memo.push(path.terminals);
				return memo;
			}, []);
			terminals = _.flatten(terminals);

			pathBrother = _.reject(terminals, function(term){
				return nodeC.id == term;
			});
			edges = _.flatten([pathBrother, edges]);
			// console.log(nodeC.id, "EDGES", edges);
			nodeC.node.setChildren(_.uniq(edges));
		});

		// IDENTIFY CLUSTER NODES
		// console.log("CLUSTERS");
		groups = _.map(nodes, function(node, i, arr){
			var nodeC = node.self;
			var edges = scope.getNodeIntersections(node.self.id);
			edges.push(nodeC.id);
			edges = _.sortBy(edges);
			// console.log(edges);
			return edges;
		});

		groups = _.groupBy(groups);
		// groups = 
		_.each(groups, function(value, key){
			var ids = key.split(",");
			for(var i in ids) ids[i] = parseInt(ids[i]);
			// return ids;
		});

		groups2 = {};
		var getOverlaps = function(i, keys){
			return _.filter(keys, function(el){
				if(el == i) return;
				a = el.split(',');
				b = i.split(',');
				return _.intersection(a, b).length > 3;
			});
		}
		var keys = _.keys(groups);
		for(var key in groups){
			overlaps = getOverlaps(key, keys);
			// console.log(overlaps);
			if(overlaps.length > 0){
				var key = _.reduce(overlaps, function(memo, overlap){
					return _.intersection(memo, overlap.split(','));
				}, key.split(','))
				groups2[key.join(',')] = true;
			}
			else if(key.split(',').length > 3){
				groups2[key] = true;
			}
		}
		groups2 = _.map(_.keys(groups2), function(key){
			return _.map(key.split(','), function(el){
				return parseInt(el);
			});
		});
		// console.log("END CLUSTERS");



		// // CONSOLIDATE nodes
		_.each(groups2, function(g, i, arr){
			// if(i > 2) return;
			
			// console.log(g);
			// console.log(i.split(","));
			test = Node.join(g);
			n = new Node(test.paths, test.position);
			nodes.push(n);
			// console.log(g, "-->", n.id);
			
			scope.addNode(n);
			

			test.children.push(n.id);
			_.each(test.children, function(child, i, arr){
				// console.log("HMM", child, n.id);
				var x = Node.get(child).node;
				// console.log(n.id);
				x.children.push(n.id);
			});
			scope.removeNodes(g);
			n.setChildren(test.children);

		});

		// console.log("NODE", n.self.id);
	},
	removeNodes: function(removeThese){
		this.nodes = _.reject(this.nodes, function(node){
			
			var marked = removeThese.indexOf(node.id) > -1
			if(marked){
				// console.log("DELETING", node.id)
				node.self.remove();
				delete node;
			}
			return marked;
		});
	},
	getNodeIntersections: function(nodeID){
		var nodePath = Node.get(nodeID);
		var nodeCs = paper.project.getItems({is_node: true});

		nodeCs = _.reject(nodeCs, function(n){ return n.id == nodeID});

		if(nodeID == 70) console.log("NODECs 70:", nodeCs);

		inside = _.filter(nodeCs, function(el, i, arr){
			return nodePath.position.isInside(el.bounds) || el.position.isInside(nodePath.bounds);
		});
		inside = _.map(inside, function(el, i, arr){
			return el.id;
		});
		nodeCs = _.map(nodeCs, function(el, i, arr){
			return el.id;
		});

		return inside;
	},
	generateBlobPaths: function(){
		var scope = this;
		var blobs = ["CGB", "CVB", "CNB", "CGT", "CVT", "CNT", "CNTB", "CVTB", "CGTB"];
		blobs = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: blobs });
		console.log("Blob count", blobs.length);
		var traces = ["CGP", "CVP", "CNP"];		
		traces = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: traces });
		
		_.each(blobs, function(blob, i, arr){
			intersects = TracePathTool.getAllIntersections(blob, traces);
			// console.log(blob.id, intersects);
			_.each(intersects, function(its){
				// var point = its.point;
				var near = its._curve2.path.getNearestPoint(blob.position);
				var path = new paper.Path({
					blob: blob.id,
					name: "TMP: temporary",
					segments: [blob.position.clone(), near], 
					strokeColor: "yellow", 
					strokeWidth: 2,
					terminal_helper: true, 
					blob_line: true
				});
				blob.path = path;
			});
			if(intersects.length == 0){
				var near = blob.position.clone();
				near.y -= 1;
				near.x += 1;

				var path = new paper.Path({
					blob: blob.id,
					name: "TMP: temporary",
					segments: [blob.position.clone(), near], 
					strokeColor: "yellow", 
					strokeWidth: 2,
					terminal_helper: true
				});
				blob.path = path;
			}	
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

				if(offsetA && scope.isValidSplitLocation(pathIn, offsetA))
					cuts.push({point: point.clone(), path: pathIn.id, offset: offsetA});
				if(offsetB && scope.isValidSplitLocation(pathOut, offsetB))
					cuts.push({point: point.clone(), path: pathOut.id, offset: offsetB});
					
			});
			el.self = false;		
		});
		
		cuts = _.groupBy(cuts, function(el, i, arr){
			return el.path;
		});

		// CUT IT OPEN
		_.each(cuts, function(el, pathID, arr){
			var pathID = parseInt(pathID);
			var offsets = _.sortBy(_.pluck(el, "offset"));
			// console.log(pathID, offsets)
			scope.splitPathAtOffsets(Node.get(pathID), offsets);
			
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
		// console.log('Slicing', path.id, "@", offsets, path.length);

		var cut = 0;
		var newPath = path;
		var created = [];

		_.each(offsets, function(offset){
			// console.log(offset, offset - cut);
			newPath = newPath.split(offset - cut);
			created.push(newPath.id);
			cut += (offset - cut);
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
	

	addNode: function(node){
		this.nodes.push(node);
	},
	getSourceNode: function(){
		return EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CVTB"]})[0].id;	
	},
	getSinkNode: function(){
		return EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CGTB"]})[0].id;	
	},
	
	update: function(){
		paper.view.update();
		return this;
	}
}



