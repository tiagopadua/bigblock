/* global PRIVATE */
/* global enterFullScreen */

/*
 * This file contains everything needed to capture the mouse movement and control the camera
 */

(function bigBlockMouse() {
    var mouseDeltaX = 0.0;
    var mouseDeltaY = 0.0;
    var supportPointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    // Mouse influence on camera speed
    PRIVATE.mouseLocked = false;
    PRIVATE.MOUSE_MOVEMENT_SPEED = 0.1;
    // Holds the mouse buttons' state
    PRIVATE.mouseButtonState = [ false, false, false, false, false ];

    // Set mouse hiding
    PRIVATE.setupMouse = function(targetElement) {
        if (!(targetElement instanceof HTMLElement)) {
            return console.warn('Pointer Lock\'s target element is invalid');
        }

        // Set the lock element
        if (!supportPointerLock) {
            return console.warn('Browser does NOT support pointer locking. Ignoring mouse...');
        }

        // Define callback functions
        function onPointerLockChanged(event) {
            if (document.pointerLockElement === targetElement || document.mozPointerLockElement === targetElement || document.webkitPointerLockElement === targetElement) {
                PRIVATE.mouseLocked = true;
                // Listen to mouse movement
                targetElement.addEventListener('mousemove', onMouseMove, false);
            } else {
                PRIVATE.mouseLocked = false;
                // Remove listener
                targetElement.removeEventListener('mousemove', onMouseMove);
                exitFullScreen();
                PUBLIC.pause();
            }
        }
        function onPointerLockError(event) {
            PRIVATE.mouseLocked = false;
            console.error('Pointer lock error', event);
        }

        // Listen to lock changes
        document.addEventListener('pointerlockchange', onPointerLockChanged, false);
        document.addEventListener('mozpointerlockchange', onPointerLockChanged, false);
        document.addEventListener('webkitpointerlockchange', onPointerLockChanged, false);

        document.addEventListener('pointerlockerror', onPointerLockError, false);
        document.addEventListener('mozpointerlockerror', onPointerLockError, false);
        document.addEventListener('webkitpointerlockerror', onPointerLockError, false);

        // Mouse events
        function onMouseMove(event) {
            mouseDeltaX += PRIVATE.MOUSE_MOVEMENT_SPEED * (event.movementX || event.mozMovementX || event.webkitMovementX || 0.0);
            mouseDeltaY += PRIVATE.MOUSE_MOVEMENT_SPEED * (event.movementY || event.mozMovementY || event.webkitMovementY || 0.0);
        }

        // Request lock on element click
        targetElement.requestPointerLock = targetElement.requestPointerLock || targetElement.mozRequestPointerLock || targetElement.webkitRequestPointerLock;
        targetElement.addEventListener('click', function() {
            // Only let control with mouse when full-screen
            function onFullscreenChanged(event) {
                if (document.fullscreenElement === targetElement || document.mozFullScreenElement === targetElement || document.webkitFullscreenElement === targetElement) {
                    document.removeEventListener('fullscreenchange', onFullscreenChanged);
                    document.removeEventListener('mozfullscreenchange', onFullscreenChanged);
                    document.removeEventListener('webkitfullscreenchange', onFullscreenChanged);
                    targetElement.requestPointerLock();
                }
            }

            document.addEventListener('fullscreenchange', onFullscreenChanged, false);
            document.addEventListener('mozfullscreenchange', onFullscreenChanged, false);
            document.addEventListener('webkitfullscreenchange', onFullscreenChanged, false);

            enterFullScreen();
        }, false);

        // Save mouse buttons' state
        targetElement.addEventListener('mousedown', function(mouseEvent) {
            PRIVATE.mouseButtonState[mouseEvent.which] = true;
        });
        targetElement.addEventListener('mouseup', function(mouseEvent) {
            PRIVATE.mouseButtonState[mouseEvent.which] = false;
        });
    };

    // Returns mouse movement
    PRIVATE.getMouseMovement = function() {
        // Set result object
        var movement = {
            x: mouseDeltaX,
            y: mouseDeltaY
        };
        // Reset the delta
        mouseDeltaX = mouseDeltaY = 0.0;

        return movement;
    };
})();
