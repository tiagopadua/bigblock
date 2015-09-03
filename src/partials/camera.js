// Follow object at a given distance
//  target: THREE.Object3d
//  relativeCameraOffset: THREE.Vector3
(function() {
    var cameraDeltaY = 0;
    var cameraHeightSpeed = 0.004;
    var MIN_CAMERA_HEIGHT = 0.5;
    var MAX_CAMERA_HEIGHT = 6;

    PRIVATE.followObjectWithCamera = function(time, target, cameraMove) {
        // Calculate input movement
        cameraDeltaY += cameraMove.y * cameraHeightSpeed * time;

        // New Y desired position
        var newCameraY = PRIVATE.cameraOffset.y + cameraDeltaY;
        // Constrain movement
        newCameraY = Math.max(MIN_CAMERA_HEIGHT, Math.min(MAX_CAMERA_HEIGHT, newCameraY));
        
        // Set camera position to follow target
        var relativeCameraOffset = new THREE.Vector3(PRIVATE.cameraOffset.x, newCameraY, PRIVATE.cameraOffset.z); // We need to create a new vector, so we dont change the original one
        var cameraOffset = relativeCameraOffset.applyMatrix4(target.matrixWorld);
        PRIVATE.camera.position.x = cameraOffset.x;
        PRIVATE.camera.position.y = cameraOffset.y;
        PRIVATE.camera.position.z = cameraOffset.z;

        // Point camera at player
        PRIVATE.camera.lookAt(target.position);
    };
})();
