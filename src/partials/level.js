function Level() {
    var geometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1);
    var floorTexture = new THREE.ImageUtils.loadTexture('img/checkers.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    var floorMaterial = new THREE.MeshLambertMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(geometry, floorMaterial);
    this.mesh.rotation.x = Math.PI / 2;
    this.lights = [
        new THREE.PointLight(0xff5555, 1, 10),
        new THREE.PointLight(0xffff55, 1, 10),
        new THREE.PointLight(0x55ff55, 1, 10),
        new THREE.PointLight(0x5555ff, 1, 10)
    ];
    this.lights[0].position.set(5,  2,  5);
    this.lights[1].position.set(5,  2, -5);
    this.lights[2].position.set(-5, 2, -5);
    this.lights[3].position.set(-5, 2,  5);
}

Level.prototype.addComponentsToScene = function(scene) {
    var i = 0;
    scene.add(this.mesh);
    for (i = 0; i < this.lights.length; ++i) {
        scene.add(this.lights[i]);
    }
    scene.fog = new THREE.FogExp2(0x000000, 0.12);
};
