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
		return ptg.length;
	});

	
	sorted = _.uniq(sorted, function(ptg){ 
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
		// console.log(this.solution.length
		var MAX_MINI_SOLUTION_LENGTH = 40;
		if(this.solution.length <= 0) return;
		
		var start = this.solution.getPointAt(0);
		var end = this.solution.getPointAt(this.solution.length);

		var startNode = Node.get(this.nodes[0]).position;
		// var startNode = Node.get(this.nodes[0]).position;
		
		// console.log(this.nodes[0], this.str)
		// Node.touch(this.nodes[])
		var startDistance = start.getDistance(startNode);
		var endDistance = end.getDistance(startNode);
		

		orientation_forward = startDistance < endDistance;
		// console.log("ORIENT FORWARD", orientation_forward);
		if(orientation_forward){
			for(var i = 0; i < this.solution.length && this.mini_solution.length < MAX_MINI_SOLUTION_LENGTH ; i++)
				this.mini_solution.add(this.solution.getPointAt(i));
			this.mini_solution.opacity = 0;
		}else{
			for(var i = this.solution.length; this.mini_solution.length < MAX_MINI_SOLUTION_LENGTH && i >= 0 ; i--){
				// console.log(i);
				this.mini_solution.add(this.solution.getPointAt(i));
			}
			this.mini_solution.opacity = 0;
		}
	},
	init: function(){
		var scope = this;
		var index = 0;

		while((index + 1) < this.nodes.length){
			// console.log("current", this.nodes[index])
			var current = Node.get(this.nodes[index]).node;
			var next = Node.get(this.nodes[index + 1]).node;


			var goal = [current.id, next.id];
			path = _.filter(current.paths, function(el){
				return _.intersection(el.terminals, goal).length == goal.length;
			});
			// console.log(goal, path, scope.solution.length, path.class);
			
			if(path.length > 0){
				path = path[0];
				// console.log(path.id, path.length);

				var p = path.clone();
				
				var forward = true;
				
				if(scope.solution.length > 0){

					end = scope.solution.getPointAt(scope.solution.length);
					p_start = p.getPointAt(0);
					p_end = p.getPointAt(p.length);

					s_dis = p_start.getDistance(end);
					e_dis = p_end.getDistance(end);
					// if(path.id == 179){
					// 	path.selected = true;
					// 	console.log("179: ", s_dis, e_dis, scope.solution.length);
					// 	var c = new paper.Path.Circle({
					// 		radius: 5, 
					// 		fillColor: "red", 
					// 		position: p_start
					// 	})
					// 	var c = new paper.Path.Circle({
					// 		radius: 5, 
					// 		fillColor: "black", 
					// 		position: p_end
					// 	})
					// 	var c = new paper.Path.Circle({
					// 		radius: 5, 
					// 		fillColor: "blue", 
					// 		position: end
					// 	})
					// }
					forward = s_dis < e_dis;
				} 

				if(forward){		
					for(var i = 0; i <= p.length ; i++)
						scope.solution.add(p.getPointAt(i));
				}
				else{
					for(var i = p.length; i >= 0; i--)
							scope.solution.add(p.getPointAt(i));	
					}
				this.solution.opacity = 0;
				
			}
			index++;
		}
		this.length = this.solution.length;
		this.solution.opacity = 0;
		paper.view.update();
	},	
	colorize: function(color){
		this.solution.strokeColor = color;
	}
}