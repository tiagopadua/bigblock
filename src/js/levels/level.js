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
    var self = this;

    function loadSingleEnemy(enemyClass, enemyX, enemyY, enemyZ) {
        return new Promise(function(resolve, reject) {
            if (!PRIVATE.availableEnemies.hasOwnProperty(enemyClass) ||
                typeof PRIVATE.availableEnemies[enemyClass] !== 'function') {
                
                return reject('Could not load enemy. Class not found: ' + enemyClass);
            }
            var e = new PRIVATE.availableEnemies[enemyClass]();
            e.load().then(function(resources) {
                // Character passes the mesh on position 0
                var mesh = resources[0];
                mesh.position.set(enemyX, enemyY, enemyZ);
                self.enemies.push(e);
                resolve(e);
            }).catch(function(error) {
                console.error('Could not load enemy');
                reject(error);
            });
        });
    }

    var loadLevelPromise = new Promise(function(resolve, reject) {
        /*
        // Create ground
        var geometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100);
        // Texture
        var loadingItem = PRIVATE.addLoadingItem('../resources/textures/ground1.jpg');
        var floorTexture = new THREE.ImageUtils.loadTexture('../resources/textures/ground1.jpg');//img/checkers.png');
        loadingItem.setDone();
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
*/
        // Add ground triangles
        self.groundTriangles = [
            new THREE.Triangle(new THREE.Vector3(-50, 0, -50),
                                new THREE.Vector3(-50, 0, 50),
                                new THREE.Vector3(50, 0, 50)),
            new THREE.Triangle(new THREE.Vector3(-50, 0, -50),
                                new THREE.Vector3(50, 0, -50),
                                new THREE.Vector3(50, 0, 50))
        ];

        // Create lights
        self.lights = [
            new THREE.DirectionalLight(0xffffff, 1),
            new THREE.AmbientLight(0xa0a0a0),
            new THREE.SpotLight(0xff0000, 20, 60, Math.PI / 2),
            new THREE.SpotLight(0xffff00, 20, 60, Math.PI / 2),
            new THREE.SpotLight(0x00ff00, 20, 60, Math.PI / 2),
            new THREE.SpotLight(0x0000ff, 20, 60, Math.PI / 2)
        ];
    
        self.lights[0].position.set(100, 200, 100);
        self.lights[2].position.set( 60, 15,  60);
        self.lights[3].position.set( 60, 15, -60);
        self.lights[4].position.set(-60, 15, -60);
        self.lights[5].position.set(-60, 15,  60);
    
        self.lights[0].shadowMapWidth = 4096;
        self.lights[0].shadowMapHeight = 4096;
    
        self.lights[0].shadowCameraNear = 190;
        self.lights[0].shadowCameraFar = 300;
        self.lights[0].shadowCameraLeft = -50;//-2;
        self.lights[0].shadowCameraRight = 50;//2;
        self.lights[0].shadowCameraTop = 50;//5;
        self.lights[0].shadowCameraBottom = -50;//-2;
    
        self.lights[0].castShadow = true;
        //this.lights[0].onlyShadow = true;
        self.lights[0].shadowDarkness = 0.8;

        //_this.lights[0].target = PRIVATE.player.mesh;
        //this.lights[0].shadowCameraVisible = true;
        resolve();
    });

    // Loads sounds
    var loadSoundsPromise = new Promise(function(resolve, reject) {
        PRIVATE.loadSound('music', '../resources/audio/music/future-electronic-drum-and-synth-loop-with-cymbal-96-bpm_My9NvCVd.mp3')
        .then(function() {
            PRIVATE.setMainMusic('music');
            return resolve();
        })
        .catch(function(e) {
            return reject(e);
        });
    });

    return loadJsonFile('levels/testLevel.json').then(function (jsonLevel) {
        if (!jsonLevel ||
            !jsonLevel.hasOwnProperty('models') ||
            !jsonLevel.models ||
            jsonLevel.models.length <= 0) {

            return Promise.reject('Unable to load test level. Invalid format');
        }

        // Load Three.js model
        var loader = new THREE.JSONLoader();
        var loadedModel = loader.parse(jsonLevel.models[0]);
        self.meshes.push(new THREE.Mesh(loadedModel.geometry, new THREE.MeshFaceMaterial(loadedModel.materials)));
        
        var loadEnemyPromises = [];
        if (jsonLevel.hasOwnProperty('enemies') &&
            jsonLevel.enemies instanceof Array) {
            
            jsonLevel.enemies.forEach(function (jsonEnemy) {
                if (!jsonEnemy ||
                    !jsonEnemy.class ||
                    !jsonEnemy.position ||
                    !(jsonEnemy.position instanceof Array) ||
                    jsonEnemy.position.length < 3) {

                    return;
                }
                loadEnemyPromises.push(loadSingleEnemy(
                    jsonEnemy.class,
                    jsonEnemy.position[0],
                    jsonEnemy.position[1],
                    jsonEnemy.position[2]));
            });
        }

        return Promise.all([
            loadLevelPromise,
            Promise.all(loadEnemyPromises),
            loadSoundsPromise
        ]);
    });
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
    scene.fog = new THREE.FogExp2(0x550000, 0.02);
};

// Intended to run every frame, to animate everything
Level.prototype.update = function(time) {
    var enemyIndex;
    for (enemyIndex in this.enemies) {
        this.enemies[enemyIndex].update(time);
    }
};

// Remove killed enemy
Level.prototype.killEnemy = function(enemy){
    if (!enemy) {
        return;
    }

    // Remove from scene
    PRIVATE.scene.remove(enemy.mesh);
    // Remove from our list
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
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
            return triangle;
        }
    }
    return false; 
};
