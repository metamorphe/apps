EllustratePath.sortAndMake = function(results){
	var color = new paper.Color("#888");
	var hue = 0;
	return _.chain(results).map(function(result){
		myColor = color.clone();
		myColor.hue = hue;
		var ptg = new EllustratePath(result, myColor);
		hue += 20;
		return ptg;
	}).sortBy(function(ep){ return ep.length})
	.uniq(function(ep){ return (ep.length / 20).toFixed(0); }).value();
}


function EllustratePath(str, color){
	var scope = this;
	this.str = str;
	this.color = color;
	this.nodes = PaperUtil.queryIDs(_.map(str.split('-'), function(el){ return parseInt(el);}));
	this.group = new paper.Group({
           closed: false, 
           children: this.nodes
         });
	PaperUtil.set(_.reject(this.group.children, function(child){return child.closed}), {strokeColor: "purple", strokeWidth: 5});
	PaperUtil.set(_.filter(this.group.children, function(child){return child.closed}), {fillColor: "purple", strokeWidth: 0});
	scope.init();
	scope.generate_small();
	this.solution.bringToFront();
}
EllustratePath.prototype = {
	init: function(){
		var solution = 
			new paper.Path({
				parent: PaperUtil.queryPrefix("ELD")[0],
				strokeColor: this.color, 
				strokeWidth: 5,
				closed: false, 
				opacity: 0
			});
		var segments = _.chain(this.nodes).each(function(node, i, arr){
			if(node.closed){ return; }
			if(solution.length > 0){
				var lastPoint = solution.getPointAt(solution.length);
				var head = node.getPointAt(0);
				var tail = node.getPointAt(node.length);
				var dis_head = head.getDistance(lastPoint);
				var dis_tail = tail.getDistance(lastPoint);
				if(dis_head > dis_tail) node.reverse();
				solution.addSegments(node.segments);
			}
			else solution.addSegments(node.segments);
		});
		this.solution = solution;
		this.length = solution.length;
		paper.view.update();
	},	
	generate_small: function(){
		var head = this.nodes[0];
		var backwards = this.solution.getOffsetOf(this.solution.getNearestPoint(head.position));
		var reverse = false;
		if(backwards > this.solution.length - backwards)
			reverse = true;

		var scope = this;
		var MAX_MINI_SOLUTION_LENGTH = 60;
		MAX_MINI_SOLUTION_LENGTH = MAX_MINI_SOLUTION_LENGTH >= this.solution.length ? this.solution.length : MAX_MINI_SOLUTION_LENGTH;
		if(!reverse)
			var pts = _.range(0, MAX_MINI_SOLUTION_LENGTH, 1);
		else
			var pts = _.range(scope.solution.length, scope.solution.length-MAX_MINI_SOLUTION_LENGTH, -1);
		pts = _.map(pts, function(offset){
			return scope.solution.getPointAt(offset);
		});

		this.mini_solution = 
			new paper.Path({
				parent: PaperUtil.queryPrefix("ELD")[0],
				strokeColor: this.color, 
				strokeWidth: 5,
				closed: false, 
				opacity: 0, 
				segments: pts
			});
	},
	colorize: function(color){
		this.solution.strokeColor = color;
	}
}
