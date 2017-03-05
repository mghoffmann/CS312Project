function midpoint(geometry, indices) {
  if (indices.length <= 0)
    return new THREE.Vector3(NaN, NaN, NaN);

  var sum = geometry.vertices[indices[0]].clone();
  for (var i = 1; i < indices.length; i++) {
    sum.add(geometry.vertices[indices[i]]);
  }
  return sum.divideScalar(indices.length * 1.0);
}

function VertexGroup(geometry, key, indices, constraints) {
  // Keep a pointer to the geometry.
  this.geometry = geometry;
  this.key = key;
  // remember the starting/current-frame position
  // This needs to be changed in the apply method,
  // but should not be exposed to outside code, so underscores obscure it, and
  // the value is in its own object because Object.freeze will freeze
  // __keyPosition, but not the object that __keyPosition points to.
  this.__keyPosition = {value: geometry.vertices[key].clone()};

  // Make a copy of the indices instead of pointing to it
  // because indices likely points to an array that the caller recycles
  // to construct many VertexGroup instances.
  this.indices = [];
  for (var i = 0; i < indices.length; i++) {
    this.indices[i] = indices[i];
    // Make indexing on this the same as indexing on this.indices
    this[i] = indices[i];
  }

  this.length = this.indices.length;


  this.constraints = constraints;

  // Make this immutable. Nothing should be changed after construction.
  Object.freeze(this);
}

VertexGroup.prototype = {
  constructor: VertexGroup,

  update: function() {
    for (var i = 0; i < this.constraints.length; i++) {
      this.constraints[i].apply(this);
    }
  },

  clone: function(){
    return new VertexGroup(this.geometry, this.indices);
  },

  toString: function() {
    return this.indices.length + " indices";
  }
};
