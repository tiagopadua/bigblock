/* global searchFocus */
/* global Character */
/* global PRIVATE */
/* global Promise */
/* global THREE */

function Player() {
    // TODO: load from save file
    this.name = 'player';
    this.modelFile = 'models/player.json';

    // Helper object to make movement
    this.moveTarget = new THREE.Object3D();
    this.moveTargetTarget = new THREE.Object3D();

    // Maximum distance to put a target in focus
    // The value is SQUARED, to make calculations less intense
    this.maxFocusDistanceSquared = 900; // sqrt(900) = 30

    // Constants for movement
    this.turnSpeed = 3; // radians/time - This must be tuned
    this.walkSpeed = 10; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
    this.turnInfluenceOnCamera = 0.3; // The walk/turn for the camera to follow the character

    this.moveTiltFactor = 0.15;

    // Initial weapons
    this.equipmentRight = null;
    this.equipmentLeft = null;

    // Set up initial stats
    // TODO: load from save-file
    this.attributes.health               = 10;
    this.attributes.stamina              = 5;
    this.attributes.staminaRecoverySpeed = 0.001; // unit / second
    this.attributes.staminaRunDrain      = 0.002; // unit / second
    this.attributes.strength             = 5;
    this.attributes.dexterity            = 5;
    // --- and load these from attributes on armor/power-ups
    this.currentAttributes.healthTotal          = 10;
    this.currentAttributes.health               = 10;
    this.currentAttributes.staminaTotal         = 5;
    this.currentAttributes.stamina              = 5;
    this.currentAttributes.staminaRecoverySpeed = 1.0; // unit / second
    this.currentAttributes.staminaRunDrain      = 1.8; // unit / second
    this.currentAttributes.strength             = 5;
    this.currentAttributes.dexterity            = 5;

    // Animations that MUST HAVE to run
    this.requiredAnimations = [ 'Yes', 'No', 'AttackRight1' ];
    this.requiredBones = [ 'HandRight', 'HandLeft' ];
    this.requiredSounds = {
        grunt: '../resources/audio/sfx/grunt-2_zJ3EwGE_.mp3',
        hit: '../resources/audio/sfx/hit-solid_M175G3Vu.mp3'
    };

    // Focus target
    this.focus = null;

    // Auxiliar variables to control fall
    this.groundRaycaster = new THREE.Raycaster(
        new THREE.Vector3(0, 4, 0), // must be updated on each loop
        new THREE.Vector3(0, -1, 0) // Pointing down
    );
    
    // For camera movement 'smoothing'
    this.lerping = false;
    this.lerpDuration = 0.4; // seconds
    this.lerpTimeElapsed = 0;
    this.lerpStartVector = null; // This is the Vector3 start position for lerp
    
    // Weapon collision detection distance. The enemy must be at this distance to check for hit
    this.weaponHitMinDistanceSq = 100; // Value squared
    // Flag to indicate blocking animation
    this.isAttacking = false;
    this.wasAttacking = false; // To check if attacking ended
    // Stores which weapon is attacking
    this.attackingWeapon = null;
    // Stores attacking animation to check if it ended
    this.attackingAnimation = null;
    // List of enemies to check for hit with weapon attack
    this.enemyHitList = [];
}

// Inherit from Character
Player.prototype = new Character();

// Simply attach equipment to RIGHT hand
Player.prototype.attachEquipmentRight = function(equipment) {
    if (!equipment || !this.bones.HandRight) {
        return;
    }

    if (this.bones.HandRight) {
        this.bones.HandRight.add(equipment.mesh);
        this.equipmentRight = equipment;
    }
};

// Simply attach equipment to LEFT hand
Player.prototype.attachEquipmentLeft = function(equipment) {
    if (!equipment || !this.bones.HandLeft) {
        return;
    }

    if (this.bones.HandLeft) {
        this.bones.HandLeft.add(equipment.mesh);
        this.equipmentLeft = equipment;
    }
};

// Decide which target the camera should follow
Player.prototype.getCameraTarget = function() {
    return this.moveTarget;
};

