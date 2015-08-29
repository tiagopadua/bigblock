function Level() {
    var geometry = new THREE.BoxGeometry(10, -1, 10);
    var material = new THREE.MeshBasicMaterial( { color: 0x000088 } );
    this.mesh = new THREE.Mesh(geometry, material);
}
