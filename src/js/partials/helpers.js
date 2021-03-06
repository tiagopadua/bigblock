/* global PRIVATE */
/* global THREE */
/*
 * Helper functions and constants
 */

Math.HALFPI = Math.PI / 2;
Math.TWOPI = Math.PI * 2;

var clock = new THREE.Clock();


// Insert inline template files (set by grunt 'concat' task)
PRIVATE.templates = {
    hud: "// !include templates/hud.html",
    loading: "// !include templates/loading.html",
    loadingItem: "// !include templates/loading_item.html"
};


// Search for a focuseable enemy
function searchFocus() {
    // Total length of the line
    var focusLineLength = 50;

    // 1. Create a line starting on player's position
    //    And going on the direction of camera's X-Z rotation
    //    The line must have pre-defined length
    var line = new THREE.Line3();
    line.end.z = -focusLineLength;
    line.applyMatrix4(PRIVATE.player.moveTarget.matrixWorld);

    // 2. Calculate the distance from every enemy to this line
    //    We are using distance squared because it is faster (avoids sqrt on calculation)
    //    But it works, because we are only comparing squared distances to each other
    var i, enemy, closestPoint, distanceEnemy, distancePlayer;
    var closest = {
        enemy: null,
        distance: Infinity // Start with max distance possible
    };
    for (i = 0; i < PRIVATE.currentLevel.enemies.length; i++) {
        enemy = PRIVATE.currentLevel.enemies[i];
        // Get the point on line closest to enemy
        closestPoint = line.closestPointToPoint(enemy.mesh.position);

        // Calculate the squared distance between the enemy and point on line
        distanceEnemy = closestPoint.distanceToSquared(enemy.mesh.position);

        // And distance of the enemy to player position
        distancePlayer = enemy.mesh.position.distanceToSquared(PRIVATE.player.mesh.position); 

        // 3. Pick the closest one that satisfies the max distance to player
        if (distanceEnemy < closest.distance &&
            distancePlayer < PRIVATE.player.maxFocusDistanceSquared) {
            closest.distance = distanceEnemy;
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
    var baseX = PRIVATE.player.mesh.position.x;
    var baseZ = PRIVATE.player.mesh.position.z;

    // Consider only X and Z axis (no height involved)
    var targetVector = new THREE.Vector2(PRIVATE.player.focus.mesh.position.x - baseX,
                                         PRIVATE.player.focus.mesh.position.z - baseZ);
    // TODO: Research if we can avoid the atan2
    //       Not too critical though, it only happens once on user action
    var currentEnemyAngle = Math.atan2(targetVector.y, targetVector.x);

    var i, enemy, enemyAngle;
    for (i = 0; i < PRIVATE.currentLevel.enemies.length; i++) {
        enemy = PRIVATE.currentLevel.enemies[i];
        // Ignore current target
        if (enemy === PRIVATE.player.focus) {
            continue;
        }

        // Calculate the angle of the enemy to the camera
        targetVector.x = enemy.mesh.position.x - baseX;
        targetVector.y = enemy.mesh.position.z - baseZ;
        // TODO: Research if we can avoid the atan2
        //       Not too critical though, it only happens on user action.
        //       May become heavy if we have a lot of enemies (which is not intended for the game)
        enemyAngle = Math.atan2(targetVector.y, targetVector.x) - currentEnemyAngle;
        // Normalize between -180deg to 180deg
        while(enemyAngle > Math.PI) {
            enemyAngle -= Math.TWOPI;
        }
        while(enemyAngle < -Math.PI) {
            enemyAngle += Math.TWOPI;
        }

        // Save if is the closest angle and is lower than max distance from player 
        if (((right && enemyAngle >= 0 && enemyAngle < closest.angle) ||
             (!right && enemyAngle < 0 && enemyAngle > closest.angle)) &&
            (enemy.mesh.position.distanceToSquared(PRIVATE.player.mesh.position) < PRIVATE.player.maxFocusDistanceSquared)) {
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

// Load the focus image file
function loadFocusTexture() {
     PRIVATE.focusTexture = THREE.ImageUtils.loadTexture('img/focus.png');
}

// Load JSON file
function loadJsonFile(url) {
    return new Promise(function(resolve, reject) {
        var loadingItem = PRIVATE.addLoadingItem(url);

        var xReq = new XMLHttpRequest();
        xReq.open('GET', url, true);
        xReq.onreadystatechange = function() {
            if (xReq.readyState === 4) {
                if (xReq.status !== 200) {
                    loadingItem.setError();
                    return reject('Unable to load file', url, 'Status:', xReq.status);
                }
                var parsed;
                try {
                    parsed = JSON.parse(xReq.responseText);
                } catch (err) {
                    loadingItem.setError();
                    return reject(err);
                }
                loadingItem.setDone();
                return resolve(parsed);
            }
        };
        // Actually make the request
        xReq.send(null);
    });
}

// Process enter/exit full-screen
function enterFullScreen() {
    if (PRIVATE.container.requestFullscreen) {
        PRIVATE.container.requestFullscreen();
    } else if (PRIVATE.container.msRequestFullscreen) {
        PRIVATE.container.msRequestFullscreen();
    } else if (PRIVATE.container.mozRequestFullScreen) {
        PRIVATE.container.mozRequestFullScreen();
    } else if (PRIVATE.container.webkitRequestFullscreen) {
        PRIVATE.container.webkitRequestFullscreen();
    }
}
function exitFullScreen() {
    if (document.cancelFullScreen) {  
        document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
        document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
        document.webkitCancelFullScreen();  
    }
}
function toggleFullScreen() {
    if (!PRIVATE.container) {
        return;
    }

    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        enterFullScreen();
    } else {
        exitFullScreen();
    }
}
