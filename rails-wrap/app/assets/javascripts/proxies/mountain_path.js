var MountainPath = {};

MountainPath.RESOLUTION = 1;
MountainPath.WALL_HEIGHT = 5; //mm                                            
 
MountainPath.SCALE = 100;
MountainPath.TOLERANCE = 0.1;
MountainPath.WALL_THICKNESS = 10;

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

		    //mountain path end
		
		    var vector = init_curve.clone().subtract(point);
		    var diff = init_angle - vector.angle;
		
		    if(Math.abs(diff) > 175){
		    	MountainPath.interior_wall_path(path, init_idx, i, mini_n);
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
		MountainPath.interior_wall_path(path, init_idx, n, mini_n);

}

MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO = 0.8;
MountainPath.interior_wall_path = function(path, n0, n1, mini_n){
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


	MountainPath.mountain_make(mini, (1-max_height) + 0.2);
	paper.view.update();
	return mini;
}


MountainPath.mountain_make = function(path, gray){
	// console.log("mm", path);
	path_width = path.style.strokeWidth;
	

	// e is the inner, b is the outer
	path_e = JigClipper.offset(path, (-path_width/2) -path_width * MountainPath.TOLERANCE);
	path_b = JigClipper.offset(path, (-path_width/2) - MountainPath.WALL_THICKNESS);


	var original_start = path.firstSegment.point;
	var original_end = path.segments[path.segments.length - 1].point;
	
	if(!_.isUndefined(path_e)){

			
		path_e.strokeColor = 'green';
		path_e.sendToBack();
		if(!_.isUndefined(path_b)){
			MountainPath.path_reorder(path_e, original_end);
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
			path_b.strokeColor = 'green';
			path_b.sendToBack();
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


MountainPath.addBackground = function(path){
	var b = path.bounds.clone().expand(20, 20);
	backgroundRect = new paper.Path.Rectangle(b);
	backgroundRect.style.fillColor = 'black';
	backgroundRect.sendToBack();
	backgroundRect.position = b.center.clone();
	console.log("Width", Ruler.pts2mm(b.width), "Height", Ruler.pts2mm(b.height)) 
}