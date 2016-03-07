
function EllustratePath(str, color){
	var scope = this;
	this.str = str;
	// console.log("STR", str);
	this.nodes = _.map(str.split('-'), function(el){ return parseInt(el);});
	this.length = 0;
	this.paths = [];
	this.color = color;
	this.solution = new paper.Group({
		terminal_helper: true, 
		ellustrate_path: true
	});
	scope.init();
}
EllustratePath.prototype = {
	init: function(){
		var scope = this;
		var index = 0;

		while((index + 1) < this.nodes.length){
			var current = Node.get(this.nodes[index]).node;
			var next = Node.get(this.nodes[index + 1]).node;


			var goal = [current.id, next.id];
			path = _.filter(current.paths, function(el){
				return _.intersection(el.terminals, goal).length == goal.length;
			});
			
			if(path.length > 0){
				path = path[0];
				var p = path.clone();
				p.terminal_helper = true;
				p.style.strokeColor = scope.color;
				this.length += p.length;
				scope.solution.addChild(p);
			}
			index++;
		}
		// this.solution.position.x += -200 + scope.color.hue * 5;//20;
		// this.solution.position.y += 200;
		// this.solution.remove();
		this.solution.opacity = 0;
		paper.view.update();
	},	
	colorize: function(color){
		this.solution.strokeColor = color;
	}
}
