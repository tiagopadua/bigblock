/* global Promise */
/* global THREE */

function Player() {
    // Path to model file
    this.model = 'models/player.json';

    // Helper object to make movement
    this.moveTarget = new THREE.Object3D();

    // Constants for movement
    this.turnSpeed = 3; // radians/time - This must be tuned
    this.walkSpeed = 10; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
    this.turnInfluenceOnCamera = 0.3; // The walk/turn for the camera to follow the character

    this.moveTiltFactor = 0.15;
    //this.turnTiltFactor = 2;

    // Set up initial stats
    this.strength  = 5;
    this.dexterity = 5;
    this.stamina   = 5;

    // Just create bones variables
    this.bones = {
        base: null,
        bottom: null,
        top: null,
        head: null,
        leftHand: null,
        rightHand: null,
        leftEye: null,
        rightEye: null
    };

    // Save the animations
    this.animations = {
        yes: null,
        no: null
    };

    // Save last direction pointed
    //this.lastDirection = 0;
}

Player.prototype.load = function() {
    // Helper for callback function
    var _this = this;

    return new Promise(function(resolve, reject) {
        // Bones assignment
        function assignBones(bones) {
            var i;
            for (i in bones) {
                var bone = bones[i];
                if (!bone) {
                    continue;
                }
                switch(bone.name) {
                    default: break;
                    case 'Base':
                        _this.bones.base = bone;
                        break;
                    case 'Bottom':
                        _this.bones.bottom = bone;
                        break;
                    case 'Top':
                        _this.bones.top = bone;
                        break;
                    case 'Head':
                        _this.bones.head = bone;
                        break;
                    case 'HandLeft':
                        _this.bones.leftHand = bone;
                        break;
                    case 'HandRight':
                        _this.bones.rightHand = bone;
                        break;
                    case 'EyeLeft':
                        _this.bones.leftEye = bone;
                        break;
                    case 'EyeRight':
                        _this.bones.rightEye = bone;
                        break;
                }
            }
        }

        // Animations assignment
        function assignAnimations(animations) {
            var i;
            for (i in animations) {
                var animation = animations[i];
                if (!animation) {
                    continue;
                }
                switch (animation.name) {
                    default: break;
                    case 'No':
                        _this.animations.no = new THREE.Animation(_this.mesh, animation, THREE.AnimationHandler.CATMULLROM);
                        _this.animations.no.loop = false;
                        console.info('Loaded player animation "No"');
                        break;
                    case 'Yes':
                        _this.animations.yes = new THREE.Animation(_this.mesh, animation, THREE.AnimationHandler.CATMULLROM);
                        _this.animations.yes.loop = false;
                        console.info('Loaded player animation "Yes"');
                        break;
                }
            }
        }

        // Load model
        var loader = new THREE.JSONLoader();
        loader.load(_this.model, function(geometry, materials) {
            // Set material flag to follow bones
            materials.forEach(function(mat) {
                mat.skinning = true;
            });

            // Create the mesh
            _this.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
            _this.mesh.castShadow = true;

            // Set up bones
            assignBones(_this.mesh.skeleton.bones);
            assignAnimations(geometry.animations);

            // Finish the promise
            resolve(_this.mesh);
        });
    });
};
/*
Player.prototype.getDeltaDirection = function(currentDirection) {
    var dx = this.moveTarget.position.x - this.mesh.position.x;
    var dz = this.moveTarget.position.z - this.mesh.position.z;

    var angle = Math.atan2(dz, dx);
    var dAngle = angle - this.lastDirection;
    this.lastDirection = angle;

    if (dAngle > Math.TWOPI) {
        dAngle -= Math.TWOPI;
    } else if (dAngle < -Math.TWOPI) {
        dAngle += Math.TWOPI;
    }

    return dAngle;
};
*/
Player.prototype.update = function(time) {
    // Check generic animations
    // "No"
    if (PRIVATE.control.left.pressed && PRIVATE.control.left.changed) {
        if (this.animations.no && !this.animations.no.isPlaying) {
            this.animations.no.play();
        }
    }
    // "Yes"
    if (PRIVATE.control.right.pressed && PRIVATE.control.right.changed) {
        if (this.animations.yes && !this.animations.yes.isPlaying) {
            this.animations.yes.play();
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
        this.bones.base.rotation.x = Math.HALFPI;
        //this.bones.base.rotation.y = 0;
        this.bones.top.rotation.x = 0;
        return;
    }

    // Make movement
    this.moveTarget.translateZ(frameWalkSpeed * PRIVATE.control.movement.y);
    this.moveTarget.translateX(frameWalkSpeed * PRIVATE.control.movement.x);

    // Set rotation
    this.mesh.lookAt(this.moveTarget.position);

    // Add tilt movement
    //var turnTiltAngle = this.getDeltaDirection() * this.turnTiltFactor;
    //this.bones.base.rotation.y = turnTiltAngle;
    this.bones.base.rotation.x = Math.HALFPI + moveTiltAngle;
    this.bones.top.rotation.x = -moveTiltAngle/2;

    // Set final position
    this.mesh.position.set(this.moveTarget.position.x, this.moveTarget.position.y, this.moveTarget.position.z);
};
