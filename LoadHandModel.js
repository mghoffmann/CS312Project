function LoadHandModel(callback) {
  THREE.ImageUtils.crossOrigin = '';
  var loader = new THREE.ObjectLoader();

  loader.load(
    // resource URL
    "http://localhost/models/json/hand.json",

    // pass the loaded data to the onLoad function.
    //Here it is assumed to be an object
    function ( obj ) {
      callback(obj);
    },

    // Function called when download progresses
    function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    },

    // Function called when download errors
    function ( xhr ) {
        console.error( xhr );
        giveUp = true;
    }
  );
}
