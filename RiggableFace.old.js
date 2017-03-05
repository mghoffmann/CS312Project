
// This is a helper (hence the weird identifier) for prototyping a THREE.Geometry
// with a hash of faces, keyed by the edges they're defined by.
// This lets each face transformation be appied to each connected face.
// Originally this was a hash keyed by vertices, but many faces may shared
// a single vertex, whereas an edge only defines two faces in most use cases.
function __prototypeJoints(geometry, face, indices) {
  // Prototype the containing array of arrays
  if (geometry.edgeJoints === undefined) {
    geometry.edgeJoints = [];
  }

  // Each number in indices is an index in the geometries vertices
  for (var i = 0; i < indices.length; i++) {
    // Create the array of faces for each vertex
    if (geometry.edgeJoints[indices[i]] === undefined) {
      geometry.edgeJoints[indices[i]] = [];
      // Prototype the array with this property, used to avoid infinite loops
      geometry.edgeJoints[indices[i]].beingRecursed = false;
    }

    geometry.edgeJoints[indices[i]].push(face);
  }
}

var ZERO = new THREE.Vector3(0,0,0);

function RiggableFace(geometry, face, rigid = false) {
  this.geometry = geometry;
  if (typeof face == "number") {
    this.face = geometry.faces[face];
  }
  else {
    throw "RiggableFace expects a face number. A THREE.Face3 for it should have been added to geometry.faces before this constructor call.";
  }

  this.rigid = rigid;

  // Don't store this in the this variable, because I keep trying to set
  // to this.triangle to change the geometry's vertices, which doesn't work
  // with the way ThreeJS copies things.
  var triangle = new THREE.Triangle(
    geometry.vertices[this.face.a],
    geometry.vertices[this.face.b],
    geometry.vertices[this.face.c]);

  this.helper = new THREE.ArrowHelper(triangle.normal(), triangle.midpoint(), 25, 0x0000ff);
  this.helper.face = this;

  __prototypeJoints(this.geometry, this, [this.face.a, this.face.b, this.face.c]);

  return this;
}

var translated = 0;

RiggableFace.prototype = {
  constructor: RiggableFace,

  translate: function(value, weight = 1.0, weightDelta = 0.1) {

    if (isNaN(weightDelta) || isNaN(weight)) {
      throw "Error: weight and weightDelta must be real numbers.";
    }
    else if (weightDelta < 0 && weight > 0) {
      throw "Error: weight and weightDelta must have the same numeric sign."
    }

    this.applyingChange = true;

    var triangle = new THREE.Triangle(
      this.geometry.vertices[this.face.a].clone(),
      this.geometry.vertices[this.face.b].clone(),
      this.geometry.vertices[this.face.c].clone());

    triangle.a.add(value);
    triangle.b.add(value);
    triangle.c.add(value);

    this.helper.setDirection(triangle.normal());
    this.helper.position.copy(triangle.midpoint());

    var oldSign = weight >= 0;
    var nextWeight = weight - weightDelta;
    // Don't go past zero if weightDelta isn't a multiple of weight
    if (oldSign != nextWeight >= 0)
      nextWeight = 0;

    // Don't apply nothing. That doesn't make sense.
    if (nextWeight != 0) {

      value.multiplyScalar(weight);

      // Apply the translation to each non-rigid face connected to vertex a,
      // as long as it's not already applying a change.
      var faces = this.geometry.edgeJoints[this.face.a];
      // Skip the faces of the vertex if they're already being recursed
      // into- this prevents infinite looping.
      if (!faces.beingRecursed) {
        faces.beingRecursed = true;
        for (var i = 0; i < faces.length; i++) {
          if (!faces[i].rigid && !faces[i].applyingChange) {
            // Recurse to the next face
            faces[i].translate(value, nextWeight, weightDelta);
          }
        }
        faces.beingRecursed = false;
      }

      // Repeat for vertex b
      faces = this.geometry.edgeJoints[this.face.b];
      if (!faces.beingRecursed) {
        faces.beingRecursed = true;
        for (var i = 0; i < faces.length; i++) {
          if (!faces[i].rigid && !faces[i].applyingChange) {
            faces[i].translate(value, nextWeight, weightDelta);
          }
        }
        faces.beingRecursed = false;
      }

      // And for vertex c
      faces = this.geometry.edgeJoints[this.face.c];
      if (!faces.beingRecursed) {
        faces.beingRecursed = true;
        for (var i = 0; i < faces.length; i++) {
          if (!faces[i].rigid && !faces[i].applyingChange) {
            faces[i].translate(value, nextWeight, weightDelta);
          }
        }
        faces.beingRecursed = false;
      }


    }

    // These statements are after everything to undo the duplication that
    // recursion causes:
    // When triangle A is connected to B by a shared vertex v, they will both
    // change v. These statements' placement after the recursion exit undoes
    // that.
    // The = operator doesn't work here, because ThreeJS does some copying to
    // shader-friendly structures in the background.
    // See https://github.com/mrdoob/three.js/issues/7179
    this.geometry.vertices[this.face.a].set(triangle.a.x,triangle.a.y,triangle.a.z);
    this.geometry.vertices[this.face.b].set(triangle.b.x,triangle.b.y,triangle.b.z);
    this.geometry.vertices[this.face.c].set(triangle.c.x,triangle.c.y,triangle.c.z);

    this.geometry.verticesNeedUpdate = true;
    this.applyingChange = false;

    translated++;

    return this;
  },

  scale: function(scalar, origin, weight = 1.0) {
    if (isNaN(weightDelta) || isNaN(weight)) {
      throw "Error: weight and weightDelta must be real numbers.";
    }
    else if (weightDelta < 0 && weight > 0) {
      throw "Error: weight and weightDelta must have the same numeric sign."
    }
    else if (!scalar.isVector3) {
      return this.scale(new THREE.Vector3(scalar, scalar, scalar), origin, weight);
    }

    var newA = this.geometry.faces[this.face.a].clone();
    var newB = this.geometry.faces[this.face.b].clone();
    var newC = this.geometry.faces[this.face.c].clone();

    newA = newA.sub(origin).multiplyScalar(scalar).add(origin);
    newB = newB.sub(origin).multiplyScalar(scalar).add(origin);
    newC = newC.sub(origin).multiplyScalar(scalar).add(origin);

    // These statements are after everything to undo the duplication that
    // recursion causes:
    // When triangle A is connected to B by a shared vertex v, they will both
    // change v. These statements' placement after the recursion exit undoes
    // that.
    // The = operator doesn't work here, because ThreeJS does some copying to
    // shader-friendly structures in the background.
    // See https://github.com/mrdoob/three.js/issues/7179
    this.geometry.vertices[this.face.a].set(triangle.a.x,triangle.a.y,triangle.a.z);
    this.geometry.vertices[this.face.b].set(triangle.b.x,triangle.b.y,triangle.b.z);
    this.geometry.vertices[this.face.c].set(triangle.c.x,triangle.c.y,triangle.c.z);

    this.geometry.verticesNeedUpdate = true;
    this.applyingChange = false;
  },

  rotate: function(axis, radians, weight = 1.0) {

  }
};
