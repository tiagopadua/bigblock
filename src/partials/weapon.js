/*
 * This file defines weapon objects with all its properties
 * And special actions if needed
 */

// Damage object definition
function Damage(dPhysical, dElectric, dFire) {
    // Set different types of damage
    this.physical = 0;
    this.electric = 0;
    this.fire = 0;
}

// Base class to load model
function Equipment() {
    this.name = "null";

    // Model
    this.modelFile = null;
    this.mesh = null; // To store the loaded mesh
}

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
    // Set the damage object
    this.damage = new Damage(0, 0, 0);
    this.staminaCost = 0;

    // Stats requirements
    // Default is none
    this.requirements = {
        strength: 0,
        dexterity: 0,
        intelligence: 0
    };

    // Damage scaling with player stats
    // Default is none (1x damage)
    this.damageScale = {
        strength: 1
    };
}

// Inherit
Weapon.prototype = new Equipment();


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
BasicShield.prototype = new Weapon();


// Example weapon for testing
function BigSwordTest() {
    this.damage.physical = 1;
    this.staminaCost = 3;
    this.modelFile = 'models/weapon1.json';
}

// Inherit weapon
BigSwordTest.prototype = new Weapon();
