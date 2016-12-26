var gui;
function clone_vec_array(arr){ return _.map(arr, function(el){ return el.clone(); }); }

function TactileGenerator(options){
	this.props = options;
	this.dimensions = {x: 0.12, y: 19.2, z: 123.2}
	this.init();
	
}
TactileGenerator.prototype = {
	init: function(tc){
		gui = new dat.GUI();
		f0 = gui.addFolder('model parameters');
		f0.add(this.props, 'name');
		f0.add(this.props, 'magnitude', 0, 100);
		f0.add(this.props, 'base_height', 0.01, 100);
		f0.add(this.props, 'resolution', 1, 5, 0.5);
		f0.open();
		f1 = gui.addFolder('dimensions');
		f1.add(this.dimensions, 'x').step(0.01).listen();
		f1.add(this.dimensions, 'y').step(0.01).listen();
		f1.add(this.dimensions, 'z').step(0.01).listen();
		f1.open();
		f2 = gui.addFolder('actions');
		f2.add(this, 'generate');
		f2.add(this, 'save');
		f2.open();
		this.load();
	}, 
	load: function(){
		var scope = this;
		mesh = GeomUtil.makeBox(scope.props, GeomUtil.lambertMaterial);
		mesh.geometry.original = clone_vec_array(mesh.geometry.vertices); //Keep the original geometry
		scope.mesh = mesh;	
	}, 
	calcDimensions: function(){
		mesh.geometry.computeBoundingBox();
		var bb = mesh.geometry.boundingBox;
		return bb.max.clone().sub(bb.min);
	}, 
	generate: function(){
		this.raise(depthMap, this.props.magnitude );
	},
	raise: function(depthMap, magnitude){
		depthMapAdj = GeomUtil.adjustDepthMap(depthMap,  magnitude);
		
		var geometry = this.mesh.geometry;
		var vertices = clone_vec_array(this.mesh.geometry.original);
		
	    GeomUtil.applyToTop(this.mesh, vertices, 
	    	function(vertex, id){
	    		vertex.add(depthMapAdj[id]);
	    	}
	    );
	    var calc = this.calcDimensions();
	    this.dimensions.x = calc.x;
	    this.dimensions.y = calc.y;
	    this.dimensions.z = calc.z;

	},
	save: function(name){
		var filename = this.props.name + ".stl";
		AsciiStlWriter.save(this.mesh.geometry, filename);
	}
}



GeomUtil.adjustDepthMap = function(depthMap, magnitude){
	return _.map(depthMap, function(depthVector){
		return depthVector.clone().multiplyScalar(magnitude);
	});
}

// applies fn to top vertex indices
GeomUtil.applyToTop = function(mesh, vertices, fn){
	var top = GeomUtil.cacheTop(mesh);
	_.each(top, function(vertexID){
		var vertex = vertices[vertexID]
		fn(vertex, vertexID);
	})
	mesh.geometry.vertices = vertices;
	mesh.geometry.verticesNeedUpdate = true;
	mesh.geometry.normalsNeedUpdate = true;
	mesh.geometry.computeFaceNormals();
	mesh.geometry.computeVertexNormals();
}

function GeomUtil(){}
GeomUtil.lambertMaterial = new THREE.MeshLambertMaterial({
	    ambient: new THREE.Color( 0xff0000 ),
	    color: new THREE.Color( 0xffffff ),
	    specular: new THREE.Color( 0x00ff00 ),
	    side: THREE.DoubleSide,
	    shininess: 0
	  });

GeomUtil.makeBox = function(props, material){
	h_s = parseInt(props.height * props.resolution);
	w_s = parseInt(props.width * props.resolution);
	
	var geometry = new THREE.BoxGeometry(props.height, props.width, props.base_height/2, h_s, w_s, 1);
	geometry.dynamic = true;
	mesh = new THREE.Mesh(geometry, material);
	mesh.rotation.x = - Math.PI / 2;
	mesh.rotation.z = - Math.PI;
	mesh.position.y =  0;

	props.env.scene.add(mesh);

	GeomUtil.cacheTop(mesh);
	return mesh;
}

GeomUtil.cacheTop = function(mesh){
	if(! _.isUndefined(mesh.top_indices)) 
		return mesh.top_indices;

	mesh.geometry.computeBoundingBox();
	var bb = mesh.geometry.boundingBox;
	var dimensions = bb.max.clone().sub(bb.min);
	var depth = dimensions.z

	var top_indices = _.chain(mesh.geometry.vertices)
						.map(function(vertex, i){
							if(vertex.z >= depth/2.0) return i;
							else return null;
						})
						.compact()
						.value();

	mesh.top_indices = top_indices;
	return this.top_indices;
}




