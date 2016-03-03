function Node(path, position){
	var scope = this;
	this.className = "Node";
	this.path = path;
	var polarity = TracePathTool.readPolarity(path);
	
	var c_int = new paper.Path.Circle({
					parent: path.parent, 
					path: path,
					name: "C"+ polarity +"T: terminal from fragmentation",
					position: position,
					radius: path.style.strokeWidth, 
					fillColor: path.style.strokeColor, 
					polarity: path.polarity,
					terminal_helper: true,
					is_node: true,
					strokeColor: "black", 
					strokeWidth: 1, 
					node: this // pointer to self
				});
	
	this.self = c_int;
	this.id  = c_int.id;

	if(_.isUndefined(path.terminals)) path.terminals = [scope.self.id];
	else path.terminals.push(scope.self.id);

	this.children = [];
}

Node.join = function(nodes){
	centroid = new paper.Point(0, 0);
	_.each(nodes, function(el){
		centroid.x += el.self.position.x; 
		centroid.y += el.self.position.y; 
	});
	centroid.x /= nodes.length;
	centroid.y /= nodes.length;
}

Node.get = function(id){
		return paper.project.getItem({id: id});
	}
Node.prototype = {
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
