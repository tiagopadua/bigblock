/*
 * This is the first enemy with purpose of testing
 */

function FirstEnemy() {
    this.name = 'First Enemy test';
    
    this.modelFile = 'models/playerTest.json';
}

// Inherit
FirstEnemy.prototype = Object.create(Character.prototype);

// Update enemy actions
FirstEnemy.prototype.update = function(time) {
    this.mesh.lookAt(PRIVATE.player.mesh.position);
};
