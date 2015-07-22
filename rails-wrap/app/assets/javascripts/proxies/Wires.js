function Wires(){
	this.wires = {}
}

Wires.prototype = {
	clear: function(){
		this.wires = {};
	},
	add: function(key, val){
		this.wires[key] = val;
	}, 
	at: function(key){
		return this.wires[key];
	}, 
	totalLength: function(){
		var sum = 0;
		_.each(this.wires, function(v){ sum += v.path.length });
		return sum;
	}, 
	length: function(){
		return Object.size(this.wires);
	}
}