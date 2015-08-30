// Follow object at a given distance
//  target: THREE.Object3d
//  relativeCameraOffset: THREE.Vector3
function followObjectWithCamera(target, relativeCameraOffset) {
    // Set camera position to follow player
    var cameraOffset = relativeCameraOffset.applyMatrix4(target.matrixWorld);
    PRIVATE.camera.position.x = cameraOffset.x;
    PRIVATE.camera.position.y = cameraOffset.y;
    PRIVATE.camera.position.z = cameraOffset.z;
    // Point camera at player
    PRIVATE.camera.lookAt(target.position);

}
