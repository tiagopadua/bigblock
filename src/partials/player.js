/* global PRIVATE */
/* global Promise */
/* global THREE */

function Player() {
    // TODO: load from save file / create name
    this.name = 'player';

    // Path to model file
    this.modelFile = 'models/player.json';

    // Helper object to make movement
    this.moveTarget = new THREE.Object3D();

    // Constants for movement
    this.turnSpeed = 3; // radians/time - This must be tuned
    this.walkSpeed = 10; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
    this.turnInfluenceOnCamera = 0.3; // The walk/turn for the camera to follow the character

    this.moveTiltFactor = 0.15;

    // Set up initial stats
    this.attributes.strength  = 5;
    this.attributes.dexterity = 5;
    this.attributes.stamina   = 5;

    // Initial weapons
    this.weaponRight = null;
    this.weaponLeft = null;
    
    this.requiredAnimations = [ 'Yes', 'No', 'AttackRight1' ];
    this.requiredBones = [ 'HandRight', 'HandLeft' ];
}

// Inherit from Character
Player.prototype = Object.create(Character.prototype);

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

Player.prototype.update = function(time) {
    // Check generic animations
    // "No"
    if ((PRIVATE.control.leftAttack.pressed && PRIVATE.control.leftAttack.changed) ||
        (PRIVATE.control.leftAttackStrong.pressed && PRIVATE.control.leftAttackStrong.changed)) {
        if (this.animations.No && !this.animations.No.isPlaying) {
            this.animations.No.play();
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

    // Make rotation - always based on the camera
    this.moveTarget.rotateY(-frameTurnSpeed * (PRIVATE.control.cameraMovement.x + turnForCamera));

    // If we don't have movement, just ignore calculations
    if (PRIVATE.control.movement.x === 0 && PRIVATE.control.movement.y === 0) {
        this.bones.Base.rotation.x = Math.HALFPI;
        this.bones.Top.rotation.x = 0;
        return;
    }

    // Make movement
    this.moveTarget.translateZ(frameWalkSpeed * PRIVATE.control.movement.y);
    this.moveTarget.translateX(frameWalkSpeed * PRIVATE.control.movement.x);

    // Set rotation
    this.mesh.lookAt(this.moveTarget.position);

    // Add tilt movement
    this.bones.Base.rotation.x = Math.HALFPI + moveTiltAngle;
    this.bones.Top.rotation.x = -moveTiltAngle/2;

    // Set final position
    this.mesh.position.set(this.moveTarget.position.x, this.moveTarget.position.y, this.moveTarget.position.z);
};
