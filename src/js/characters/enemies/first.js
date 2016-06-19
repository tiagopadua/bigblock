/*
 * This is the first enemy with purpose of testing
 */

function FirstEnemy() {
    this.name = 'First Enemy test';
    
    this.modelFile = 'models/playerTest.json';
}

// Inherit
FirstEnemy.prototype = new Character();

// Override the "load" method, but save the original first
FirstEnemy.prototype.parentLoad = FirstEnemy.prototype.load;
FirstEnemy.prototype.load = function () {
    var self = this;
    // First load the original
    return this.parentLoad().then(function (result) {
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
/*
    if (this.glow) {
        this.glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(PRIVATE.camera.position, this.glow.position);
    }
*/
};


// Add this enemy class to the character list
Character.availableEnemies.firstEnemy = FirstEnemy;
