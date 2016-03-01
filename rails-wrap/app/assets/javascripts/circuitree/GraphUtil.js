var GETN = function(id){
	return paper.project.getItem({id: id});
}

// GraphUtil.js

Graph.colorizeNodes = function(nodes, color){
	_.each(nodes, function(el, i, arr){
		el.colorize(color);
	});
	paper.view.update();
}

Graph.printAdjacencyList = function(){
	console.log("BEGIN ADJ");
	_.each(graph.nodes, function(el, i, arr){
		console.log(el.self.id, el.getChildren().join(','));

	});
	console.log("END ADJ");
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
	return pr;
}

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