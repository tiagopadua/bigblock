/* global PRIVATE */
/* global THREE */
/*
 * Helper functions and constants
 */

Math.HALFPI = Math.PI / 2;
Math.TWOPI = Math.PI * 2;

var clock = new THREE.Clock();

// Search for a focuseable enemy
function searchFocus() {
    // Total length of the line
    var focusLineLength = 50;

    // 1. Create a line starting on player's position
    //    And going on the direction of camera's X-Z rotation
    //    The line must have pre-defined length
    var line = new THREE.Line3();
    line.end.z = -focusLineLength;
    line.applyMatrix4(PRIVATE.camera.matrixWorld);

    // 2. Calculate the distance from every enemy to this line
    //    We are using distance squared because it is faster (avoids sqrt on calculation)
    //    But it works, because we are only comparing squared distances to each other
    var i, enemy, closestPoint, distanceEnemy, distanceOrigin, distanceNormalized, distancePlayer;
    var closest = {
        enemy: null,
        distance: Infinity // Start with max distance possible
    };
    for (i = 0; i < PRIVATE.level.enemies.length; i++) {
        enemy = PRIVATE.level.enemies[i];
        // Get the point on line closest to enemy
        closestPoint = line.closestPointToPoint(enemy.mesh.position);

        // Calculate the squared distance between the enemy and point on line
        distanceEnemy = closestPoint.distanceToSquared(enemy.mesh.position);
        // Now the distance betwen point on line and start of line
        distanceOrigin = closestPoint.distanceToSquared(line.start);
        // Normalize distance
        distanceNormalized = distanceEnemy / distanceOrigin;

        // And distance of the enemy to player position
        distancePlayer = enemy.mesh.position.distanceToSquared(PRIVATE.player.mesh.position); 

        // 3. Pick the closest one that satisfies the max distance to player
        if (distanceNormalized < closest.distance &&
            distancePlayer < PRIVATE.player.maxFocusDistanceSquared) {
            closest.distance = distanceNormalized;
            closest.enemy = enemy;
        }
    }

    return closest.enemy; // null if did not find any
}

// Search for next enemy to LEFT or RIGHT
function searchNextFocus(right) {
    if (!PRIVATE.player.focus) {
        return null;
    }

    var closest = {
        enemy: null,
        angle: right ? Infinity : -Infinity
    };

    // Consider only X and Z axis (no height involved)
    var targetVector = new THREE.Vector2(PRIVATE.player.focus.mesh.position.x - PRIVATE.camera.position.x,
                                         PRIVATE.player.focus.mesh.position.z - PRIVATE.camera.position.z);
    // TODO: research if we can avoid the atan2
    var currentEnemyAngle = Math.atan2(targetVector.y, targetVector.x);

    var i, enemy, enemyAngle;
    for (i = 0; i < PRIVATE.level.enemies.length; i++) {
        enemy = PRIVATE.level.enemies[i];
        // Ignore current target
        if (enemy === PRIVATE.player.focus) {
            continue;
        }

        // Calculate the angle of the enemy to the camera
        targetVector.x = enemy.mesh.position.x - PRIVATE.camera.position.x;
        targetVector.y = enemy.mesh.position.z - PRIVATE.camera.position.z;
        enemyAngle = Math.atan2(targetVector.y, targetVector.x) - currentEnemyAngle;

        // Save if is the closest
        if ((right && enemyAngle >= 0 && enemyAngle < closest.angle) ||
            (!right && enemyAngle < 0 && enemyAngle > closest.angle)) {
            closest.angle = enemyAngle;
            closest.enemy = enemy;
        }
    }

    return closest.enemy;
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
