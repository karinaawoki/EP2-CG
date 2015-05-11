function Quaternion(s,v){
	this.s = s;
	this.v = v;
}

Quaternion.prototype.add = function(q){
	return new Quaternion(this.s + q.s, add(this.v,q.v));
}

Quaternion.prototype.mult = function(q){
	return new Quaternion(this.s*q.s - dot(this.v,q.v),add(add(scale2(this.s, q.v), scale2(q.s, this.v)), cross(this.v, q.v)));
}

Quaternion.prototype.conjugate = function(){
	return new Quaternion(this.s,scale2(-1,this.v));
}