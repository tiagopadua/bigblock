// Follow object at a given distance
//  target: THREE.Object3d
//  relativeCameraOffset: THREE.Vector3
(function() {
    var cameraY = PRIVATE.cameraOffset.y;
    var cameraHeightSpeed = 20;
    var MIN_CAMERA_HEIGHT = 2;
    var MAX_CAMERA_HEIGHT = 20;

    PRIVATE.followObjectWithCamera = function(time, target) {
        // Calculate input movement
        cameraY += PRIVATE.control.cameraMovement.y * cameraHeightSpeed * time;

        // Constrain movement
        cameraY = Math.max(MIN_CAMERA_HEIGHT, Math.min(MAX_CAMERA_HEIGHT, cameraY));
        
        // Set camera position to follow target
        var relativeCameraOffset = new THREE.Vector3(PRIVATE.cameraOffset.x, cameraY, PRIVATE.cameraOffset.z); // We need to create a new vector, so we dont change the original one
        var cameraOffset = relativeCameraOffset.applyMatrix4(target.matrixWorld);
        PRIVATE.camera.position.x = cameraOffset.x;
        PRIVATE.camera.position.y = cameraOffset.y;
        PRIVATE.camera.position.z = cameraOffset.z;

        // Point camera at player
        var cameraTarget = target.position.clone();
        cameraTarget.y += 2;
        PRIVATE.camera.lookAt(cameraTarget);
    };
})();
