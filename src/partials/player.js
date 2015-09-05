/* global THREE */

function Player() {
    // Path to model file
    this.model = 'models/player.json';

    // Helper object to make movement
    this.moveTarget = new THREE.Object3D();

    // Constants for movement
    this.turnSpeed = 0.003; // radians/time - This must be tuned
    this.walkSpeed = 0.01; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
    this.turnInfluenceOnCamera = 0.3; // The walk/turn for the camera to follow the character
    
    this.moveTiltAngle = 0.15;

    // Set up initial stats
    this.strength  = 5;
    this.dexterity = 5;
    this.stamina   = 5;

    // Just create bones variables
    this.bones = {
        base: null,
        top: null,
        head: null,
        leftHand: null,
        rightHand: null,
        leftEye: null,
        rightEye: null
    };
}

Player.prototype.load = function(callback) {
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
            switch(bone.name) {
                default: break;
                case 'Base':
                    _this.bones.base = bone;
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

    var loader = new THREE.JSONLoader();
    loader.load(this.model, function(geometry, materials) {
        materials.forEach(function(mat) {
            mat.skinning = true;
        });

        _this.mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
        _this.mesh.castShadow = true;

        // Call function passing the mesh
        if (typeof(callback) === 'function') {
            callback(_this.mesh);
        }
        
        // Set up bones
        assignBones(_this.mesh.skeleton.bones);
    });
};

Player.prototype.animate = function(time, move, cameraMove) {
    // Set base speeds
    var frameTurnSpeed = this.turnSpeed * time;
    var frameWalkSpeed = this.walkSpeed * time;
    var tiltAngle = move.deadLength * this.moveTiltAngle;
    if (move.run) {
        frameWalkSpeed *= this.runSpeedRatio;
        tiltAngle *= this.runSpeedRatio;
    }

    // Calculate movement influence on camera turn angle
    var turnForCamera = move.x * this.turnInfluenceOnCamera;
    if (move.y > 0) {
        if (turnForCamera > 0) {
            turnForCamera += move.y * this.turnInfluenceOnCamera;
        } else {
            turnForCamera -= move.y * this.turnInfluenceOnCamera;
        }
    }
    // Make rotation - always based on the camera
    this.moveTarget.rotateY(-frameTurnSpeed * (cameraMove.x + turnForCamera));
    
    // If we don't have movement, just ignore calculations
    if (move.x === 0 && move.y === 0) {
        this.bones.base.rotation.x = Math.HALFPI;
        this.bones.top.rotation.x = 0;
        return;
    }

    // Make movement
    this.moveTarget.translateZ(frameWalkSpeed * move.y);
    this.moveTarget.translateX(frameWalkSpeed * move.x);

    this.mesh.lookAt(this.moveTarget.position);
    //this.mesh.rotateX(tiltAngle); // Tilt angle
    this.bones.base.rotation.x = Math.HALFPI + tiltAngle;
    this.bones.top.rotation.x = -tiltAngle/2;
    //var deltaX = this.moveTarget.position.x - this.mesh.position.x;
    //var deltaY = this.moveTarget.position.y - this.mesh.position.y;
    //var deltaZ = this.moveTarget.position.z - this.mesh.position.z;
    //this.mesh.translateX(deltaX);
    //this.mesh.translateZ(deltaZ);
    this.mesh.position.set(this.moveTarget.position.x, this.moveTarget.position.y, this.moveTarget.position.z);
};
