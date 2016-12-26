Graph.getPathsFromID = function(source, sink){
	
	s = Node.get(source).node;
	d = Node.get(sink).node;

	
	results = Graph.printAllPaths(s, d);
	results = EllustratePath.sortAndMake(results);
	console.log("PATH FROM", s.id, d.id, results)
	
	return debug ;
}
var GETN = function(id){
	return paper.project.getItem({id: id});
}
Graph.test = function(){
	// graph = new Graph();
	// graph.enable();
	// Graph.printAdjacencyList();
	//     Graph.printIDs();

}


Graph.colorPath = function(){
	
}

// GraphUtil.js

Graph.colorizeNodes = function(nodes, color){
	_.each(nodes, function(el, i, arr){
		el.colorize(color);
	});
	paper.view.update();
}

Graph.printAdjacencyList = function(graph){
		r = graph.getSourceNode();
		s = graph.getSinkNode();

		if(r.length == 0 || s.length == 0) return;
		
		console.log("BEGIN ADJ");
		nodes = PaperUtil.queryPrefix("NODE");
		var traces = ["CGP", "CVP", "CNP", "TGP", "TVP", "TNP"];
		traces = PaperUtil.query(paper.project, { prefix: traces });
		printable = _.flatten([nodes, traces]);
		_.each(printable, function(el){
			console.log(el.id, el.edges.join(','));
		});
		console.log("END ADJ");
	
}

Graph.printIDs = function(){
	nodes = PaperUtil.queryPrefix("NODE");
	var traces = ["CGP", "CVP", "CNP", "TGP", "TVP", "TNP"];
	traces = PaperUtil.query(paper.project, { prefix: traces });
	

	printable = _.flatten([nodes, traces]);
	
	_.each(printable, function(el){
		point = el.closed ? el.bounds.center : el.getPointAt(el.length * 0.5);
		var gtext = new paper.PointText({
			point: point,
			content: el.id,
			fontFamily: 'Arial',  
			fontSize: 12, 
			fillColor: "black"
		});
	});
	paper.view.update();
	return;
}
Graph.printAllPaths = function(s, d){
	// MARK ALL VERTICES AS NOT VISITED (WALKED)
	results = [];
	var paths = Graph.printAllPathsUtil(s, d, 1, results, null);
	return results;
}

Graph.printAllPathsUtil = function(u, d, level, results, head){
	// console.log(level, u.id, d.id);
	if(!head) head = u.id;
	else head = [head, u.id].join('-');
	u.visited = true;

	if(u.id == d.id){
		u.visited = false;
		results.push(head);	
		return;
	}else{
		var children = _.map(u.edges, function(el){ return PaperUtil.queryID(el); });
		children = _.reject(children, function(el){ return el.visited});
		_.each(children, function(child){
			Graph.printAllPathsUtil(child, d, level + 1, results, head);
		})
		u.visited = false;
		return;	
	}
}
