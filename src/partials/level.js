/* global FirstEnemy */

/*
 * Level loading
 */

function Level() {
}

// Set level properties
Level.prototype.enemies = [];
Level.prototype.meshes = [];
Level.prototype.lights = [];

Level.prototype.load = function() {
    // Helper for callback function
    var _this = this;

    function loadEnemies() {
        return new Promise(function(resolve, reject) {
            var e = new FirstEnemy();
            e.load().then(function(mesh) {
                mesh.position.set(10, 0, -30);
                _this.enemies.push(e);
                resolve(e);
            }).catch(function(error) {
                console.error('Could not load enemy');
                reject(error);
            });
        });
    }

    function loadLevel() {
        return new Promise(function(resolve, reject) {
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
            var floorMesh = new THREE.Mesh(geometry, floorMaterial);
            floorMesh.rotation.x = Math.PI / 2;
            floorMesh.receiveShadow = true;
            _this.meshes.push(floorMesh);
        
            // Create lights
            _this.lights = [
                new THREE.DirectionalLight(0xffffff, 1),
                new THREE.AmbientLight(0xa0a0a0),
                new THREE.SpotLight(0xff0000, 20, 60, Math.PI / 2),
                new THREE.SpotLight(0xffff00, 20, 60, Math.PI / 2),
                new THREE.SpotLight(0x00ff00, 20, 60, Math.PI / 2),
                new THREE.SpotLight(0x0000ff, 20, 60, Math.PI / 2)
            ];
        
            _this.lights[0].position.set(100, 200, 100);
            _this.lights[2].position.set( 60, 15,  60);
            _this.lights[3].position.set( 60, 15, -60);
            _this.lights[4].position.set(-60, 15, -60);
            _this.lights[5].position.set(-60, 15,  60);
        
            _this.lights[0].shadowMapWidth = 4096;
            _this.lights[0].shadowMapHeight = 4096;
        
            _this.lights[0].shadowCameraNear = 190;
            _this.lights[0].shadowCameraFar = 300;
            _this.lights[0].shadowCameraLeft = -50;//-2;
            _this.lights[0].shadowCameraRight = 50;//2;
            _this.lights[0].shadowCameraTop = 50;//5;
            _this.lights[0].shadowCameraBottom = -50;//-2;
        
            _this.lights[0].castShadow = true;
            //this.lights[0].onlyShadow = true;
            _this.lights[0].shadowDarkness = 0.8;

            //_this.lights[0].target = PRIVATE.player.mesh;
            //this.lights[0].shadowCameraVisible = true;
            resolve();
        });
    }

    return Promise.all([
        loadLevel(),
        loadEnemies()
    ]);
};

// Add everything to the scene
Level.prototype.addComponentsToScene = function(scene) {
    var i;

    // Add meshes
    for (i = 0; i < this.meshes.length; ++i) {
        scene.add(this.meshes[i]);
    }

    // Add all lights
    for (i = 0; i < this.lights.length; ++i) {
        scene.add(this.lights[i]);
    }

    // Add all enemies
    for (i = 0; i < this.enemies.length; ++i) {
        scene.add(this.enemies[i].mesh);
    }

    // Global fog
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
};

Level.prototype.update = function(time) {
    var enemyIndex;
    for (enemyIndex in this.enemies) {
        this.enemies[enemyIndex].update(time);
    }
};
