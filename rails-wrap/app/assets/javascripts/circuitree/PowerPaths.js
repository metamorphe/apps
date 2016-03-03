
function PathToGround(str, color){
	this.nodes = _.map(str.split('-'), function(el){ return parseInt(el);});
	this.length = 0;
	this.paths = [];
	this.color = color;
	this.solution = new paper.Group({
		terminal_helper: true
	});
	this.init();
	
}
PathToGround.prototype = {
	init: function(){
		var scope = this;
		// _.each(this.nodes, function(el){
		// 	nPath = Node.get(el).path.clone();
		// 	nPath.style.strokeColor = scope.color;
			// nPath.position.x += scope.color.hue * 10 
		// });
		var index = 0;

		while((index + 1) < this.nodes.length){
			var current = Node.get(this.nodes[index]).node;
			var next = Node.get(this.nodes[index + 1]).node;


			var goal = [current.id, next.id];
			// console.log("GOAL", goal);
			path = _.filter(current.paths, function(el){
				// console.log(el.terminals, _.intersection(el.terminals, goal).length == goal.length, el.id);
				return _.intersection(el.terminals, goal).length == goal.length;
			});
			// console.log(path);
			// var term = current.path.terminals;

			// var isPathTraversal = term.indexOf(next.id) > -1;
			// if(isPathTraversal){

			if(path.length > 0){
				path = path[0];
				var p = path.clone();
				p.terminal_helper = true;
				// p.remove();
				p.style.strokeColor = scope.color;
				this.length += p.length;
				scope.solution.addChild(p);
			}
			index++;
		}
		this.solution.position.x += -200 + scope.color.hue * 5;//20;
		this.solution.position.y += 200;
		// scope.color.hue * 5;
		this.solution.remove();
		// console.log("l=", this.length);
		paper.view.update();
	},	
	color: function(color){
		Graph.colorizeNodes(this.nodes, color);
	}
}
