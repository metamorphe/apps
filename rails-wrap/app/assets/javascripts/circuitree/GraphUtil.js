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

Graph.printAdjacencyList = function(){
		r = graph.getSourceNode();
		s = graph.getSinkNode();

		if(!_.isNull(s) && !_.isNull(r)){
			s = Node.get(s).path.terminals[0];
			r = Node.get(r).path.terminals[0];
		
			r = paper.project.getItem({id: r}).node;
			s = paper.project.getItem({id: s}).node;
			console.log("ROOT", r.id);
			console.log("SINK", s.id);
		}
		
		console.log("BEGIN ADJ");
			_.each(graph.nodes, function(el, i, arr){
				console.log(el.self.id, el.getChildren().join(','));

			});
		console.log("END ADJ");
	
}

Graph.printIDs = function(){
	var conductiveTraces = ["CGP", "CVP", "CNP", "TMP"];
	conductiveTracesA = EllustrateSVG.match(paper.project, { prefix: conductiveTraces });
	
	traces = _.map(conductiveTracesA, function(el, i, arr){
		return {id: el.id, self: el, el: el, color:"blue"};
		// if(! _.isUndefined(el.self))
			// return {id: el.id, self: el, el: el, color: "blue"};
	});
	// console.log(traces);
	nodes = _.map(graph.nodes, function(el, i, arr){
		return {id: el.self.id, self: el.self, color: "black"};
	});
	// console.log(nodes);
	// nodes = [];

	printable = _.flatten([nodes, traces]);
	
	_.each(printable, function(el, i, arr){
		// console.log(el);
		texts = paper.project.getItems({terminal_helper: true});
		var gtext = new paper.PointText({
						point: el.self.bounds.center.clone(),
						content: el.id,
						fontFamily: 'Arial',  
						fontSize: 8, 
						fillColor: el.color,
						terminal_helper: true
				});
		// console.log(gtext);
		inside = _.each(texts, function(el, i, arr){
			while(gtext.position.isInside(el.bounds.expand(10))){
				var rand = Math.random() * 4;
				if(rand > 3)
					gtext.position.x += 10;
				else if(rand > 2)
					gtext.position.x -= 10;
				else if (rand > 1)
					gtext.position.y += 10;
				else
					gtext.position.y -= 10;
			}
			// return ins;
		});
		// console.log(gtext.id, inside);
		var b = gtext.bounds;
		gtext.position.x -= b.width/2;
		gtext.position.y += b.height/2;
	});
	// console.log("NODES", _.map(nodes, function(el){ return el.id}));
	// console.log("PATHS", _.map(traces, function(el){ return el.id}));
	paper.view.update();
	return;
}
Graph.printAllPaths = function(s, d){
	// MARK ALL VERTICES AS NOT VISITED (WALKED)
	pr = [];
	Graph.printAllPathsUtil(s, d, 1, pr, "");
	return pr;
}

Graph.printAllPathsUtil = function(u, d, level, results, head){
	// console.log(level, u.self.id, d.self.id);
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
