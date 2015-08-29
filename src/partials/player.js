/* global THREE */

function Player() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial( { color: 0xffcc00 } );
    this.mesh = new THREE.Mesh(geometry, material);
    this.walkSpeed = 0.005; // This must be tuned
}

Player.prototype.animate = function(time, move) {
    this.mesh.position.x += this.walkSpeed * move.x * time;
    this.mesh.position.z += this.walkSpeed * move.y * time;
};

Player.prototype.getPosition = function() {
    return this.mesh.position;
};
