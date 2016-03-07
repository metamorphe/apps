function Node(paths, position){
	var scope = this;
	this.className = "Node";
	this.paths = paths;
	var polarity = TracePathTool.readPolarity(paths[0]);
	// console.log("I am here");
	this.parent = paths[0].parent;
	var c_int = new paper.Path.Circle({
					parent: paths[0].parent, 
					paths: paths,
					name: "TMT: temp", //"C"+ polarity +"T: terminal from fragmentation",
					position: position,
					radius:  paths[0].style.strokeWidth, 
					fillColor:  "#00A8E1", 
					polarity:  paths[0].polarity,
					terminal_helper: true,
					is_node: true,
					strokeColor: "black", 
					strokeWidth: 1, 
					node: this // pointer to self
				});
	
	this.self = c_int;
	this.id  = c_int.id;
	_.each(paths, function(path){
		if(_.isUndefined(path.terminals)) path.terminals = [scope.self.id];
		else path.terminals.push(scope.self.id);
	});
	this.children = [];
}

Node.join = function(nodes){
	var nodeIDs = nodes;
	// console.log(nodeIDs);
	nodes = _.map(nodes, function(node){
		// console.log("JOIN", node)
		return Node.get(node).node;
	});
	centroid = new paper.Point(0, 0);
	_.each(nodes, function(el){
		centroid.x += el.self.position.x; 
		centroid.y += el.self.position.y; 
	});
	centroid.x /= nodes.length;
	centroid.y /= nodes.length;


	var children = _.reduce(nodes, function(memo, el){
		memo.push(el.getChildren())
		return memo;
	}, []);
	children = _.uniq(_.flatten(children));
	children = _.filter(children, function(child){
		return nodeIDs.indexOf(child) < 0;
	});

	// For all the ones that are about to be deleted, 
	// go through the children, remove references to them. 
	_.each(children, function(id){
		// console.log("Node getting cleaned", id);
		var node = Node.get(id).node;
		var children = node.getChildren();
		// console.log("Original edges", children);
		children = _.reject(children, function(child){
			return nodeIDs.indexOf(child) > -1;
		});
		// console.log("Updated edges", children);

		node.setChildren(children);
	});

	// console.log("Children", children);
	
	// Remove old path index
	updated_paths = [];
	_.each(nodes, function(node){
		var paths = node.paths;
		updated_paths.push(paths);
		_.each(paths, function(path){
			path.terminals = _.reject(path.terminals, function(term){
				return nodeIDs.indexOf(term) > -1;
			});
		});
	});
	updated_paths =_.flatten(updated_paths);
	updated_paths =_.uniq(updated_paths, function(el){
		return el.id;
	});
	// updated_paths =_.map(updated_paths, function(path){ return path.id });

	// console.log(updated_paths);
	return {position: centroid, paths: updated_paths, children: children};
}

Node.get = function(id){
		return paper.project.getItem({id: id});
	}
Node.prototype = {
	disable: function(){
		this.self.remove();
	},
	enable: function(){
		this.parent.addChild(this.self);
	},
	setChildren: function(children){
		this.children = children;
	},
	getChildren: function(){
		return this.children;
	}, 
	colorize: function(color){
		if(TracePathTool.isPath(this.self)) this.self.style.strokeColor = color;
		else this.self.style.fillColor = color;
		paper.view.update();
		return this;
	}
}
