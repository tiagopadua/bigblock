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

    // Constants for movement
    this.turnSpeed = 3; // radians/time - This must be tuned
    this.walkSpeed = 10; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
    this.turnInfluenceOnCamera = 0.3; // The walk/turn for the camera to follow the character

    this.moveTiltFactor = 0.15;

    // Initial weapons
    this.weaponRight = null;
    this.weaponLeft = null;

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
        this.rightHandWeapon = equipment;
    }
};

// Simply attach equipment to LEFT hand
Player.prototype.attachEquipmentLeft = function(equipment) {
    if (!equipment || !this.bones.HandLeft) {
        return;
    }

    if (this.bones.HandLeft) {
        this.bones.HandLeft.add(equipment.mesh);
        this.leftHandWeapon = equipment;
    }
};

// Decide which target the camera should follow
Player.prototype.getCameraTarget = function() {
    return this.moveTarget;
};

// Intended to be called each frame
Player.prototype.update = function(time) {
    // Check focus
    if (PRIVATE.control.focus.changed && PRIVATE.control.focus.pressed) {
        if (this.focus) {
            this.focus.removeFocus();
            this.focus = null; // remove focus
        } else {
            this.focus = searchFocus();
            if (this.focus) {
                this.focus.setFocus(); // Set visual for focus
            }
        }
    }

    if (PRIVATE.level.isOverGround(this.mesh.position) !== this.lastOverGround) {
        if (this.lastOverGround) {
            console.log('CAIU');
            this.lastOverGround = false;
        } else {
            console.log('VOLTOU');
            this.lastOverGround = true;
        }
    }

    // Check generic animations
    // "No"
    if (PRIVATE.control.leftAttack.pressed && PRIVATE.control.leftAttack.changed) {
        if (this.animations.No && !this.animations.No.isPlaying) {
            this.animations.No.play();
        }
    }
    // "Yes"
    if (PRIVATE.control.leftAttackStrong.pressed && PRIVATE.control.leftAttackStrong.changed) {
        if (this.animations.Yes && !this.animations.Yes.isPlaying) {
            this.animations.Yes.play();
        }
    }
    // "Attack right 1"
    if (PRIVATE.control.rightAttack.pressed && PRIVATE.control.rightAttack.changed) {
        if (this.animations.AttackRight1 && !this.animations.AttackRight1.isPlaying) {
            this.animations.AttackRight1.play();
        }
    }

    // Set base speeds
    var frameTurnSpeed = this.turnSpeed * time;
    var frameWalkSpeed = this.walkSpeed * time;
    var moveTiltAngle = PRIVATE.control.movement.deadLength * this.moveTiltFactor;
    var turnForCamera = PRIVATE.control.movement.x * this.turnInfluenceOnCamera;
    if (PRIVATE.control.run.pressed) {
        frameWalkSpeed *= this.runSpeedRatio;
        moveTiltAngle *= this.runSpeedRatio;
        turnForCamera *= this.runSpeedRatio;
    }

    if (this.focus) {
        this.moveTarget.lookAt(this.focus.mesh.position);
        this.moveTarget.rotateY(Math.PI); // rotate 180deg for the camera
        this.mesh.lookAt(this.focus.mesh.position);
    } else {
        // Make rotation - always based on the camera
        this.moveTarget.rotateY(-frameTurnSpeed * (PRIVATE.control.cameraMovement.x + turnForCamera));
    }

    // If we don't have movement, just ignore calculations
    if (PRIVATE.control.movement.x === 0 && PRIVATE.control.movement.y === 0) {
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
