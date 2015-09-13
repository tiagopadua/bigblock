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
    var maxDistanceToPlayer = 400; // Distance SQUARED

    // 1. Create a line starting on player's position
    //    And going on the direction of camera's X-Z rotation
    //    The line must have pre-defined length
    var line = new THREE.Line3();
    line.end.z = -focusLineLength;
    line.applyMatrix4(PRIVATE.camera.matrixWorld);
/*
    var material = new THREE.LineBasicMaterial(0xffff00);
    material.linewidth = 5;
    material.depthTest = false;
    var geometry = new THREE.Geometry();
    geometry.vertices.push(line.start, line.end);

    var objectLine = new THREE.Line(geometry, material);
    PRIVATE.scene.add(objectLine);
*/
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

/*
        // Draw!
        material = new THREE.MeshBasicMaterial();
        material.color = enemy.mesh.material.materials[0].color;
        material.depthTest = false;
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        var circle = new THREE.Mesh(geometry, material);
        circle.position.set(closestPoint.x, closestPoint.y, closestPoint.z);
        PRIVATE.scene.add(circle);
*/
        // Calculate the squared distance between the enemy and point on line
        distanceEnemy = closestPoint.distanceToSquared(enemy.mesh.position);

        // Now the distance betwen point on line and start of line
        distanceOrigin = closestPoint.distanceToSquared(line.start);

        // And distance of the enemy to player position
        distancePlayer = enemy.mesh.position.distanceToSquared(PRIVATE.player.mesh.position); 

        // Normalize distance
        distanceNormalized = distanceEnemy / distanceOrigin;
        console.log(i, distanceNormalized);

        // 3. Pick the closest one
        //    We have a minimum distance
        if (distanceNormalized < closest.distance &&
            distancePlayer < maxDistanceToPlayer) {
            closest.distance = distanceNormalized;
            closest.enemy = enemy;
        }
    }

    return closest.enemy; // null if did not find any

    // TODO: really search for the nearest enemy in front
    //return PRIVATE.level.enemies[0];
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
