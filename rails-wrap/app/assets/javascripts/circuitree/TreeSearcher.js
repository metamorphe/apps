function Graph(){
	this.className = "Graph";
	this.nodes = [];
	this.init();
	this.processTraceIntersections();
	
	
	this.walked = [];
}
var dchildren;
var r;


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
	var s = paper.project.getItem({id: 72}).node;
	var t = paper.project.getItem({id: 80}).node;

	console.log("RESULTS:", Graph.printAllPaths(s, t));
	// console.log("COUT", cout.join(""));
	// r = graph.getRootNode();
	// paths = [];
	// dchildren = graph.walkFrom(r);
	
	// ptg = new PathToGround([r]);
	// _.each(dchildren, function(el, i, arr){
	// 	var a = ptg.clone();
	// 		a.addNode(el);
	// 		if(i in paths) paths[i].push(a);
	// 		else paths[i] = [{ptg: a}];
	// });
	// console.log(paths);

	// r = dchildren[0];
	// dchildren = r.getChildren();
	// ptg = paths[0];
	// paths[0]

	// dchildren = graph.walkFrom(dchildren[0]);
	// Graph.colorizeNodes(dchildren, "yellow")
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
				// console.log("SET", _.map(conductiveTracesB, function(el){
				// 	return el.id;
				// }));
				
				var pathIn = el2._curve.path;
				var pathOut = el2._curve2.path;
				var offsetA = pathIn.getOffsetOf(el2.point);

				var position = pathIn.getPointAt(offsetA).clone();
				var ids = [pathIn.id, pathOut.id];
				
				scope.addNode(new Node(pathIn, position, ids ));
				// Graph.processIntersection(pathIn, pathOut, el2.point);
				
				// conductiveTracesB = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductiveTraces });
				// conductiveTracesB = _.reject(conductiveTracesB, function(el3, i3, arr3){
					// return el3.self || el3.processed;
				// });
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
	enumeratePaths: function(){
		var FROM = EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CVTB"]})[0].node;	
		var TO = EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CGTB"]})[0].node;	
		var visited = [];
		
		var ptg = new PathToGround([FROM]);
		var searchable = [{el: FROM, parent_path: ptg}];

		var next = [];

		var level = 0;
		var paths = {};
		paths[ptg.id] = ptg;
		var parent_path = ptg;

		var max_levels = 2;
		// while(max_levels > 0){
			
		while(searchable.length > 0){

			console.log("LEVEL", level);
			// console.log(level, "Searching through...", searchable.length, "elements.");
			// console.log("PATHS", paths);
			_.each(searchable, function(el2, i2, arr2){
				
				parent_path = el2.parent_path;
				el2 = el2.el;
				el2.visited = true;
				// console.log("CURRENT", parent_path, el2);
				var children = el2.getChildren();
				children = _.reject(children, function(el, i, arr){ return el.visited;});
				children = _.uniq(children, function(el, i, arr){ return el.id;});
				
				// console.log("Element", i2, "has", children.length, "children", "isPath:", TracePathTool.isPath(el2.self));
				
				children = _.map(children, function(el, i, arr){
					// console.log(parent_path);
					ptg = parent_path.clone();
					ptg.addNode(el);
					paths[ptg.id] = ptg;
					return {el: el, parent_path: ptg}
				});
				// console.log("Processed Children", children);
				if(children.length > 0)
					delete paths[parent_path.id];

				// PUSH TO BE SEARCHABLE
				_.each(children, function(el, i, arr){ next.push(el); });				
				paper.view.update();
			});
			_.each(searchable, function(el, i, arr){
				el.el.self.selected = false;
			});
			searchable = next;
			console.log("SEARCHING", searchable);
			_.each(searchable, function(el, i, arr){
				el.el.colorize("blue");
				// el.el.self.position.x += 20;
				// el.el.self.position.y += 20;
				el.el.self.selected = true;
				console.log("ELEMENT", el.el.self);
				// debugv["el"] = el.el;
				// debugv["child"] = el.el.getChildren();
				console.log("ELEMENTCHI", el.el.getChildren());
			});
			next = [];
			level++;
			max_levels --;
		}
		
		_.each(this.nodes, function(el, i, arr){
			el.visited = false;
		});
		paths = _.values(paths);
		var c = new paper.Color("red");
		var hue = c.hue;
		_.each(paths, function(el, i, arr){
			c.clone();
			hue += 20;
			c.hue = hue;
			el.color(c);
		});
		return paths;
	},
	update: function(){
		paper.view.update();
		return this;
	}
}


	// var children = this.nextNodes(this.visited);
	// console.log("Children", children.length);
	// this.markAsVisited(children);
// IDENTIFY ROOT
	// var BATTERIES = EllustrateSVG.match( designer.circuit_layer.layer, { prefix: ["CVTB"]});	
	// var roots =  new TreeCrawl(BATTERIES);

	// // EXTRACT GRAPH
	// var visited = [];
	// var next = [];
// Graph.nextNodes = function(parents){
// 	var scope = this;
// 	var conductive = ["CGP", "CVP", "CNP", "CGB", "CVB", "CNB", "CNT", "CGT", "CVT", "CVTB", "CGTB"];
// 	conductive = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductive });
	
// 	var children = [];
// 	_.each(parents, function(el, i, arr){
// 		var intersects = TracePathTool.getAllIntersections(el, conductive);
// 		children.push(_.map(intersects, function(el, i, arr){
// 			var pathOut = el._curve2.path;
// 			return pathOut;
// 		}));
// 	});
// 	children = _.flatten(children);
	
// 	children = _.reject(children, function(el, i, arr){
// 		return el.visited;
// 	});
// 	return children;
// }




