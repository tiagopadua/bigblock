/* global THREE */

function Player() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial( { color: 0xffcc00 } );
    this.mesh = new THREE.Mesh(geometry, material);
    this.turnSpeed = 0.004; // radians/time - This must be tuned
    this.walkSpeed = 0.004; // pixels/time - This must be tuned
    this.runSpeedRatio = 2;
}

Player.prototype.animate = function(time, move, cameraMove) {
    var frameWalkSpeed = this.walkSpeed * time;
    if (move.run) {
        frameWalkSpeed *= this.runSpeedRatio;
    }
    var frameTurnSpeed = this.turnSpeed * time;
    /*
    var walkX = this.walkSpeed * move.x * time;
    var walkY = this.walkSpeed * move.y * time;
    var sinAngle = Math.sin(move.angle);
    var cosAngle = Math.cos(move.angle);
    this.mesh.position.x += walkX * cosAngle + walkY * sinAngle;
    this.mesh.position.z -= walkX * sinAngle - walkY * cosAngle;
    this.mesh.rotateY(move.angle - this.mesh.rotation._y);
    */
    // Make movement
    this.mesh.translateZ(frameWalkSpeed * move.y);
    this.mesh.translateX(frameWalkSpeed * move.x);
    // Set rotation
    this.mesh.rotateY(-frameTurnSpeed * cameraMove.x);
};

Player.prototype.getPosition = function() {
    return this.mesh.position;
};