// Set focus and prepare things related
Player.prototype.setFocus = function(newFocus) {
    if (!newFocus) {
        return;
    }
    if (this.focus) {
        this.focus.removeFocus();
    }
    this.focus = newFocus;
    this.focus.setFocus();

    // Now set the target's target initial position (final position is already focus')
    if (this.lerping) {
        this.lerpStartVector = this.moveTargetTarget.position.clone();
    } else {
        this.lerping = true;
        this.moveTargetTarget.position.set(0, 0, -2); // 2 units ahead of target
        this.moveTargetTarget.position.applyMatrix4(this.moveTarget.matrix);//PRIVATE.camera.matrixWorld);
        this.lerpStartVector = this.moveTargetTarget.position.clone();
    }
    this.lerpTimeElapsed = 0;
};

// Remove focus and things related
Player.prototype.clearFocus = function() {
    if (this.focus) {
        this.focus.removeFocus();
    }
    this.focus = null; // remove focus
    this.lerping = false; // only lerp with focus
};

// Sets up everything for weapon swing
Player.prototype.startSwing = function(weapon, animation) {
    // check if is already playing
    if (animation.isPlaying) {
        return;
    }

    // Check if we have the stamina
    if (this.currentAttributes.stamina < weapon.staminaCost) {
        // TODO: blink the stamina bar
        return;
    }
    // Remove the needed stamina
    this.addStamina(-weapon.staminaCost);

    // Start animation
    animation.play();
    // Start sound
    PRIVATE.playSound('grunt');
    
    // Save the attacking weapon and animation
    this.attackingWeapon = weapon;
    this.attackingAnimation = animation;
    // Set up enemies to check collision
    this.enemyHitList = [];
    for (var enemyId = 0; enemyId < PRIVATE.currentLevel.enemies.length; enemyId++) {
        var enemy = PRIVATE.currentLevel.enemies[enemyId];
        // Compare the distance between player and enemy: length of the vector (player.position - enemy.position)
        if (this.mesh.position.clone().sub(enemy.mesh.position).lengthSq() < this.weaponHitMinDistanceSq) {
            this.enemyHitList.push(enemy);
        }
    }
    // Set flag for blocking animation
    this.isAttacking = true;
};

Player.prototype.finishSwing = function() {
    // Reset enemy list
    this.enemyHitList = [];
    // Set flag for blocking animation
    this.isAttacking = false;
};

// Check for weapon hit
Player.prototype.checkWeaponHit = function() {
    for (var enemyId = 0; enemyId < this.enemyHitList.length; enemyId++) {
        var enemy = this.enemyHitList[enemyId];
        if (enemy.collided(this.attackingWeapon.getCollisionRays())) {
            PRIVATE.playSound('hit');
            this.enemyHitList.splice(enemyId, 1);
            PRIVATE.currentLevel.killEnemy(enemy);
        }
    }
};

