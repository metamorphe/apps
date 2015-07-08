// zoom.js

Zoom.STEP = 0.5;
Zoom.MAX = 5;
Zoom.MIN = 0;

function Zoom(starting_level, paper){
	this.level = starting_level;
	this.checkbounds();
}

Zoom.prototype = {
	checkbounds: function(){
		if(this.level > Zoom.MAX) this.level = Zoom.MAX;
		if(this.level < Zoom.MIN) this.level = Zoom.MIN;
	},
	in: function(){
		this.level += Zoom.STEP;
		this.checkbounds();
		this.update();
	},
	out: function(){
		this.level -= Zoom.STEP;
		this.checkbounds();
		this.update();
	}, 
	update: function(){
		paper.view.zoom = this.level;
		paper.view.update();
	}
}