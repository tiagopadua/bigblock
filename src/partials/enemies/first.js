/*
 * This is the first enemy with purpose of testing
 */

function FirstEnemy() {
    this.name = 'First Enemy test';
    
    this.modelFile = 'models/playerTest.json';
}

// Inherit
FirstEnemy.prototype = new Character();

// Create glow effect
FirstEnemy.prototype.addGlow = function() {
    // create custom material from the shader code above
    //   that is within specially labeled script tags
    console.log(1);
    var customMaterial = new THREE.ShaderMaterial({
        uniforms: { 
            "c": { type: "f", value: 1.0 },
            "p": { type: "f", value: 1.4 },
            glowColor: { type: "c", value: new THREE.Color(0xffff00) },
            viewVector: { type: "v3", value: PRIVATE.camera.position }
        },
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    console.log(2);
    this.glow = new THREE.Mesh(this.mesh.clone(), customMaterial.clone());
    //this.glow.position = this.mesh.position;
    console.log(3);
    this.glow.scale.multiplyScalar(1.2);
    console.log(4);
    PRIVATE.scene.add(this.glow);
    console.log(5);
};

// Update enemy actions
FirstEnemy.prototype.update = function(time) {
    this.mesh.lookAt(PRIVATE.player.mesh.position);
};
