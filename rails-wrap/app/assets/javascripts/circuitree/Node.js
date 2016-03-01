function Node(path, position, pathIDs){
	var scope = this;
	this.className = "Node";

	var polarity = TracePathTool.readPolarity(path);
	// color = "red"
	// if(path.closed) color = "blue";
	var c_int = new paper.Path.Circle({
					parent: path.parent, 
					name: "C"+ polarity +"T: terminal from fragmentation",
					position: position,
					radius: path.style.strokeWidth/2, 
					fillColor: path.style.strokeColor, 
					polarity: path.polarity,
					node: this // pointer to self
				});
	// console.log(path.id, c_int.id);
	this.self = c_int;
	this.pathIDs = pathIDs;
	_.each(this.pathIDs, function(el, i, arr){
		var el = scope.get(el);
		if(_.isUndefined(el.terminals)) el.terminals = [scope.self.id];
		else el.terminals.push(scope.self.id);
	});
	this.children = [];
	this.parents = []; 

}
Node.test = function(id){
	var n = GETN(id);
	var conductive = ["CGP", "CVP", "CNP", "CGB", "CVB", "CNB", "CNT", "CGT", "CVT", "CVTB", "CGTB"];
	conductive = EllustrateSVG.match(designer.circuit_layer.layer, { prefix: conductive });	
	
	n.self.mark = true;
	conductive = _.reject(conductive, function(el, i, arr){
			return el.mark;
	});
	n.self.mark = false;

	console.log("COND", _.map( conductive, function(el){
		return el.id;
	}));
	var intersects = TracePathTool.getAllIntersectionsAndInsides(n.self, conductive);
	return _.map(intersects, function(el, i, arr){
			if(el.className == "CurveLocation")
				var pathOut = el._curve2.path.id;	
			else
				var pathOut = el.id;
			
			return pathOut;
		});	
}
Node.prototype = {
	getID: function(){
		return this.self.id;
	},
	getLength: function(){
		var p = this.self;
		if(TracePathTool.isPath(p)) return p.length;
		else return Math.max(p.bounds.width, p.bounds.height);
	},
	get: function(id){
		return paper.project.getItem({id: id});
	},
	getChildren: function(){
		var scope = this;
		var children = [];
		_.each(this.pathIDs, function(el, i, arr){

			var path = scope.get(el);
			var self_offset = path.getNearestPoint(scope.self.position);
			var self_offset = path.getOffsetOf(self_offset);
			var terminals = _.reject(path.terminals, function(el2){
				return el2 == scope.self.id;
			});
			
			var terminal_offsets = _.map(terminals, function(el2){
				var terminal = scope.get(el2);
				var offset = path.getNearestPoint(terminal.position);
				var penalty = offset.getDistance(terminal.position);
				offset = path.getOffsetOf(offset) - penalty;

				return {id: el2, 
						d_offset: offset - self_offset,
						};
			});

		
			var childA = _.filter(terminal_offsets, function(el2){
				return el2.d_offset >= 0;
			});
			if(childA.length > 0){
				childA = _.min(childA, function(el2){ return el2.d_offset});
				children.push(childA.id);
			}

			var childB = _.filter(terminal_offsets, function(el2){
				return el2.d_offset <= 0;
			});
			if(childB.length > 0){
				childB = _.max(childB, function(el2){ return el2.d_offset});
				children.push(childB.id);
			}

		});
		children = _.uniq(children, function(el){
			return el;
		});
		return children;
	}, 
	getParents: function(){
		return this.parents;
	}, 
	getEdges: function(){
		return _.map(this.edges, function(el, i, arr){ return el.node});
	},
	colorize: function(color){
		if(TracePathTool.isPath(this.self)) this.self.style.strokeColor = color;
		else this.self.style.fillColor = color;
		paper.view.update();
		return this;
	}
}