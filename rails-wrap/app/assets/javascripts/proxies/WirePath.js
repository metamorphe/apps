function Wires(){
	this.wires = {}
}

Wires.prototype = {
	add: function(key, val){
		this.wires[key] = val;
	}, 
	at: function(key){
		return this.wires[key];
	}
}

WirePath.termination = {
	NONE: 0, 
	EXTEND: 1,
	SPIRAL: 2, 
	COIL_LOOP: 3,
	SIMPLE_LOOP: 4
}
WirePath.weight_profile = {
	NONE: 0,
	UNIFORM: 1, 
	TAPERED: 2,
	UNITAPERED: 3
}

WirePath.baseMaterial = new Material(17, '#999');


function WirePath(paper, path){
	this.id = path.id;
	this.path = path;
	this.paper = paper;
	this.terminationA = WirePath.termination.NONE;
	this.terminationB = WirePath.termination.NONE;
	this.material = WirePath.baseMaterial;
	this.weight_profile = WirePath.weight_profile.UNIFORM;
	this.update();
	this.initDOM();
}

WirePath.prototype = {
	update: function(){
		console.log("updating color");
		var style = this.material.getStyle();
		this.path.style = style;

		this.paper.view.update();
		return this;
	},
	initDOM: function(){
		this.dom = {
			materials : WirePath.DOM.find("#materials"),
			terminationA : WirePath.DOM.find("#termination-a"),
			terminationB : WirePath.DOM.find("#termination-b"),
			weight_profile : WirePath.DOM.find("#weight-profile")
		}
	},
	updateDOM: function(){
		var mat_idx = materials.find(this.material);
		this.dom.materials.val(mat_idx);
		this.dom.terminationA.val(this.terminationA);
		this.dom.terminationB.val(this.terminationB);
		this.dom.weight_profile.val(this.weight_profile);
		return this;
	}
}



