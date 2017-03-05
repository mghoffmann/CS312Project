function DistanceConstraint(distanceXYZ, reverse = false) {
  this.distance = distanceXYZ;
  this.distance.x = Math.abs(this.distance.x);
  this.distance.y = Math.abs(this.distance.y);
  this.distance.z = Math.abs(this.distance.z);

  this.reverse = reverse;

  this.isDistanceConstraint = true;

  // Freeze this so its properties are read-only
  Object.freeze(this);
}

DistanceConstraint.prototype = {
  constructor: DistanceConstraint,

  apply: function(vertexGroup) {
    var newKeyPos = vertexGroup.geometry.vertices[vertexGroup.key].clone();
    var delta = newKeyPos.sub(vertexGroup.__keyPosition.value);

    if (delta.lengthManhattan() < this.distance) {
      console.log(delta);
      for (var i = 0; i < vertexGroup.indices.length; i++) {
        vertexGroup.geometry.vertices[vertexGroup.indices[i]].add(delta);
        vertexGroup.verticesNeedUpdate = true;
      }
    }

    vertexGroup.__keyPosition.value = vertexGroup.geometry.vertices[vertexGroup.key].clone();
  }
};

// Enforces constraints between a key vertex and a group of child vertices.
function KeyConstraints(constraints) {
  this.constraints = constraints;
}