// Intended to be called each frame
Player.prototype.update = function(time) {
    // Set speeds
    var frameTurnSpeed = this.turnSpeed * time;
    var frameWalkSpeed = this.walkSpeed * time;
    var moveTiltAngle = PRIVATE.control.movement.deadLength * this.moveTiltFactor;
    var turnForCamera = PRIVATE.control.movement.x * this.turnInfluenceOnCamera;

    // Check focus
    if (PRIVATE.control.focus.changed && PRIVATE.control.focus.pressed) {
        if (this.focus) {
            this.clearFocus();
        } else {
            this.setFocus(searchFocus());
        }
    }
    // Now check if distance of focus is enough
    if (this.focus && (this.mesh.position.distanceToSquared(this.focus.mesh.position) > this.maxFocusDistanceSquared)) {
        this.clearFocus();
    }

    // Recover the stamina for this frame (YES, even if we are running)
    this.recoverStamina(time);

    // Check generic animations
    // "No"
    if (PRIVATE.control.leftAttack.pressed && PRIVATE.control.leftAttack.changed) {
        if (!this.animations.No.isPlaying) {
            this.animations.No.play();
        }
    }
    // "Yes"
    if (PRIVATE.control.leftAttackStrong.pressed && PRIVATE.control.leftAttackStrong.changed) {
        if (!this.animations.Yes.isPlaying) {
            this.animations.Yes.play();
        }
    }
    // "Attack right 1"
    if (PRIVATE.control.rightAttack.pressed && PRIVATE.control.rightAttack.changed) {
        this.startSwing(this.equipmentRight, this.animations.AttackRight1);
    }

    // Check for attack swings
    if (this.isAttacking) {
        if (this.attackingAnimation.isPlaying) {
            // Not finished, so check for collision
            this.checkWeaponHit();
        } else {
            // Finished attack
            this.finishSwing();
        }
    } else { // Attacks are BLOCKING ACTIONS
        // Check if we should RUN
        var staminaDrainAmount = time * this.currentAttributes.staminaRunDrain;
        if (PRIVATE.control.run.pressed) {
            if (this.currentAttributes.stamina >= staminaDrainAmount && !this.runStaminaRecovering) {
                frameWalkSpeed *= this.runSpeedRatio;
                moveTiltAngle *= this.runSpeedRatio;
                turnForCamera *= this.runSpeedRatio;
    
                // Do NOT call 'addStamina' because it and updates the HUD - and will
                //  generate too many unnecessary updates to DOM
                this.currentAttributes.stamina = Math.max(0, Math.min(this.attributes.stamina, this.currentAttributes.stamina - staminaDrainAmount));
            } else {
                this.runStaminaRecovering = !PRIVATE.control.run.changed && this.currentAttributes.stamina < this.currentAttributes.staminaTotal;
            }
        }
    }

    // Set focus rotation/movement
    if (this.focus) {
        var lerpPercentage;
        if (this.lerping) {
            this.lerpTimeElapsed += time;
            lerpPercentage = this.lerpTimeElapsed / this.lerpDuration; // Duration should never be 0 (we set it manually)
            if (lerpPercentage >= 1) {
                this.lerping = false;
            }
        }
        // ...still lerping after percentage calculation
        if (this.lerping) {
            this.moveTargetTarget.position.lerpVectors(this.lerpStartVector, this.focus.mesh.position, lerpPercentage);
            this.moveTarget.lookAt(this.moveTargetTarget.position);
        } else {
            this.moveTarget.lookAt(this.focus.mesh.position);
        }
        this.moveTarget.rotateY(Math.PI); // rotate 180deg for the camera
        this.mesh.lookAt(this.focus.mesh.position);

        // Check target changing
        if (PRIVATE.control.cameraMovement.changedX && !this.isAttacking) {
            var newFocus = null;
            if (PRIVATE.control.cameraMovement.x > 0) {
                newFocus = searchNextFocus(true);
            } else if (PRIVATE.control.cameraMovement.x < 0) {
                newFocus = searchNextFocus(false);
            }
            // Set the new focus target
            this.setFocus(newFocus);
        }
    } else {
        // Make rotation - always based on the camera
        this.moveTarget.rotateY(-frameTurnSpeed * (PRIVATE.control.cameraMovement.x + turnForCamera));
    }

    // If we don't have movement, just ignore calculations
    if ((PRIVATE.control.movement.x === 0 && PRIVATE.control.movement.y === 0) || this.isAttacking) {
        this.bones.Base.rotation.x = Math.HALFPI;
        this.bones.Top.rotation.x = 0;
        return;
    }

    // Add tilt movement
    this.bones.Base.rotation.x = Math.HALFPI + moveTiltAngle;
    this.bones.Top.rotation.x = -moveTiltAngle/2;

    // Make movement
    this.moveTarget.translateZ(frameWalkSpeed * PRIVATE.control.movement.y);
    this.moveTarget.translateX(frameWalkSpeed * PRIVATE.control.movement.x);
    
    // Checks if is falling
    this.updateFallingStatus();

    // Set rotation
    if (!this.focus) {
        this.mesh.lookAt(this.moveTarget.position);
    }

    // Set final position
    this.mesh.position.set(this.moveTarget.position.x, this.moveTarget.position.y, this.moveTarget.position.z);
};

Player.prototype.updateFallingStatus = function () {
    this.groundRaycaster.set(
        new THREE.Vector3(this.moveTarget.position.x, this.moveTarget.position.y + 4, this.moveTarget.position.z),
        new THREE.Vector3(0, -1, 0)
    );
    var intersections = this.groundRaycaster.intersectObjects(PRIVATE.currentLevel.groundMeshes);
    if (intersections.length > 0) {
        this.moveTarget.position.y = intersections[0].point.y;
    } else {
        this.moveTarget.position.y = -1;
    }
};

// Add some life to the player (or remove, the amount may be negative)
Player.prototype.addHealth = function(amount) {
    Character.prototype.addHealth.call(this, amount);
    PRIVATE.updateHealthBar(this.currentAttributes.health, this.currentAttributes.healthTotal);
};

// Add some stamina to the player (or remove, the amount may be negative)
Player.prototype.addStamina = function(amount) {
    Character.prototype.addStamina.call(this, amount);
    PRIVATE.updateStaminaBar(this.currentAttributes.stamina, this.currentAttributes.staminaTotal);
};
