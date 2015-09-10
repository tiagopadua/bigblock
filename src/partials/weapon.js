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
    // ok
}

// Name
Equipment.prototype.name = "null";
// Model file name
Equipment.prototype.modelFile = null;
// Variable to store mesh, once loaded
Equipment.prototype.mesh = null;

// Load the file
Equipment.prototype.load = function(callback) {
    // To help with async functions
    var _this = this;

    // Load model
    var loader = new THREE.JSONLoader();
    loader.load(this.modelFile, function(geometry, materials) {
        // Create the mesh
        _this.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
        _this.mesh.castShadow = true;

        console.info('Loaded weapon', _this.modelFile); 

        // callback
        if (typeof(callback) === 'function') {
            callback(_this);
        }
    });
};


// Base weapon
function Weapon() {
    // ok
}

// Inherit
Weapon.prototype = Object.create(Equipment.prototype);

// Set variables with default values
Weapon.prototype.damage = new Damage(0, 0, 0);
Weapon.prototype.staminaCost = 0;
// Stats requirements - default is none
Weapon.prototype.requirements = {
    strength: 0,
    dexterity: 0,
    intelligence: 0
};
// Damage scaling with player stats - default is none (1x damage)
Weapon.prototype.damageScale = {
    strength: 1
};


// Base shield
function Shield() {
    // ok
}

// Inherit
Shield.prototype = Object.create(Equipment.prototype);

// Set basic parameters
Shield.prototype.stability = 0;

// Example shield for testing
function BasicShield() {
    this.stability = 5;
    this.modelFile = 'models/shield1.json';
}

// Inherit weapon
BasicShield.prototype = Object.create(Weapon.prototype);


// Example weapon for testing
function BigSwordTest() {
    this.damage.physical = 1;
    this.staminaCost = 3;
    this.modelFile = 'models/weapon1.json';
}

// Inherit weapon
BigSwordTest.prototype = Object.create(Weapon.prototype);
