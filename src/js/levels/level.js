/* global FirstEnemy */

/*
 * Level loading
 */

function Level() {
    // Set level properties
    this.enemies = [];
    this.objectMeshes = [];
    this.groundMeshes = [];
    this.lights = [];
}

// Load everything for a level: meshes, lights, enemies
Level.prototype.load = function(levelFile) {
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

    return loadJsonFile(levelFile).then(function (jsonLevel) {
        if (!jsonLevel ||
            !jsonLevel.grounds ||
            jsonLevel.grounds.length <= 0) {

            return Promise.reject('Unable to load test level. Invalid format');
        }

        // Global fog
        if (jsonLevel.fog &&
            typeof jsonLevel.fog.color === 'number' &&
            typeof jsonLevel.fog.near === 'number' &&
            typeof jsonLevel.fog.far === 'number') {

            PRIVATE.scene.fog = new THREE.Fog(jsonLevel.fog.color,
                                              jsonLevel.fog.near,
                                              jsonLevel.fog.far);
        }

        // Load Three.js model
        var loader = new THREE.JSONLoader();
        jsonLevel.grounds.forEach(function (groundModel) {
            var parsedModel = loader.parse(groundModel);
            var groundMesh = new THREE.Mesh(parsedModel.geometry, new THREE.MeshFaceMaterial(parsedModel.materials));
            groundMesh.receiveShadow = true;
            self.groundMeshes.push(groundMesh);
        });
        
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
    // Add meshes
    this.groundMeshes.forEach(function (mesh) {
        scene.add(mesh);
    });
    this.objectMeshes.forEach(function (mesh) {
        scene.add(mesh);
    });

    // Add all lights
    this.lights.forEach(function (light) {
        scene.add(light);
    });

    // Add all enemies
    this.enemies.forEach(function (enemy) {
        scene.add(enemy.mesh);
    });
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
