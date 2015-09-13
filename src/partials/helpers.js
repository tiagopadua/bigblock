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

// Check if a 2d point is inside a 2d triangle 
function isPointInsideTriangle(point, vertex1, vertex2, vertex3) {
    // Using barycentric coordinates
    var A = (-vertex2.y * vertex3.x + vertex1.y * (-vertex2.x + vertex3.x) + vertex1.x * (vertex2.y - vertex3.y) + vertex2.x * vertex3.y) / 2;
    var sign = A < 0 ? -1 : 1;
    var s = (vertex1.y * vertex3.x - vertex1.x * vertex3.y + (vertex3.y - vertex1.y) * point.x + (vertex1.x - vertex3.x) * point.y) * sign;
    var t = (vertex1.x * vertex2.y - vertex1.y * vertex2.x + (vertex1.y - vertex2.y) * point.x + (vertex2.x - vertex1.x) * point.y) * sign;

    return (s >= 0) && (t >= 0) && (s + t) <= (2 * A * sign);
}

window.is = isPointInsideTriangle;

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
