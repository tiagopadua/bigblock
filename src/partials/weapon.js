/*
 * This file defines weapon objects with all its properties
 * And special actions if needed
 */

// Damage object definition
function Damage(dPhysical, dElectric, dFire) {
}
// Set different types of damage
Damage.prototype.physical = 0;
Damage.prototype.electric = 0;
Damage.prototype.fire = 0;


// Base class to load model
function Equipment() {
    // Name
    this.name = 'Generic equipment';
    // Model file name
    this.modelFile = null;
    // Variable to store mesh, once loaded
    this.mesh = null;
}

// Load the file
Equipment.prototype.load = function() {
    // To help with async functions
    var _this = this;

    return new Promise(function(resolve, reject) {
        // Load model
        var loader = new THREE.JSONLoader();
        try {
            loader.load(_this.modelFile, function(geometry, materials) {
                // Create the mesh
                _this.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                _this.mesh.castShadow = true;

                console.info('Loaded equipment', _this.modelFile); 

                // Signal everything went OK
                resolve(_this);
            });
        } catch (error) {
            console.error('Unable to load equipment:', error);
            reject(error);
        }
    });
};


// Base weapon
function Weapon() {
    // Set variables with default values
    this.damage = new Damage(0, 0, 0);
    this.staminaCost = 0;
    this.collisionRays = [];

    // Stats requirements - default is none
    this.requirements = {
        strength: 0,
        dexterity: 0,
        intelligence: 0
    };

    // Damage scaling with player stats - default is none (1x damage)
    this.damageScale = {
        strength: 1
    };
}

// Inherit
Weapon.prototype = new Equipment();

// Return collision rays adapted to the world
Weapon.prototype.getCollisionRays = function() {
    // TODO: improve algorithm
    var rayCasters = [];
    for (var rayId = 0; rayId < this.collisionRays.length; rayId++) {
        var caster = this.collisionRays[rayId];

        var newRayCaster = new THREE.Raycaster();
        newRayCaster.near = caster.near;
        newRayCaster.far = caster.far;
        newRayCaster.ray = caster.ray.clone();
        // Apply offset/rotation/scale
        newRayCaster.ray.applyMatrix4(this.mesh.matrixWorld);

        // Add to the list
        rayCasters.push(newRayCaster);
    }
    return rayCasters;
};

// Override load method for weapon specialized format
Weapon.prototype.load = function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
        loadJsonFile(_this.modelFile).then(function(parsedObject) {
            if (!parsedObject || !('name' in parsedObject) || !('collisionRays' in parsedObject) || !('model' in parsedObject)) {
                return reject('Invalid weapon file format:', _this.modelFile);
            }
            
            try {
                _this.name = parsedObject.name;
                _this.collisionRays = [];
                for (var rayIndex = 0; rayIndex < parsedObject.collisionRays.length; rayIndex++) {
                    var rayData = parsedObject.collisionRays[rayIndex];
                    var rayOrigin = new THREE.Vector3(rayData.origin[0],
                                                      rayData.origin[1],
                                                      rayData.origin[2]);
                    var rayDirection = new THREE.Vector3(rayData.direction[0],
                                                         rayData.direction[1],
                                                         rayData.direction[2]);
                    rayDirection.normalize();
                    var rayCaster = new THREE.Raycaster(rayOrigin, rayDirection, 0, rayData.length);
                    _this.collisionRays.push(rayCaster);
                }

                // Load Three.js model
                var loader = new THREE.JSONLoader();
                var loadedModel = loader.parse(parsedObject.model);

                // Create the mesh
                _this.mesh = new THREE.SkinnedMesh(loadedModel.geometry, new THREE.MeshFaceMaterial(loadedModel.materials));
                _this.mesh.castShadow = true;
            } catch(error) {
                return reject(error);
            }

            console.info('Loaded weapon', _this.modelFile); 

            return resolve(_this);
        }).catch(function(error) {
            return reject(error);
        });
    });
};

// Base shield
function Shield() {
    // Set basic parameters
    this.stability = 0;
}

// Inherit
Shield.prototype = new Equipment();

// Example shield for testing
function BasicShield() {
    this.stability = 5;
    this.modelFile = 'models/shield1.json';
}

// Inherit weapon
BasicShield.prototype = new Shield();


// Example weapon for testing
function BigSwordTest() {
    this.damage.physical = 1;
    this.staminaCost = 3;
    this.modelFile = 'models/weapon1.json';
}

// Inherit weapon
BigSwordTest.prototype = new Weapon();
