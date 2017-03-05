function SpiralTower() {
  var geo = new THREE.Geometry();
  // Make a spiraly tower shape thing
  var red = new THREE.Color(0xff0000);
  var white = new THREE.Color(0xffffff);
  var squareCount = 10;
  var squareHeight = 10;
  geo.vertices.push(new THREE.Vector3(-squareHeight, 0, -squareHeight));
  geo.vertices.push(new THREE.Vector3(squareHeight, 0, squareHeight));
  for (var i = 0; i < squareCount * 2; i++) {
    var x = squareHeight * Math.sin(i);
    var y = squareHeight * 0.75 * (i + 1);
    var z = 0;
    var z = squareHeight * Math.cos(i);

    geo.vertices.push(new THREE.Vector3(x, y, z));

    x = squareHeight;
    z = -z;
    geo.vertices.push(new THREE.Vector3(x, y, z));

    var square = i * 2;
    var redFace = new THREE.Face3(square, square + 1, square + 2, undefined, red);
    geo.faces.push(redFace);
    var whiteFace = new THREE.Face3(square + 3, square + 1, square + 2, undefined, white);
    geo.faces.push(whiteFace);
  }

  var material = new THREE.MeshStandardMaterial(
    {
      color: 0xffffff,
      wireframe: false,
      shading: THREE.SmoothShading,
      vertexColors: THREE.FaceColors,
      side: THREE.DoubleSide
    }
  );
  var mesh = new THREE.Mesh(geo, material);
  return mesh;
}
