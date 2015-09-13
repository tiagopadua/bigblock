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

// Process enter/exit full-screen
function toggleFullScreen() {
    if (!PRIVATE.container) {
        return;
    }

    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        // Enter full-screen
        if (PRIVATE.container.requestFullscreen) {
            PRIVATE.container.requestFullscreen();
        } else if (PRIVATE.container.msRequestFullscreen) {
            PRIVATE.container.msRequestFullscreen();
        } else if (PRIVATE.container.mozRequestFullScreen) {
            PRIVATE.container.mozRequestFullScreen();
        } else if (PRIVATE.container.webkitRequestFullscreen) {
            PRIVATE.container.webkitRequestFullscreen();
        }
    } else {
        // Exit full-screen
        if (document.cancelFullScreen) {  
            document.cancelFullScreen();  
        } else if (document.mozCancelFullScreen) {  
            document.mozCancelFullScreen();  
        } else if (document.webkitCancelFullScreen) {  
            document.webkitCancelFullScreen();  
        }
    }
}
