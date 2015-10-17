/* global PRIVATE */
/* global Promise */
/* global THREE */

/*
 * This file defines the base class for all characters
 * Including the player, enemies and NPC's
 */

function Character() {
    // Set properties

    this.name = null;
    // The file with mesh, skeleton, bones, animations, lights...
    this.modelFile = null;
    // Basic attributes
    this.attributes = {
        health: 0,
        stamina: 0,
        staminaRecoverySpeed: 0,
        strength: 0,
        dexterity: 0
    };
    // Current attributes values (with buffs/debuffs etc)
    this.currentAttributes = {
        health: 0,
        stamina: 0,
        staminaRecoverySpeed: 0,
        strength: 0,
        dexterity: 0
    };

    // Object containing the main mesh
    this.mesh = null;
    // Mesh for collision detection
    this.collisionMesh = null;
    // Generic object for animations
    this.animations = {};
    // This stores the required animations loaded from the model.
    // Must abort if could not load all.
    this.requiredAnimations = [];

    // Generic object for bones
    this.bones = {};
    // This stores the required bones loaded from the model.
    // Must abort if could not load all.
    this.requiredBones = [];

    // Sounds needed to play
    this.requiredSounds = {};
}

// Actually load the model file
Character.prototype.load = function() {
    var promises = this.loadSounds();
    promises.unshift(this.loadMesh());
    return Promise.all(promises);
};

// Loads only the mesh
Character.prototype.loadMesh = function() {
    // Helper for callback function
    var _this = this;

    return new Promise(function(resolve, reject) {
        // Bones assignment
        function assignBones(bones) {
            if (!bones) {
                return;
            }

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
            if (!animations) {
                return;
            }
            var i;
            for (i = 0; i < animations.length; i++) {
                var animation = animations[i];
                if (!animation || typeof(animation.name) !== 'string' || animation.name.length <= 0) {
                    continue;
                }
                _this.animations[animation.name] = new THREE.Animation(_this.mesh, animation);
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

        var loadingItem = PRIVATE.addLoadingItem(_this.modelFile);

        try {
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
                // Copy the mesh
                // TODO: read different mesh
                _this.collisionMesh = _this.mesh;

                // Set up bones and animations
                assignBones(_this.mesh.skeleton.bones);
                assignAnimations(geometry.animations);

                // Signal that we are done
                loadingItem.setDone();
                resolve(_this.mesh);
            });
        } catch (error) {
            console.error('Unable to load model:', _this.modelFile);
            loadingItem.setError();
            reject(error);
        }
    });
};

// Loads all sounds
Character.prototype.loadSounds = function() {
    var promises = [];
    for (var soundName in this.requiredSounds) {
        if (!this.requiredSounds.hasOwnProperty(soundName)) {
            continue;
        }

        promises.push(PRIVATE.loadSound(soundName, this.requiredSounds[soundName]));
    }
    return promises;
};

// Just add mesh to scene
Character.prototype.addComponentsToScene = function(scene) {
    if (!scene) {
        return;
    }

    scene.add(this.mesh);
};

// Create focus element
Character.prototype.setFocus = function() {
    if (this.focus) {
        if (!(this.focus in this.mesh.children)) {
            this.mesh.add(this.focus);
        }
        return;
    }

    var material = new THREE.SpriteMaterial({
        map: PRIVATE.focusTexture,
        color: 0xffffff,
        fog: true,
        depthTest: false
    });
    this.focus = new THREE.Sprite(material);
    this.focus.position.set(0, 3, 0);
    this.mesh.add(this.focus);
};

// Remove the focus
Character.prototype.removeFocus = function() {
    this.mesh.remove(this.focus);
};

// Check for collision
Character.prototype.collided = function(rayCasters) {
    for (var rayIndex = 0; rayIndex < rayCasters.length; rayIndex++) {
        var caster = rayCasters[rayIndex];
        var intersections = caster.intersectObject(this.collisionMesh);
        if (intersections.length > 0) {
            return true;
        }
    }
    // No collisions detected
    return false;
};

Character.prototype.update = function() {
    // OK, just must implement on child classes
};

// Change health
Character.prototype.addHealth = function(amount) {
    this.currentAttributes.health += amount;
    // Check if died
    if (this.currentAttributes.health < 0) {
        this.currentAttributes.health = 0;
        this.die();
    } else if (this.currentAttributes.health > this.attributes.health) {
        // Cannot have more health than max pool
        this.currentAttributes.health = this.attributes.health;
    }
};

// Change stamina
Character.prototype.addStamina = function(amount) {
    this.currentAttributes.stamina = Math.max(0, Math.min(this.attributes.stamina, this.currentAttributes.stamina + amount));
    return this.currentAttributes.stamina;
};

// Recover stamina
Character.prototype.recoverStamina = function(timeElapsed) {
    // Do NOT call 'addStamina' because Player overrides it and updates the HUD.
    // It may generate too many unnecessary updates
    var amount = timeElapsed * this.currentAttributes.staminaRecoverySpeed;
    this.currentAttributes.stamina = Math.max(0, Math.min(this.attributes.stamina, this.currentAttributes.stamina + amount));
};

// Stuff to do when it dies
Character.prototype.die = function() {
    console.warn('DEAD!');
};
