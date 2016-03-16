EllustratePath.sortAndMake = function(results){
	var color = new paper.Color("red");
	hue = 0;

	ptgs = _.map(results, function(el, i, arr){
		myColor = color.clone();
		myColor.hue = hue;
		var ptg = new EllustratePath(el, myColor);
		hue += 20;
		return ptg;
	});

	sorted = _.sortBy(ptgs, function(ptg){ 
		// console.log(ptg.length);
		return ptg.length;});

	
	sorted = _.uniq(ptgs, function(ptg){ 
		return (ptg.length / 20).toFixed(0);
	});
	
	solutions = sorted;
	return solutions;
}
EllustratePath.toNodesArr = function(path){
	return _.map(path.str.split('-'), function(el){ return parseInt(el);});
}
function EllustratePath(str, color){
	var scope = this;
	this.str = str;
	// console.log("STR", str);
	this.nodes = _.map(str.split('-'), function(el){ return parseInt(el);});
	this.length = 0;
	this.paths = [];
	this.color = color;


	scope.solution = new paper.Path({
						ellustrate_path: true,
						terminal_helper: true,
						strokeColor: "purple", 
						strokeWidth: 5, 
						closed: false
					});
	scope.mini_solution = new paper.Path({
						ellustrate_path: true,
						terminal_helper: true,
						strokeColor: "purple", 
						strokeWidth: 5, 
						closed: false
					});
	scope.init();
	this.generate_small();
}
EllustratePath.prototype = {
	generate_small: function(){
		for(var i = 0; i < 50 ; i++)
			this.mini_solution.add(this.solution.getPointAt(i));
		this.mini_solution.opacity = 0;
	},
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
				
				var forward = false;
				
				if(scope.solution.length > 0){
					end = scope.solution.getPointAt(scope.solution.length);
					p_start = p.getPointAt(0);
					p_end = p.getPointAt(p.length);

					s_dis = p_start.getDistance(end);
					e_dis = p_end.getDistance(end);

					forward = s_dis < e_dis;
				} 

				if(forward)			
					for(var i = 0; i < p.length ; i++)
						scope.solution.add(p.getPointAt(i));
				else
					for(var i = p.length; i >= 0; i--)
							scope.solution.add(p.getPointAt(i));	
				this.solution.opacity = 0;
				
				// p.terminal_helper = true;
				// p.style.strokeColor = "#C0C0C0";//scope.color;
				// this.length += p.length;
				// scope.solution.addChild(p);
			}
			index++;
		}
		// this.solution.position.x += -200 + scope.color.hue * 5;//20;
		// this.solution.position.y += 200;
		// this.solution.remove();
		this.length = this.solution.length;
		this.solution.opacity = 0;
		paper.view.update();
	},	
	colorize: function(color){
		this.solution.strokeColor = color;
	}
}
