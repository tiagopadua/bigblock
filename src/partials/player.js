/* global THREE */

function Player() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.5, 0);
    this.mesh.castShadow = true;
    this.turnSpeed = 0.003; // radians/time - This must be tuned
    this.walkSpeed = 0.003; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;

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

    // Make movement
    this.mesh.translateZ(frameWalkSpeed * move.y);
    this.mesh.translateX(frameWalkSpeed * move.x);
    // Set rotation
    this.mesh.rotateY(-frameTurnSpeed * cameraMove.x);
};

Player.prototype.getPosition = function() {
    return this.mesh.position;
};
