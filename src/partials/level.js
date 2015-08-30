function Level(player) {
    // Create ground
    var geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10);
    // Texture
    var floorTexture = new THREE.ImageUtils.loadTexture('img/checkers.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
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
        new THREE.SpotLight(0xff5555, 7, 10, Math.PI / 3),
        new THREE.SpotLight(0xffff55, 7, 10, Math.PI / 3),
        new THREE.SpotLight(0x55ff55, 7, 10, Math.PI / 3),
        new THREE.SpotLight(0x5555ff, 7, 10, Math.PI / 3),
        new THREE.AmbientLight(0x222211)
    ];
    
    window.light = this.lights[0];

    this.lights[0].position.set(5,  2,  5);
    this.lights[1].position.set(5,  2, -5);
    this.lights[2].position.set(-5, 2, -5);
    this.lights[3].position.set(-5, 2,  5);

    //this.lights[0].target = this.lights[1].target = this.lights[2].target = this.lights[3].target = player.mesh;

    this.lights[0].shadowMapWidth = this.lights[1].shadowMapWidth = this.lights[2].shadowMapWidth = this.lights[3].shadowMapWidth = 1024;
    this.lights[0].shadowMapHeight = this.lights[1].shadowMapHeight = this.lights[2].shadowMapHeight = this.lights[3].shadowMapHeight = 1024;

    this.lights[0].shadowCameraNear = this.lights[1].shadowCameraNear = this.lights[2].shadowCameraNear = this.lights[3].shadowCameraNear = 0.001;
    this.lights[0].shadowCameraFar = this.lights[1].shadowCameraFar = this.lights[2].shadowCameraFar = this.lights[3].shadowCameraFar = 20;
    this.lights[0].shadowCameraFov = this.lights[1].shadowCameraFov = this.lights[2].shadowCameraFov = this.lights[3].shadowCameraFov = 90;
    
    this.lights[0].castShadow = this.lights[1].castShadow = this.lights[2].castShadow = this.lights[3].castShadow = true;
    this.lights[0].shadowDarkness = this.lights[1].shadowDarkness = this.lights[2].shadowDarkness = this.lights[3].shadowDarkness = 0.5;
    
    //this.lights[0].shadowCameraVisible = this.lights[1].shadowCameraVisible = this.lights[2].shadowCameraVisible = this.lights[3].shadowCameraVisible = true;
}

Level.prototype.addComponentsToScene = function(scene) {
    var i = 0;
    scene.add(this.mesh);
    for (i = 0; i < this.lights.length; ++i) {
        scene.add(this.lights[i]);
    }
    scene.fog = new THREE.FogExp2(0x000000, 0.12);
};

Level.prototype.animate = function(time, player) {
    
};
