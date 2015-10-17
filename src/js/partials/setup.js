/*
 * Initialize Three.js objects
 */

(function bigBlockSetup() {
    PRIVATE.setupThreeJS = function() {
        // Set width and height - if not already defined
        if (!PRIVATE.width) {
            PRIVATE.width = PRIVATE.container.offsetWidth;
        }
        if (!PRIVATE.height) {
            PRIVATE.height = PRIVATE.container.offsetHeight;
        }

        // Set up THREE.js base objects
        PRIVATE.scene = new THREE.Scene();
        PRIVATE.camera = new THREE.PerspectiveCamera(
            PRIVATE.FOV,
            PRIVATE.width / PRIVATE.height,
            0.1, // Min drawing distance
            1000 // Max drawing distance
        );
        PRIVATE.renderer = new THREE.WebGLRenderer( { antialias: true } );
        PRIVATE.renderer.shadowMap.enabled = true;
        PRIVATE.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        PRIVATE.renderer.setSize(PRIVATE.width, PRIVATE.height);

        // Append renderer element to the container dom element
        PRIVATE.container.appendChild(PRIVATE.renderer.domElement);

        // Set listener to window changing size
        window.addEventListener('resize', function() {
            // Save new dimensions
            if (PRIVATE.container === document.body) {
                PRIVATE.width = window.innerWidth;
                PRIVATE.height = window.innerHeight;
            } else {
                PRIVATE.width = PRIVATE.container.offsetWidth;
                PRIVATE.height = PRIVATE.container.offsetHeight;
            }

            // Update camera
            PRIVATE.camera.aspect = PRIVATE.width / PRIVATE.height;
            PRIVATE.camera.updateProjectionMatrix();

            // Update renderer size
            PRIVATE.renderer.setSize(PRIVATE.width, PRIVATE.height);
        }, false);
    };
})();
