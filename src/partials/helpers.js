/*
 * Helper functions and constants
 */

Math.HALFPI = Math.PI / 2;
Math.TWOPI = Math.PI * 2;

var clock = new THREE.Clock();

// Search for a focuseable enemy
function searchFocus() {
    // TODO: really search for the nearest enemy in front
    return PRIVATE.level.enemies[0];
}

function enterFullScreen() {
    if (!PRIVATE.container) {
        return;
    }
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}
