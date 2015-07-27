// hilljig generator
var jigpath;                                                                                                     
                             
function HillJig(container, svg){
	this.paper;
	this.container = container;
	this.svg = svg;
	this.gui = new dat.GUI();
	this.gauge = 14;
	this.product = "HillJig";
	this.controllers_defined = false;
	this.loadFromLocalStorage = true;
	this.loadedFromLocal = false;
	this.wirepaths = new Wires();
	// this.factor = 500 / Ruler.convert(config.size, "mm");
	this.init();
	var loadLSController = this.gui.add(this, "loadFromLocalStorage");
	var removeConnectors = this.gui.add(this, "removeConnectors");
	productController = this.gui.add(this, "product", ["HillJig"]);

	this.gui.add(this.paper.view, "zoom", 0.2, 4).step(0.1);
	var gaugeController = this.gui.add(this, "gauge", 10, 30).step(1);
	var scope = this;
	productController.onChange(function(){ scope.update();});
	gaugeController.onChange(function(){ scope.update();});
	loadLSController.onChange(function(){ scope.loadingFromLocalStorage(); });
	$('.close-button').click();
}
var MountainPath = {};
MountainPath.RESOLUTION = 1;
MountainPath.WALL_HEIGHT = 5; //mm                                            
 
MountainPath.SCALE = 100;
MountainPath.TOLERANCE = 0.1;
MountainPath.WALL_THICKNESS = 20;

MountainPath.make = function(path){ 
	var n = path.length;
	console.log("making mountain path", n);
	var init_curve = path.getPointAt(0).clone();
	var init_angle = path.getPointAt(0).clone().subtract(path.getPointAt(MountainPath.RESOLUTION)).angle;
	var init_idx = 0;
	var mini_n = 0;

	console.log("ang", init_angle);
	for(var i = MountainPath.RESOLUTION * 2; i < n; i += MountainPath.RESOLUTION){
			var normalizedPosition = 1 - i/n;

			var point = path.getPointAt(i);
			var normal = path.getNormalAt(i);
			var tangent = path.getTangentAt(i);

			// var curvature = path.getCurvatureAt(i);
			// console.log(curvature);

			var width = path.style.strokeWidth;
			normal.length = width/2;


			//mountain path
			var result = new paper.Point(point.x + 1.2 * normal.x, point.y + 1.2 * normal.y);
			var result2 = new paper.Point(point.x - 2 * normal.x, point.y - 2 * normal.y);
			var line = new paper.Path({
		        segments: [result2, result],
		        strokeWidth: width + 2 +  width * MountainPath.TOLERANCE,
		        strokeColor: new paper.Color(normalizedPosition * MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO),
		        // visible: false
		    });
		    //mountain end
		
		    var vector = init_curve.clone().subtract(point);
		    var diff = init_angle - vector.angle;
		    // console.log(init_angle, diff);
		    // console.log(Math.abs(diff) > 170);
		    if(Math.abs(diff) > 175){
		    	MountainPath.mini_path(path, init_idx, i, mini_n);
		    	// var q = new paper.Path.Circle(point, 1);
		    	// q.fillColor = 'yellow';
		    	// q.visible = false;
		    	// console.log(q);
		    	init_angle = vector.angle;
		    	init_idx = i;
		    	mini_n ++;
		    }
	}
	//the last one
	if(n != init_idx)
		MountainPath.mini_path(path, init_idx, n, mini_n);

}

MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO = 0.8;
MountainPath.mini_path = function(path, n0, n1, mini_n){
	console.log("N", n0, n1);
	var n = path.length;
	var norm_n0 = n0/n;
	var norm_n1 = n1/n;
	var max_height = norm_n1 * MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO;

	var pts = [];
	for(var i = n0; i < n1; i+=MountainPath.RESOLUTION){
		pts.push(path.getPointAt(i).clone());
	}
	
	var mini = new paper.Path(pts);
	mini.style.strokeColor = "yellow";
	mini.style.strokeWidth = path.style.strokeWidth;
	mini.closed = false;
	mini.visible = false;

	// console.log(mini_n);

	MountainPath.mountain_make(mini, (1-max_height) + 0.2);
	paper.view.update();
	return mini;
}


MountainPath.custom_offset = function(path, value){
	var pts = [];
	for(var i = 0; i < path.length; i+=MountainPath.RESOLUTION){
		var pt = path.getPointAt(i);
		var normal = path.getNormalAt(i);
		
		normal.length = value;

		var result = new paper.Point(pt.x - normal.x, pt.y - normal.y);
		
		// var c = new paper.Path.Circle(pt.clone(), 1);
		// c.fillColor = 'black';

		// var c = new paper.Path.Circle(result, 1);
		// c.fillColor = 'blue';
		pts.push(result);
	}
	var p = new paper.Path(pts);
	p.closed = false;
	return p;
}

