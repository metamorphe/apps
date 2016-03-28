function Diode(id){
	this.id = id;
	this.item = Node.get(id);
	this.positive_terminal;
	this.negative_terminal;
	this.terminals;
	this.init();
}
var debug;
Diode.makeDiodes = function(){
	var leds = EllustrateSVG.get({name:"CP:_circuit_x5F_led_1_"});
	var diodes = _.map(leds, function(led){
		return new Diode(led.id);
	});
	return diodes;
}
Diode.prototype = {
	init: function(){
		this.positive_terminal = EllustrateSVG.match(this.item, {prefix: ["CVT"]})[0].sourceNode;
		if(_.isUndefined(this.positive_terminal)) this.positive_terminal = null;

		this.negative_terminal = EllustrateSVG.match(this.item, {prefix: ["CGT"]})[0].sourceNode; 
		if(_.isUndefined(this.negative_terminal))this.negative_terminal = null;

		this.terminals = _.flatten([this.negative_terminal, this.positive_terminal]);
	}, 
	inPath: function(nodeIDArray){
		var is_connected = false;	
		var nodes = nodeIDArray;
		var number_of_terminals_in_path = _.reduce(led, function(memo, terminal){	
			var inside = nodes.indexOf(terminal) > -1;
			if(inside) return memo + 1;
			else return memo;
		}, 0);
		is_connected = number_of_terminals_in_path >= 2;
		
		return is_connected;
	}, 
	getPositivePath: function(nodeIDArray){
		var nodes = nodeIDArray;
		var idx = nodes.indexOf(this.positive_terminal);
		return nodes.slice(0, idx);
	},
	getNegativePath: function(nodeIDArray){
		var nodes = nodeIDArray;
		var idx = nodes.indexOf(this.negative_terminal);
		return nodes.slice(idx, nodes.length - 1);
	}, 
	getPathsToPower: function(){
		r = graph.getSourceNode();
		if(_.isNull(r)) return [];
		
		r = Node.get(r).sourceNode;
		r = Node.get(r).node;

		p = this.positive_terminal;
		if(_.isNull(p)) return [];
		p = Node.get(p).node;

		
		
		results = Graph.printAllPaths(r, p);
		console.log("POWER", r.id, p.id, results)
		// 
		debug = EllustratePath.sortAndMake(results);
		return debug ;
		// return [];
	}, 
	// getAllPathsToPower: function(){
	// 	r = graph.getSourceNode();
	// 	if(_.isNull(r)) return [];
		
	// 	r = Node.get(r).sourceNode;
	// 	r = Node.get(r).node;

	// 	p = this.positive_terminal;
	// 	if(_.isNull(p)) return [];
	// 	p = Node.get(p).node;
		
	// 	results = Graph.printAllPaths(r, p);
	// 	// console.log("PATH FROM", r.id, p.id, results)
	// 	return EllustratePath.sortAndMake(results);
		
	// }, 
	getPathsToGround: function(){
		r = graph.getSinkNode();
		if(_.isNull(r)) return [];
		
		r = Node.get(r).sourceNode;
		r = Node.get(r).node;

		n = this.negative_terminal;
		if(_.isNull(n)) return [];
		n = Node.get(n).node;
		
		// console.log("LOOKING FOR GROUND PATH FROM", r.id, n.id)
		results = Graph.printAllPaths(r, n);
		

		return EllustratePath.sortAndMake(results);
	},
	getAllPathsToFromPowerPad: function(){
		return this.getAllPathsFromPad(this.positive_terminal);
	}, 
	getAllPathsToFromGroundPad: function(){
		return this.getAllPathsFromPad(this.negative_terminal);
	}, 
	getAllPathsFromPad: function(t1){
		// graph.enable();
		var t2 = Node.get(t1).node.getChildren();
		var prev = _.flatten([t2, t1]);
		var t3 = _.map(t2, function(el){
			diff = _.difference(Node.get(el).node.getChildren(), prev);
			if(diff.length == 0)
				return t2;
			return diff;
		});
		t3 = _.flatten(t3);
		
		// t3 = _.flatten(_.uniq([t3, t2]));

		// console.log("TERMINAL SEARCH", this.id, t1, t3);
		allPaths = _.map(t3, function(nextTerminal, i){
			a = Node.get(t1).node;
			b = Node.get(nextTerminal).node;
			results = Graph.printAllPaths(a, b);
			// results = EllustratePath.sortAndMake(results)[0];
			// results.solution.opacity = 1;
			// return results;
			results = EllustratePath.sortAndMake(results)
			results = _.reject(results, function(el){ return el.length == 0});
			if(results.length > 0)
				return results[0];
			else 
				return results;
		});

		allPaths = _.flatten(allPaths);
		// console.log("B", allPaths.length);
		// allPaths = _.uniq(allPaths, function(ptg){
		// 	console.log(ptg.length);
		// 	return ptg.str;
		// });

		// console.log("A", _.map(allPaths.length));
		// console.log(allPaths);
		// return [];
		return allPaths;
	}
}