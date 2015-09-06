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
        new THREE.SpotLight(0xff5555, 8, 100, Math.PI / 3),
        new THREE.SpotLight(0xffff55, 8, 100, Math.PI / 3),
        new THREE.SpotLight(0x55ff55, 8, 100, Math.PI / 3),
        new THREE.SpotLight(0x5555ff, 8, 100, Math.PI / 3)
    ];

    this.lights[0].position.set(100, 200, 100);
    this.lights[1].position.set( 50, 15,  50);
    this.lights[2].position.set( 50, 15, -50);
    this.lights[3].position.set(-50, 15, -50);
    this.lights[4].position.set(-50, 15,  50);

    this.lights[0].shadowMapWidth = 4096;
    this.lights[0].shadowMapHeight = 4096;

    this.lights[0].shadowCameraNear = 190;
    this.lights[0].shadowCameraFar = 300;
    this.lights[0].shadowCameraLeft = -50;//-2;
    this.lights[0].shadowCameraRight = 50;//2;
    this.lights[0].shadowCameraTop = 50;//5;
    this.lights[0].shadowCameraBottom = -50;//-2;
  
    this.lights[0].castShadow = true;
    this.lights[0].onlyShadow = true;
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
