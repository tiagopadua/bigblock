/* global FirstEnemy */

/*
 * Level loading
 */

function Level() {
    // Set level properties
    this.enemies = [];
    this.meshes = [];
    this.lights = [];
    // To check player Y coord, or if he fell from a cliff
    this.groundTriangles = [];
}

// Load everything for a level: meshes, lights, enemies
Level.prototype.load = function() {
    // Helper for callback function
    var _this = this;

    function loadSingleEnemy(enemyX, enemyY, enemyZ) {
        return new Promise(function(resolve, reject) {
            var e = new FirstEnemy();
            e.load().then(function(mesh) {
                mesh.position.set(enemyX, enemyY, enemyZ);
                mesh.material.materials[0].color.r = 0.2 + Math.random() * 0.8;
                mesh.material.materials[0].color.g = 0.2 + Math.random() * 0.8;
                mesh.material.materials[0].color.b = 0.2 + Math.random() * 0.8;
                _this.enemies.push(e);
                resolve(e);
            }).catch(function(error) {
                console.error('Could not load enemy');
                reject(error);
            });
        });
    }

    function loadEnemies() {
        return Promise.all([
            loadSingleEnemy(10, 0, -26),
            loadSingleEnemy(15, 0, -30),
            loadSingleEnemy(5, 0, -30),
            loadSingleEnemy(12, 0, -20),
            loadSingleEnemy(17, 0, -24)
        ]);
    }

    function loadLevel() {
        // TODO: read from file
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

            // Add ground triangles
            _this.groundTriangles = [
                new THREE.Triangle(new THREE.Vector3(-50, 0, -50),
                                   new THREE.Vector3(-50, 0, 50),
                                   new THREE.Vector3(50, 0, 50)),
                new THREE.Triangle(new THREE.Vector3(-50, 0, -50),
                                   new THREE.Vector3(50, 0, -50),
                                   new THREE.Vector3(50, 0, 50))
            ];

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

// Intended to run every frame, to animate everything
Level.prototype.update = function(time) {
    var enemyIndex;
    for (enemyIndex in this.enemies) {
        this.enemies[enemyIndex].update(time);
    }
};

// Checks if point is over the ground
Level.prototype.isOverGround = function(point) {
    var i;
    // Consider only X and Z
    var point2d = { x: point.x,
                    y: point.z };
    for (i = 0; i < this.groundTriangles.length; i++) {
        var triangle = this.groundTriangles[i];
        if (isPointInsideTriangle(point2d,
                                  { x: triangle.a.x,
                                    y: triangle.a.z },
                                  { x: triangle.b.x,
                                    y: triangle.b.z },
                                  { x: triangle.c.x,
                                    y: triangle.c.z })) {
            return true;    
        }
    }
    return false; 
};
