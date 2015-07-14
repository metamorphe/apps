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
WirePath.COIL_LOOP_WIDTH = 2;
WirePath.prototype = {
	update: function(){
		console.log("updating color");
		var style = this.material.getStyle();
		this.path.style = style;
		

		if(this.terminationB == WirePath.termination.SIMPLE_LOOP){
			var start = this.path.localToGlobal(this.path.getPointAt(0));
			var tangent2f = this.path.getTangentAt(0);
			var loopWidth = Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH)/2 + Ruler.mm2pts(this.material.diameter)/2;
			tangent2f.length = loopWidth;

			var path = new paper.Path.Circle({
			    center: [start.x - tangent2f.x, start.y - tangent2f.y],
			    radius: Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH),
			    strokeColor: this.material.color,
			    strokeWidth: Ruler.mm2pts(this.material.diameter)
			});
		}
		if(this.terminationA == WirePath.termination.SIMPLE_LOOP){
			var start = this.path.localToGlobal(this.path.getPointAt(this.path.length));
			var tangent2f = this.path.getTangentAt(this.path.length);
			var loopWidth = Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH)/2 + Ruler.mm2pts(this.material.diameter)/2;
			tangent2f.length = loopWidth;

			var path = new paper.Path.Circle({
			    center: [start.x + tangent2f.x, start.y + tangent2f.y],
			    radius: Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH),
			    strokeColor: this.material.color,
			    strokeWidth: Ruler.mm2pts(this.material.diameter)
			});
		}

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



