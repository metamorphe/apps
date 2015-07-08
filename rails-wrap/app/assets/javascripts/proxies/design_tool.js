//    d88b d888888b  d888b  d8888b. d88888b .d8888. d888888b  d888b  d8b   db d88888b d8888b. 
//    `8P'   `88'   88' Y8b 88  `8D 88'     88'  YP   `88'   88' Y8b 888o  88 88'     88  `8D 
//     88     88    88      88   88 88ooooo `8bo.      88    88      88V8o 88 88ooooo 88oobY' 
//     88     88    88  ooo 88   88 88~~~~~   `Y8b.    88    88  ooo 88 V8o88 88~~~~~ 88`8b   
// db. 88    .88.   88. ~8~ 88  .8D 88.     db   8D   .88.   88. ~8~ 88  V888 88.     88 `88. 
// Y8888P  Y888888P  Y888P  Y8888D' Y88888P `8888Y' Y888888P  Y888P  VP   V8P Y88888P 88   YD 
                                                                                           
                             
function JigDesigner(container, svg){
	this.paper;
	this.container = container;
	this.svg = svg;
	this.gauge = 14;
	this.init();

}

var point_manip = null;

JigDesigner.prototype = {
	addBackground: function(){
		var rectangle = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(paper.view.size.width * paper.view.zoom, paper.view.size.height * paper.view.zoom));
		var bg = new paper.Path.Rectangle(rectangle);
		bg.fillColor = new paper.Color(0);
		bg.sendToBack();	

	},
	update: function(){
		console.log("Importing", this.svg);
		if(typeof this.paper == "undefined") return;

		var scope = this;
		this.paper.project.activeLayer.removeChildren();
		
			if(_.isUndefined(scope.svgSym)){
				this.importSVG(function(){
				});
			} 	   
		
		paper.view.update();
	},
	
	importSVG: function(callback){
		var scope = this;
		this.paper.project.importSVG(this.svg, {
	    	onLoad: function(item) { 
		    	scope.svgSym = item;
		    	paper.project.activeLayer.addChild(item);

		    	paper.view.update();
		    	item.position = paper.view.center;

    			scope.toolbox.tools.anchortool.setSVG(item);
    			scope.wirepaths = new Wires();

    			_.each(Utility.unpackChildren(item, []), function(value, key, arr){
    				var w  = new WirePath(scope.paper, value);
    				scope.wirepaths.add(w.id, w);
    			});

		    	scope.toolbox.tools.anchortool.selectAll(false);
	    }});
	},
	init: function(){
		var c = this.container;
		this.canvas = DOM.tag("canvas")
				.prop('resize', true)
				.height(c.height())
				.width(c.width());

		c.append(this.canvas);	

		this.paper = new paper.PaperScope();
		this.paper.setup(this.canvas[0]);
		this.height = this.paper.view.size.height;
		this.width = this.paper.view.size.width;
		this.paper.view.zoom = 2.5;	
		var scope = this; 

		this.toolbox = new Toolbox($("#toolbox"));
		this.toolbox.add("anchortool", new AnchorPointTool(this.paper));

		this.update();
		
		return this;
	},
	export: function(mode){
		// var prev = this.paper.view.zoom;
		// this.paper.view.zoom = 1;
		
		// if(mode == JigFactory.SVG)
		exp = this.paper.project.exportSVG({asString: true});
		// else if(mode == JigFactory.PNG)
			// exp = this.canvas[0].toDataURL("image/png");
		// else 
			// exp = "No mode was specified";
		saveAs(new Blob([exp], {type:"application/svg+xml"}), "export.svg")
	
		// console.log(exp);
		// this.paper.view.zoom = prev;

		return exp;
	}
}
                                                              
                                                              

