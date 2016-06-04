/*
 * This is the first enemy with purpose of testing
 */

function FirstEnemy() {
    this.name = 'First Enemy test';
    
    this.modelFile = 'models/playerTest.json';
}

// Inherit
FirstEnemy.prototype = new Character();

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
Character.availableEnemies['firstEnemy'] = FirstEnemy;
