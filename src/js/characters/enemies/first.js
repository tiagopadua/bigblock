/*
 * This is the first enemy with purpose of testing
 */

function FirstEnemy() {
    this.name = 'First Enemy test';
    
    this.modelFile = 'models/playerTest.json';
}

// Inherit
FirstEnemy.prototype = new Character();

FirstEnemy.prototype.load = function () {
    var self = this;
    // First load the original
    return Character.prototype.load.call(this).then(function (result) {
        // Then apply specific modifications
        self.mesh.material.materials[0].color.r = 0.2 + Math.random() * 0.8;
        self.mesh.material.materials[0].color.g = 0.2 + Math.random() * 0.8;
        self.mesh.material.materials[0].color.b = 0.2 + Math.random() * 0.8;

        return Promise.resolve(result);
    });
};

// Update enemy actions
FirstEnemy.prototype.update = function(time) {
    this.mesh.lookAt(PRIVATE.player.mesh.position);
};

// Add this enemy class to the character list
PRIVATE.availableEnemies.firstEnemy = FirstEnemy;
