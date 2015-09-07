function Level(player) {
    // Create ground
    var geometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100);
    // Texture
    var floorTexture = new THREE.ImageUtils.loadTexture('img/checkers.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(20, 20);
    // Material
    var floorMaterial = new THREE.MeshLambertMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(geometry, floorMaterial);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.receiveShadow = true;

    // Create lights
    this.lights = [
        new THREE.DirectionalLight(0xffffff, 1),
        new THREE.AmbientLight(0x505050),
        new THREE.SpotLight(0xff0000, 20, 60, Math.PI / 2),
        new THREE.SpotLight(0xffff00, 20, 60, Math.PI / 2),
        new THREE.SpotLight(0x00ff00, 20, 60, Math.PI / 2),
        new THREE.SpotLight(0x0000ff, 20, 60, Math.PI / 2)
    ];

    this.lights[0].position.set(100, 200, 100);
    this.lights[2].position.set( 60, 15,  60);
    this.lights[3].position.set( 60, 15, -60);
    this.lights[4].position.set(-60, 15, -60);
    this.lights[5].position.set(-60, 15,  60);

    this.lights[0].shadowMapWidth = 4096;
    this.lights[0].shadowMapHeight = 4096;

    this.lights[0].shadowCameraNear = 190;
    this.lights[0].shadowCameraFar = 300;
    this.lights[0].shadowCameraLeft = -50;//-2;
    this.lights[0].shadowCameraRight = 50;//2;
    this.lights[0].shadowCameraTop = 50;//5;
    this.lights[0].shadowCameraBottom = -50;//-2;
  
    this.lights[0].castShadow = true;
    //this.lights[0].onlyShadow = true;
    this.lights[0].shadowDarkness = 0.8;

    this.lights[0].target = PRIVATE.player.mesh;
    //this.lights[0].shadowCameraVisible = true;
}

Level.prototype.addComponentsToScene = function(scene) {
    var i = 0;
    scene.add(this.mesh);
    for (i = 0; i < this.lights.length; ++i) {
        scene.add(this.lights[i]);
    }
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
};

Level.prototype.animate = function(time, player) {
    
};
