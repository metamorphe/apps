var wp;

function HeightMap(url){
	this.url = url;
}
HeightMap.prototype = {
	load: function(callbackFN){
		var scope = this;
		var hm = new Image();
		hm.crossOrigin = "";
		hm.onload = function () {
		    var w = $(hm).width();
		    var h = $(hm).height();
			var myCanvas = Filters.getCanvas(w, h);
			var ctx = myCanvas.getContext('2d');
			ctx.imageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
		    ctx.drawImage(hm, 0, 0, w, h);
		    scope.pixels = ctx.getImageData(0, 0, w, h);
		    scope.pixels = Filters.filterImage(scope.pixels, Filters.grayscale);
		    $(hm).hide();	
		    callbackFN(scope.pixels);
		};
		$(hm).appendTo($('#texture-container'));
		hm.src = this.url;
	}
}


function extractDepthMap(pixels, faces, faceVertexUvs){
	var height = pixels.height;
	var width = pixels.width;
	depthMap = [];
	
	_.each(faces, function(face, i){
		// three points on the triangle, find the pixel value closest to the UV
		// technically redundant...
		var uv1 = faceVertexUvs[0][i][0];
		var pixel1 = uv2bilerpxy(uv1, width, height, pixels);
		var uv2 = faceVertexUvs[0][i][1];
		var pixel2 = uv2bilerpxy(uv2, width, height, pixels);
		var uv3 = faceVertexUvs[0][i][2];
		var pixel3 = uv2bilerpxy(uv3, width, height, pixels);
		var normal = face.normal;
		depthMap[face.a] = normal.clone().multiplyScalar(pixel1); 
		depthMap[face.b] = normal.clone().multiplyScalar(pixel2); 
		depthMap[face.c] = normal.clone().multiplyScalar(pixel3);
	});
	return depthMap;
}

function uv2xypixel(uv, w, h, pixels){
	var u = uv.y;
	var v = uv.x;

	var x = (h) - (u * 1.0 * h);
	var y = v * 1.0 * w;

	var y1 = Math.floor(y);
	var x1 = Math.floor(x);

	if(y1 < 0) y1 = 0;
	if(x1 < 0) x1 = 0;

	return getPixel(x1, y1, w, pixels);
}

function uv2avgpxy(uv, w, h, pixels){
	var u = uv.y;
	var v = uv.x;

	var neighbor = 5;
	var x = (h) - (u * 1.0 * h);
	var y = v * 1.0 * w;

	var y1 = Math.floor(y) - neighbor;
	var x1 = Math.floor(x) - neighbor;
	var y2 = y1 + neighbor;
	var x2 = x1 + neighbor;

	// console.log(u, v, x, x1, x2, y, y1, y2);

	if(y1 < 0) y1 = 0;
	if(x1 < 0) x1 = 0;
	if(y2 >= w) y2 = w;
	if(x2 >= h) x2 = h;

	var Q11 = getPixel(x1, y1, w, pixels);
	var Q21 = getPixel(x2, y1, w, pixels);
	var Q12 = getPixel(x1, y2, w, pixels);
	var Q22 = getPixel(x2, y2, w, pixels);

	var sum = Q11 + Q21 + Q12 + Q22;
	sum/= 4;
	return sum;
}
function uv2bilerpxy(uv, w, h, pixels){
	var u = uv.y;
	var v = uv.x;

	neighbor = 1;

	var x = (h) - (u * 1.0 * h);
	var y = v * 1.0 * w;

	var y1 = Math.floor(y);
	var x1 = Math.floor(x);
	var y2 = y1 + neighbor;
	var x2 = x1 + neighbor;

	// console.log(u, v, x, x1, x2, y, y1, y2);

	if(y1 < 0) y1 = 0;
	if(x1 < 0) x1 = 0;
	if(y2 >= w) y2 = w;
	if(x2 >= h) x2 = h;

	var Q11 = getPixel(x1, y1, w, pixels);
	var Q21 = getPixel(x2, y1, w, pixels);
	var Q12 = getPixel(x1, y2, w, pixels);
	var Q22 = getPixel(x2, y2, w, pixels);
	return calcBilinearInterpolant(x1, x, x2, y1, y, y2, Q11, Q21, Q12, Q22);
	// return getPixel(x1, y1, w, pixels);
}

function getPixel(x, y, w, pixels){
	var row = x * (w * 4); 
	var col = y * 4;
	var index = row + col;
	return pixels.data[index] / 255.0;
}
function uv2xy(uv, w, h){
	var u = uv.y;
	var v = uv.x;

	if(u < 0 || u > 1 || v < 0 || v > 1){
		var err = new Error("Invalid UV coordinates (" + u + ", " + v + ")");
		return err.stack;
	}

	var x = (h - 1) - Math.floor(u * 1.0 * h);
	var y = Math.floor(v * 1.0 * w);

	var row = x * (w * 4); 
	var col = y * 4;
	var index = row + col;

	return index;
}


