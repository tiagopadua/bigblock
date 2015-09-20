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
    this.attributes.strength  = 5;
    this.attributes.dexterity = 5;
    this.attributes.stamina   = 5;

    // Animations that MUST HAVE to run
    this.requiredAnimations = [ 'Yes', 'No', 'AttackRight1' ];
    this.requiredBones = [ 'HandRight', 'HandLeft' ];

    // Focus target
    this.focus = null;

    // Auxiliar variable to control fall event
    this.lastOverGround = true;
    
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
    // Start animation
    animation.play();

    // Save the attacking weapon and animation
    this.attackingWeapon = weapon;
    this.attackingAnimation = animation;
    // Set up enemies to check collision
    this.enemyHitList = [];
    for (var enemyId = 0; enemyId < PRIVATE.level.enemies.length; enemyId++) {
        var enemy = PRIVATE.level.enemies[enemyId];
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
            this.enemyHitList.splice(enemyId, 1);
            PRIVATE.level.killEnemy(enemy);
        }
    }
};

// Intended to be called each frame
Player.prototype.update = function(time) {
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
    }

    // Set speeds
    var frameTurnSpeed = this.turnSpeed * time;
    var frameWalkSpeed = this.walkSpeed * time;
    var moveTiltAngle = PRIVATE.control.movement.deadLength * this.moveTiltFactor;
    var turnForCamera = PRIVATE.control.movement.x * this.turnInfluenceOnCamera;
    if (PRIVATE.control.run.pressed) {
        frameWalkSpeed *= this.runSpeedRatio;
        moveTiltAngle *= this.runSpeedRatio;
        turnForCamera *= this.runSpeedRatio;
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

    // Check if player is over ground
    // TODO: implement fall to death
    var groundTriangle = PRIVATE.level.isOverGround(this.mesh.position);
    var isOverGroundNow = Boolean(groundTriangle);
    if (isOverGroundNow !== this.lastOverGround) {
        if (this.lastOverGround) {
            console.log('CAIU');
            this.lastOverGround = false;
        } else {
            console.log('VOLTOU');
            this.lastOverGround = true;
        }
    }
    // Set player position right over the ground triangles
    var targetY = 4; // TODO: fall
    if (isOverGroundNow) {
        // The vector MUST be normalized
        var ray = new THREE.Ray(this.mesh.position, new THREE.Vector3(0, -1, 0)); // Normalized vector pointing down
        var intersect = ray.intersectTriangle(groundTriangle.a, groundTriangle.b, groundTriangle.c, false);
        if (intersect) {
            targetY = intersect.y;
        }
    }
    this.moveTarget.position.y = targetY;

    // Set rotation
    if (this.focus) {
        //this.mesh.lookAt(this.focus.mesh.position);
        //this.moveTarget.rotateY(Math.PI); // rotate 180deg for the camera
    } else {
        this.mesh.lookAt(this.moveTarget.position);
    }

    // Set final position
    this.mesh.position.set(this.moveTarget.position.x, this.moveTarget.position.y, this.moveTarget.position.z);
};
