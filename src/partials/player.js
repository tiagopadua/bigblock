/* global THREE */

function Player() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;

    // Helper object to make movement
    this.moveTarget = new THREE.Object3D();

    this.moveTarget.position.set(0, 0.5, 0);
    this.mesh.position.set(0, 0.5, 0);

    // Constants for movement
    this.turnSpeed = 0.003; // radians/time - This must be tuned
    this.walkSpeed = 0.003; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
    this.turnInfluenceOnCamera = 0.4; // The walk/turn for the camera to follow the character

    // Set up initial stats
    this.strength  = 5;
    this.dexterity = 5;
    this.stamina   = 5; 
}

Player.prototype.animate = function(time, move, cameraMove) {
    // Set base speeds
    var frameTurnSpeed = this.turnSpeed * time;
    var frameWalkSpeed = this.walkSpeed * time;
    if (move.run) {
        frameWalkSpeed *= this.runSpeedRatio;
    }

    // Calculate movement influence on camera turn angle
    var turnForCamera = move.x * this.turnInfluenceOnCamera;
    if (move.y > 0) {
        if (turnForCamera > 0) {
            turnForCamera += move.y;
        } else if (turnForCamera < 0) {
            turnForCamera -= move.y;
        }
    }
    // Make rotation - always based on the camera
    this.moveTarget.rotateY(-frameTurnSpeed * (cameraMove.x + turnForCamera));
    
    // If we don't have movement, just ignore calculations
    if (move.x === 0 && move.y === 0) {
        return;
    }

    // Make movement
    this.moveTarget.translateZ(frameWalkSpeed * move.y);
    this.moveTarget.translateX(frameWalkSpeed * move.x);

    this.mesh.lookAt(this.moveTarget.position);
    //var deltaX = this.moveTarget.position.x - this.mesh.position.x;
    //var deltaY = this.moveTarget.position.y - this.mesh.position.y;
    //var deltaZ = this.moveTarget.position.z - this.mesh.position.z;
    //this.mesh.translateX(deltaX);
    //this.mesh.translateZ(deltaZ);
    this.mesh.position.set(this.moveTarget.position.x, this.moveTarget.position.y, this.moveTarget.position.z);
};

Player.prototype.getPosition = function() {
    return this.mesh.position;
};
