/*
 * Initialize Three.js objects
 */

function setupThreeJS() {
    if (typeof(PRIVATE.container) === 'undefined' ||
        PRIVATE.container === null ||
        PRIVATE.container === document.body) {
        // Defaults to <body>
        PRIVATE.container = document.body;
        if (!PRIVATE.width) {
            PRIVATE.width = window.innerWidth;
        }
        if (!PRIVATE.height) {
            PRIVATE.height = window.innerHeight;
        }
    } else if (!(PRIVATE.container instanceof HTMLElement)) {
        console.error('Container must be a DOM element. Received:', typeof(PRIVATE.container));
        return;
    }

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
    PRIVATE.renderer.shadowMapEnabled = true;
    PRIVATE.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    PRIVATE.renderer.setSize(PRIVATE.width, PRIVATE.height);

    // Append renderer element to the container dom element
    PRIVATE.container.appendChild(PRIVATE.renderer.domElement);

    // Process full-screen event
    PRIVATE.container.addEventListener('dblclick', toggleFullScreen);

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
}
