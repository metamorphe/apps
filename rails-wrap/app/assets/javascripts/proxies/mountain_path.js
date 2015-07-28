var MountainPath = {};

MountainPath.RESOLUTION = JigClipper.RESOLUTION;
MountainPath.WALL_HEIGHT = 5; //mm                                            
 
MountainPath.SCALE = 100;
MountainPath.TOLERANCE = 0.1;
MountainPath.WALL_THICKNESS = 10;//mm
MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO = 0.8;

MountainPath.wire_path = function(path){ 
	var n = path.length;
	console.log("making mountain path", n);

	for(var i = 0; i < n; i += MountainPath.RESOLUTION){
			var normalizedPosition = 1 - i/n;

			var point = path.getPointAt(i);
			var normal = path.getNormalAt(i);
		
			var width = path.style.strokeWidth;
			normal.length = width/2;

			//mountain path
			var result = new paper.Point(point.x + 1.2 * normal.x, point.y + 1.2 * normal.y);
			var result2 = new paper.Point(point.x - 2 * normal.x, point.y - 2 * normal.y);
			
			var line = new paper.Path({
		        segments: [result2, result],
		        strokeWidth: width + 2 +  width * MountainPath.TOLERANCE,
		        strokeColor: new paper.Color(normalizedPosition * MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO)
		    });
		    line.bringToFront();
	}
}

MountainPath.viz_turns = function(path, turns){
	console.log(turns);
	for(var i in turns){
		var segment = turns[i];
		var mini_start = path.getPointAt(segment.start);
		var mini_end = path.getPointAt(segment.end - 1);

		var q = new paper.Path.Circle(mini_start, 0.5);
			    	q.fillColor = 'green';
			    	q.visible = true;
			    	q.bringToFront();
		var q = new paper.Path.Circle(mini_end ,0.5);
			    	q.fillColor = 'blue';
			    	q.visible = true;
			    	q.bringToFront();

	}
	
}


MountainPath.make = function(path){ 
	var n = path.length;
	console.log("making mountain path", n);

	var init_pt = path.getPointAt(0).clone();
	var init_vector = path.getPointAt(MountainPath.RESOLUTION).clone().subtract(init_pt);
	var init_idx = 0;
	var mini_n = 0;
	var crawling = false;
	// console.log("Initial angle", init_angle);

	for(var i = MountainPath.RESOLUTION * 2; i < 400; i += MountainPath.RESOLUTION){
			var normalizedPosition = 1 - i/n;

			var point = path.getPointAt(i);
			var normal = path.getNormalAt(i);
			var tangent = path.getTangentAt(i);

			var width = path.style.strokeWidth;
			normal.length = width/2;


		

		    //mountain path end
		
		    var vector = point.clone().subtract(init_pt);
		    var diff = init_vector.getDirectedAngle(vector);
		    // console.log(diff);

		    // var diff = vector.angle - init_angle;
		    if(diff < 0) { diff -= 180; diff *= -1;}
		    diff %= 180;

		    // console.log("diff", diff);

		    var viz = new paper.Path([init_pt, point]);
		    // viz.style = MountainPath.construction_style(0.3);
		    viz.style.strokeWidth = 0.25;
		    viz.style.visible = true;
		    viz.style.strokeColor = 'yellow';
		    viz.bringToFront();


			console.log("diff", diff, crawling, MountainPath.RESOLUTION / 1.5);
		    // console.log("crawling", crawling);
		    if(diff < MountainPath.RESOLUTION  * 1.1  && !crawling){
		    	crawling = false;
		    	console.log("angle diff max ", 1 * MountainPath.RESOLUTION / 5)
				init_pt = path.getPointAt(i - MountainPath.RESOLUTION);
				init_vector = path.getPointAt(i).clone().subtract(init_pt);
		    	init_idx = i - MountainPath.RESOLUTION;
		    	var q = new paper.Path.Circle(init_pt, 1);
		    	q.fillColor = 'red';
		    	q.visible = true;
		    	q.bringToFront();
		    	console.log("skipped", init_idx);
		    	continue;
		    }


		    if(diff > 170){
		    	init_pt = path.getPointAt(i - MountainPath.RESOLUTION);
		    	MountainPath.interior_wall_path(path, init_idx, i, mini_n);
		    	var q = new paper.Path.Circle(init_pt, 1);
		    	q.fillColor = 'yellow';
		    	q.visible = false;
		    	q.bringToFront();
		    	// console.log(q);
		    	
		    	init_vector = path.getPointAt(i).clone().subtract(init_pt);
		    	
		    	// var viz = new paper.Path([init_pt, point]);
			    // viz.style = MountainPath.construction_style(0.3);
		    	// viz.style.strokeColor = 'yellow';
			    // viz.style.strokeWidth =1;
			    // viz.style.visible = false;

		    	init_idx = i - MountainPath.RESOLUTION;
		    	mini_n ++;
		  		crawling = false;
		    } else{
		    	crawling = true;
		    }
		    
		  
		   
		    
		   
	}
	//the last one
	if(n != init_idx)
		MountainPath.interior_wall_path(path, init_idx, n, mini_n);

}



