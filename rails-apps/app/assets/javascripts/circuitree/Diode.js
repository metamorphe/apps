function Diode(obj, graph){
	this.graph = graph;
	this.id = obj.id;
	this.item = obj;
	this.init();
	this.power_routes = this.getPathsToPower();
	this.ground_routes = this.getPathsToGround();
}

Diode.prototype = {
	init: function(){
		var positive_blob = PaperUtil.query(this.item, {prefix: ["CVT"]});
		var negative_blob = PaperUtil.query(this.item, {prefix: ["CGT"]});

		this.positive_terminal = this.graph.getNodeFromBlobs(positive_blob);
		this.negative_terminal = this.graph.getNodeFromBlobs(negative_blob);

		this.terminals = _.compact(_.flatten([this.negative_terminal, this.positive_terminal]));
	}, 
	getPathsToPower: function(){
		r = this.graph.getSourceNode();
		p = this.positive_terminal;
		
		if(r.length == 0 || p.length == 0) return [];
		r = r[0];
		p = p[0];
		
		results = Graph.printAllPaths(r, p);
		results = EllustratePath.sortAndMake(results);
		return _.compact(results);
	}, 
	getPathsToGround: function(){
		r = this.graph.getSinkNode();
		p = this.negative_terminal;
		
		if(r.length == 0 || p.length == 0) return [];
		r = r[0];
		p = p[0];
		
		results = Graph.printAllPaths(r, p);
		results = EllustratePath.sortAndMake(results);
		return _.compact(results);
	}
}

Diode.grabDiodes = function(graph){
	var leds = PaperUtil.query(paper.project, {name:"CP:_circuit_x5F_led_1_"});
	leds2 = PaperUtil.query(paper.project, {name:"CP:_LED"});
	leds = _.flatten([leds ,leds2]);
	return _.map(leds, function(led){ return new Diode(led, graph);});
}
