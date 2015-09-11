/* global PRIVATE */
/* global Promise */
/* global THREE */

/*
 * This file defines the base class for all characters
 * Including the player, enemies and NPC's
 */

function Character() {
}

// Set properties that should be inherited

Character.prototype.name = null;
// The file with mesh, skeleton, bones, animations, lights...
Character.prototype.modelFile = null;
// Basic attributes
Character.prototype.attributes = {
    strength: 0,
    dexterity: 0,
    stamina: 0
};

// Object containing the main mesh
Character.prototype.mesh = null;
// Generic object for animations
Character.prototype.animations = {};
// This stores the required animations loaded from the model.
// Must abort if could not load all.
Character.prototype.requiredAnimations = [];

// Generic object for bones
Character.prototype.bones = {};
// This stores the required bones loaded from the model.
// Must abort if could not load all.
Character.prototype.requiredBones = [];

// Actually load the model file
Character.prototype.load = function(callback) {
    // Helper for callback function
    var _this = this;

    // Bones assignment
    function assignBones(bones) {
        var i;
        for (i in bones) {
            var bone = bones[i];
            if (!bone) {
                continue;
            }
            _this.bones[bone.name] = bone;
        }
        // Check required bones
        for (i in _this.requiredBones) {
            if (!(_this.requiredBones[i] in _this.bones)) {
                throw 'Could not find bone "' + _this.requiredBones[i] + '" for: ' + _this.name;
            }
        }
    }

    // Animations assignment
    function assignAnimations(animations) {
        var i;
        for (i = 0; i < animations.length; i++) {
            var animation = animations[i];
            if (!animation || typeof(animation.name) !== 'string' || animation.name.length <= 0) {
                continue;
            }
            _this.animations[animation.name] = new THREE.Animation(_this.mesh, animation, THREE.AnimationHandler.CATMULLROM);
            _this.animations[animation.name].loop = false;
            console.info('Loaded animation "' + animation.name + '" to character: ' + _this.name);
        }
        // Check required animations
        for (i in _this.requiredAnimations) {
            if (!(_this.requiredAnimations[i] in _this.animations)) {
                throw 'Could not find animation "' + _this.requiredAnimations[i] + '" for: ' + _this.name;
            }
        }
    }

    // Load model
    var loader = new THREE.JSONLoader();
    loader.load(_this.modelFile, function(geometry, materials) {
        // Set material flag to follow bones
        materials.forEach(function(mat) {
            mat.skinning = true;
        });

        // Create the mesh
        _this.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
        _this.mesh.castShadow = true;
        //_this.mesh.receiveShadow = true;

        // Set up bones and animations
        assignBones(_this.mesh.skeleton.bones);
        assignAnimations(geometry.animations);

        // Signal that we are done
        if (typeof(callback) === 'function') {
            callback(_this.mesh);
        }
    });
};

Character.prototype.update = function() {
    // OK, just must implement on child classes
 };