MountainPath.mountain_make = function(path, gray){
	// console.log("mm", path);
	path_width = path.style.strokeWidth;
	
	path_e = MountainPath.offset(path, (-path_width/2) -path_width * MountainPath.TOLERANCE);
	path_b = MountainPath.offset(path, (-path_width/2) -15);
	var original_start = path.firstSegment.point;
	var original_end = path.segments[path.segments.length - 1].point;
	
	if(!_.isUndefined(path_e)){

		
		if(!_.isUndefined(path_b)){
			MountainPath.path_reorder(path_e, original_end);
			console.log("closed", path_e.closed);
			path_e.closed = false;
			console.log(path_e.position);
			path_e.strokeColor = "black";
			path_e.bringToFront();
			path_e.strokeWidth = 2;
		}
		path_e.style = {
			fillColor: new paper.Color(gray), 
			strokeWidth: 0
		}
	}
	if(!_.isUndefined(path_b)){
			MountainPath.path_reorder(path_b, original_start, true);
			
			path_b.closed = false;
			path_e.removeSegments(0, path_e.firstSegment.index + 5);
			path_b.removeSegments(0, path_b.firstSegment.index + 5);
			path_b.reverse();
			path_e.addSegments(path_b.removeSegments());
			path_e.closePath();

			
	}


}
MountainPath.path_reorder = function(path, ref_pt){

	var orig = path.getNearestPoint(ref_pt);
	curve = path.getLocationOf(orig);
	
  	wrap_around = path.removeSegments(0, curve.segment.index - 1);
  	path.addSegments(wrap_around);
  	return path;
}
MountainPath.subtract = function(a, b){
		console.log(a, a.length)
		var clipType = ClipperLib.ClipType.ctIntersection;
		var _a = JigPath.sample(a, MountainPath.RESOLUTION);
		var _b = JigPath.sample(b, MountainPath.RESOLUTION);
		var subj = [_a];
		var clips = [_b];
		ClipperLib.JS.ScaleUpPaths(subj, JigPath.SCALE);
		ClipperLib.JS.ScaleUpPaths(clips, JigPath.SCALE);

		var solution = new ClipperLib.Paths();
		var c = new ClipperLib.Clipper();
	  	c.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);
	  	c.AddPaths(clips, ClipperLib.PolyType.ptClip, true);
	  	c.Execute(ClipperLib.ClipType.ctDifference, solution);
	  	console.log(solution);
		var ps = [];
		for(var i in solution){
			var p = MountainPath.to_paper_path(solution[i]);
			p.strokeColor = 'magenta';
			ps.push(p);
			console.log("Sub_path", p, p.length);
			p.strokeWidth = 2;
		}
		
		paper.view.update();
		return ps[0];
}


MountainPath.offset = function(path, delta){
		var _p = JigPath.sample(path, MountainPath.RESOLUTION);


		paths = [_p];
		var offset_paths = new ClipperLib.Paths();

		var miterLimit = 2;
		var arcTolerance = 0.25;
		delta *= JigPath.SCALE;
		
		ClipperLib.JS.ScaleUpPaths(paths, JigPath.SCALE);
		var co = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
		co.AddPaths(paths, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etClosedPolygon);
		co.Execute(offset_paths, delta);

		var ps = [];
		for(var i in offset_paths){
			var p = MountainPath.to_paper_path(offset_paths[i]);
			p.strokeColor = 'green';
			p.sendToBack();
			ps.push(p);
		}
		
		paper.view.update();
		return ps[0];
}

MountainPath.to_paper_path = function(pts){
	var path = new paper.Path();
	path.strokeColor = 'black';
	pts.forEach(function(currentValue, index, array){
		path.add(new paper.Point(currentValue.X/MountainPath.SCALE, currentValue.Y/MountainPath.SCALE));
	});
	path.closed = true;
	return path;
}
var testPath;

