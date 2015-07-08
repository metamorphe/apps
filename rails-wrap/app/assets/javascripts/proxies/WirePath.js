WirePath.termination = {
	NONE: 0, 
	COIL_LOOP: 1
}
WirePath.weight_profile = {
	UNIFORM: 0, 
	TAPERED: 1
}
WirePath.baseMaterial = new Material(17, '#333');

function WirePath(path){
	this.path = path;
	this.terminationA = WirePath.termination.NONE;
	this.terminationB = WirePath.termination.NONE;
	this.material = WirePath.baseMaterial;
	this.weight_profile = WirePath.weight.UNIFORM:
}


