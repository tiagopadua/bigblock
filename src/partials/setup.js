function setupThreeJS(container) {
    // Set up THREE.js base objects
    PRIVATE.scene = new THREE.Scene();
    PRIVATE.camera = new THREE.PerspectiveCamera(
        PRIVATE.FOV,
        container.offsetWidth / container.offsetHeight,
        0.1, // Min drawing distance
        1000 // Max drawing distance
    );
    PRIVATE.renderer = new THREE.WebGLRenderer( { antialias: true } );
    PRIVATE.renderer.setSize(container.offsetWidth, container.offsetHeight);

    // Append renderer element to the container dom element
    container.appendChild(PRIVATE.renderer.domElement);
}