MountainPath.addBackground = function(path){
	var b = path.bounds.clone().expand(20, 20);
	backgroundRect = new paper.Path.Rectangle(b);
	backgroundRect.style.fillColor = 'black';
	backgroundRect.sendToBack();
	backgroundRect.position = b.center.clone();
	console.log("Width", Ruler.pts2mm(b.width), "Height", Ruler.pts2mm(b.height)) 
}
HillJig.prototype = {
	removeConnectors: function(){
		var scope = this;
		this.connectors = _.filter(this.wirepaths.wires, function(el){
			return el.is_connector;
		});
		this.paths = _.filter(this.wirepaths.wires, function(el){
			return !el.is_connector;
		});

		_.each(this.connectors, function(el){
			el.path.remove();
		});
		// this.paths[1].path.remove();
		_.each([this.paths[0]], function(el){
			// MountainPath.mountain_make(el.path);
			testPath = el.path;
			MountainPath.make(el.path);
			MountainPath.addBackground(el.path);
		});

		scope.paper.project.view.update();
	},
	addBackground: function(){
		var rectangle = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(paper.view.size.width * paper.view.zoom, paper.view.size.height * paper.view.zoom));
		var bg = new paper.Path.Rectangle(rectangle);
		bg.fillColor = new paper.Color(0);
		bg.sendToBack();	

	},
	update: function(){
		if(typeof this.paper == "undefined") return;

		if(!this.loadFromLocalStorage){
			console.log("TODO: Importing from file", this.svg);
		
		} else{
			
			if(this.product == "HillJig"){
				if(!this.loadedFromLocal){
					console.log("Loading from local")
					this.paper.project.clear();
					this.loadingFromLocalStorage();
					this.loadedFromLocal = true;
				}
			}
		};

		paper.view.update();
	},
	importSVG: function(callback){
		var scope = this;
		this.paper.project.importSVG(this.svg, {
	    	onLoad: function(item) { 
		    	
		    	scope.svgSym = item;
		        svg = paper.project.activeLayer.removeChildren();
				pathSVG = svg[0].children[0].children;

				for(var i in pathSVG){
		        	var child = pathSVG[i];
		        	child.applyMatrix = true;
		        	child.position = paper.view.center;
		        	paper.project.activeLayer.addChild(child);
		        }

		        jigpath = new JigPath(paper.project.activeLayer.children[0]);
	    		callback();
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
		this.paper.view.zoom = 3;	
		var scope = this; 
		this.update();
		
		return this;
	},
	loadingFromLocalStorage: function(){
		// this.clear();

		save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	

		if(_.isEmpty(save_events)){
			console.log("No save events to revert to...");
			return;
		}

		console.log("save events", save_events);
		last_event =  _.max(save_events);

		console.log("loading json", last_event);

		this.loadJSON(storage.get('saveevent_' + last_event));
		this.removeConnectors();

	},

	loadJSON: function(json, callback){
		this.art_layer = new paper.Group();


		var scope = this;
		var item = this.paper.project.importJSON(json); 
		
		var layer = item[0];

		for(var i = 0; i < layer.children.length; i ++){
			var group = layer.children[i];

			_.each(Utility.unpackChildren(group, []), function(value, key, arr){
				var w  = new WirePath(scope.paper, value);
				
				scope.wirepaths.add(w.id, w);
			});
	  	}
		scope.art_layer.addChild(layer);
		var b = scope.art_layer.bounds;
		scope.art_layer.position = new paper.Point(0 + b.width/2 + 20, 0 + b.height/2 + 20);
		
		scope.paper.view.zoom = 3;
		scope.paper.view.center = new paper.Point(0 + b.width/2 + 20, 0 + b.height/2 + 20);
		scope.paper.view.update();
	},
	export: function(mode, downloadFlag){
		// var prev = this.paper.view.zoom;
		// this.paper.view.zoom = 1;
		// default
		var exp;
		var filename = $('#filename').val();
		if(_.isUndefined(filename) || filename == ""){	filename = "export"; }
		filename = filename.split('.')[0];

		if(_.isUndefined(mode))
			mode = JigDesigner.EXPORT_DEFAULT;

		if(_.isUndefined(downloadFlag))
			downloadFlag = true;

		
		if(mode == JigDesigner.SVG){
			console.log("Exporting file as SVG");
			exp = this.paper.project.exportSVG({
				asString: true,
				precision: 5
			});
			if(downloadFlag)
				saveAs(new Blob([exp], {type:"application/svg+xml"}), filename + ".svg")
		}
		else if(mode == JigDesigner.JSON){

			console.log("Exporting file as JSON");
			exp = this.paper.project.exportJSON({
				asString: true,
				precision: 5
			});
			if(downloadFlag)
				saveAs(new Blob([exp], {type:"application/json"}), filename + ".json")
		}


			// exp = this.canvas[0].toDataURL("image/png");
		// else 
			// exp = "No mode was specified";
		
	
		// console.log(exp);
		// this.paper.view.zoom = prev;

		return exp;
	}
}


//    d88b d888888b  d888b   .o88b. db      d888888b d8888b. d8888b. d88888b d8888b. 
//    `8P'   `88'   88' Y8b d8P  Y8 88        `88'   88  `8D 88  `8D 88'     88  `8D 
//     88     88    88      8P      88         88    88oodD' 88oodD' 88ooooo 88oobY' 
//     88     88    88  ooo 8b      88         88    88~~~   88~~~   88~~~~~ 88`8b   
// db. 88    .88.   88. ~8~ Y8b  d8 88booo.   .88.   88      88      88.     88 `88. 
// Y8888P  Y888888P  Y888P   `Y88P' Y88888P Y888888P 88      88      Y88888P 88   YD 
                                                                                  
                                                                                  
function JigClipper(){
	this.clipper = ClipperLib.Clipper();
}


// db    db d888888b d888888b db      d888888b d888888b db    db 
// 88    88 `~~88~~'   `88'   88        `88'   `~~88~~' `8b  d8' 
// 88    88    88       88    88         88       88     `8bd8'  
// 88    88    88       88    88         88       88       88    
// 88b  d88    88      .88.   88booo.   .88.      88       88    
// ~Y8888P'    YP    Y888888P Y88888P Y888888P    YP       YP


function addPoints(pta, ptb){
	return new paper.Point(pta.x + ptb.x, pta.y + ptb.y);
}
function subPoints(pta, ptb){
	return new paper.Point(pta.x - ptb.x, pta.y - ptb.y);
}    
                                                              
                                                              