MountainPath.interior_wall_path = function(path, n0, n1, mini_n){
	console.log("N", n0, n1);
	var n = path.length;
	var norm_n0 = n0/n;
	var norm_n1 = n1/n;
	var max_height = norm_n0 * MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO;

	var pts = [];
	for(var i = n0; i < n1; i+= MountainPath.RESOLUTION){
		pts.push(path.getPointAt(i).clone());
	}
	
	var mini = new paper.Path(pts);

	// mini.style.strokeColor = "yellow";
	// mini.style.strokeWidth = 0.1;
	// mini.style.strokeWidth = path.style.strokeWidth;
	// mini.closed = false;
	// mini.style = MountainPath.construction_style(mini_n/n);
	var mini_start = mini.getPointAt(0);
	var mini_end = mini.getPointAt(mini.length);

	var q = new paper.Path.Circle(mini_start, 0.5);
		    	q.fillColor = 'green';
		    	q.visible = true;
		    	q.bringToFront();
	var q = new paper.Path.Circle(mini_end,0.5);
		    	q.fillColor = 'blue';
		    	q.visible = true;
		    	q.bringToFront();

	mini.visible = false;


	// MountainPath.mountain_make(mini, (1 - max_height) + 0.2);
	paper.view.update();
	return mini;
}

MountainPath.construction_style = function(val){ 
	if(_.isUndefined(val)) val = "#666";
	else val = new paper.Color(val);

	return {
		strokeWidth: 1, 
		strokeColor: val
	}
}

MountainPath.heightmap_style = function(gray){ 
	return {
		strokeWidth: 0, 
		fillColor: new paper.Color(gray), 
	}
}

	
	
var make_id = 0;
// This method construct a wall from a given path, raised by gray [0, 1]
MountainPath.mountain_make = function(path, gray){
	// console.log("mm", path);
	path_width = path.style.strokeWidth;
	

	// e is the inner, b is the outer
	var paths_outer = JigClipper.offset(path, (-path_width/2) -path_width * MountainPath.TOLERANCE);
	var paths_inner = JigClipper.offset(path, (-path_width/2) - MountainPath.WALL_THICKNESS);


	var original_start = path.firstSegment.point;
	var original_end = path.segments[path.segments.length - 1].point;
	
	
	_.each(paths_outer, function(el, i, arr){
		el.style = MountainPath.construction_style(make_id/5);
		MountainPath.path_reorder(el, original_end);
		el.closed = false;
		el.bringToFront();
	});

	_.each(paths_inner, function(el, i, arr){
		el.style = MountainPath.construction_style(make_id/5);
		MountainPath.path_reorder(el, original_start, true);
		el.closed = false;
		el.bringToFront();


			el.removeSegments(0, el.firstSegment.index + 5);
			el.reverse();
			console.log(i);
			var outer = paths_outer[0];
			if(outer){
				outer.removeSegments(0, outer.firstSegment.index + 5);
				outer.addSegments(el.removeSegments());
				outer.closePath();
				outer.sendToBack();
				outer.style = MountainPath.heightmap_style(gray);
			}
	});

	make_id ++;
}

MountainPath.path_reorder = function(path, ref_pt){

	var orig = path.getNearestPoint(ref_pt);
	curve = path.getLocationOf(orig);
	
  	wrap_around = path.removeSegments(0, curve.segment.index - 1);
  	path.addSegments(wrap_around);
  	return path;
}


MountainPath.addBackground = function(path){
	var b = path.bounds.clone().expand(20, 20);
	backgroundRect = new paper.Path.Rectangle(b);
	backgroundRect.style.fillColor = 'black';
	backgroundRect.sendToBack();
	backgroundRect.position = b.center.clone();
	console.log("Width", Ruler.pts2mm(b.width), "Height", Ruler.pts2mm(b.height)) 
}