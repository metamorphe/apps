/* Image processing */

Filters = {};

Filters.getPixels = function(hm){
	return hm.data;
};

Filters.getCanvas = function(w, h){
	var c = $('#texture-render');
	console.log("Setting to", w, h)
	$(c).attr('width', w).attr('height', h);
	return c[0];
}

Filters.filterImage = function(pixels, filter, var_args){
	var args = [pixels];
	for(var i in var_args){
		args.push(var_args[i]);
	}
	return filter.apply(null, args);
};
Filters.grayscale = function(pixels, args){
	var d = pixels.data;
	for(var i = 0; i < d.length; i+=4){
		var r = d[i];
		var g = d[i + 1];
		var b = d[i + 2];
		//CIE luminance
		var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	return pixels;
};

Filters.threshold = function(pixels, threshold) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.brightness = function(pixels, adjustment) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    d[i] += adjustment;
    d[i+1] += adjustment;
    d[i+2] += adjustment;
  }
  return pixels;
};