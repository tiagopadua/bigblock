// Follow object at a given distance
//  target: THREE.Object3d
//  relativeCameraOffset: THREE.Vector3
(function() {
    var lastCameraHeight = PRIVATE.cameraOffset.y;
    var cameraHeightSpeed = 0.004;
    var MIN_CAMERA_HEIGHT = 0.5;
    var MAX_CAMERA_HEIGHT = 6;

    PRIVATE.followObjectWithCamera = function(time, target, targetOffset, cameraMove) {
        if (cameraMove && cameraMove.y !== 0) {
            lastCameraHeight += cameraMove.y * cameraHeightSpeed * time;
        }

        // Constrain movement
        lastCameraHeight = Math.max(MIN_CAMERA_HEIGHT, Math.min(MAX_CAMERA_HEIGHT, lastCameraHeight));
        
        // Set camera position to follow player
        var relativeCameraOffset = new THREE.Vector3(targetOffset.x, lastCameraHeight, targetOffset.z); // This is needed so we dont change the original object
        var cameraOffset = relativeCameraOffset.applyMatrix4(target.matrixWorld);
        PRIVATE.camera.position.x = cameraOffset.x;
        PRIVATE.camera.position.y = cameraOffset.y;
        PRIVATE.camera.position.z = cameraOffset.z;
    
        // Point camera at player
        PRIVATE.camera.lookAt(target.position);
    };
})();
