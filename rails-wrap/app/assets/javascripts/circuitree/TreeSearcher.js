Graph.test = function(){
	Graph.printIDs();
	// r = graph.getSourceNode();
	// s = graph.getSinkNode();
	// console.log("ROOT:", r.getID(), ", SINK:", s.getID());

	// Initialize compute
	var adj = {};
	_.each(graph.nodes, function(el, i, arr){
		adj[el.self.id] = [];
	});

	_.each(graph.nodes, function(el, i, arr){
		var id = el.self.id;
		var children = el.getChildren();
		
		_.each(children, function(el2, i2, arr2){
			adj[id].push(el2);
			adj[el2].push(id);
		});
	});
	_.each(adj, function(value, key, arr){
		adj[key] = _.uniq(value);
	});
	_.each(graph.nodes, function(el, i, arr){
		el.children = _.map(adj[el.self.id], function(el2, i2, arr2){ return paper.project.getItem({id: el2}).node; });;
	});



	// console.log("R", r.self.id);
	Graph.printAdjacencyList();
	// console.log("S", s.self.id);	
	var s = paper.project.getItem({id: 48}).node;
	var t = paper.project.getItem({id: 56}).node;

	console.log("RESULTS:", Graph.printAllPaths(s, t));
}

function Graph(){
	this.className = "Graph";
	this.nodes = [];
	this.init();
	this.processTraceIntersections();	
}



Graph.prototype = {
	init: function(){
		var scope = this;
		var conductive = ["CGP", "CVP", "CNP", "CGB", "CVB", "CNB", "CNT", "CGT", "CVT", "CVTB", "CGTB"];
		conductive = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductive });
		
		_.each(conductive, function(el, i, arr){
			// if you are a path, add circles

			if(TracePathTool.isPath(el)){
				var polarity = TracePathTool.readPolarity(el);
				var start = el.getPointAt(0).clone();
				var end = el.getPointAt(el.length).clone();
				
				scope.addNode(new Node(el, start, [el.id]));
				scope.addNode(new Node(el, end, [el.id]));
				el.processed = false;
				el.self = false;
				
			}else{
				intersects = TracePathTool.getAllIntersectionsAndInsides(el, conductive);
				intersects = _.map(intersects, function(el, i, arr){
					return el._curve2.path.id;
				});
				intersects.push(el.id);
				scope.addNode(new Node(el, el.bounds.center, intersects));
			}
		});
		
	},
	processTraceIntersections: function(){
	var scope = this;
	var conductiveTraces = ["CGP", "CVP", "CNP"];
	conductiveTracesA = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
		_.each(conductiveTracesA, function(el, i, arr){
			el.self = true;	
			conductiveTracesB = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
			conductiveTracesB = _.reject(conductiveTracesB, function(el2, i2, arr2){
				return el2.self || el2.processed;
			});
			
			intersects = TracePathTool.getAllIntersections(el, conductiveTracesB);
			
			el.processed = true;
			_.each(intersects, function(el2, i2, arr2){
				var pathIn = el2._curve.path;
				var pathOut = el2._curve2.path;
				var offsetA = pathIn.getOffsetOf(el2.point);

				var position = pathIn.getPointAt(offsetA).clone();
				var ids = [pathIn.id, pathOut.id];
				
				scope.addNode(new Node(pathIn, position, ids ));
				
			});

			el.self = false;		
		});
	},
	addNode: function(node){
		this.nodes.push(node);
	},
	getSourceNode: function(){
		return EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CVTB"]})[0].node;	
	},
	getSinkNode: function(){
		return EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CGTB"]})[0].node;	
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



