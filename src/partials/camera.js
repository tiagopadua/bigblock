// Follow object at a given distance
//  target: THREE.Object3d
//  relativeCameraOffset: THREE.Vector3
function followObjectWithCamera(target, targetOffset) {
    // Set camera position to follow player
    var relativeCameraOffset = new THREE.Vector3(targetOffset.x, targetOffset.y, targetOffset.z); // This is needed so we dont change the original object
    var cameraOffset = relativeCameraOffset.applyMatrix4(target.matrixWorld);
    PRIVATE.camera.position.x = cameraOffset.x;
    PRIVATE.camera.position.y = cameraOffset.y;
    PRIVATE.camera.position.z = cameraOffset.z;
    // Point camera at player
    PRIVATE.camera.lookAt(target.position);

}
