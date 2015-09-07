/* global THREE */
/* global PUBLIC */
/* global PRIVATE */

// !include partials/keyboard.js

(function() {

    PRIVATE.PlayerControl = function() {

        // Store the control's current values
        // Movement info
        this.movement = new THREE.Vector2(0, 0);
        this.movement.deadLength = 0;
        this.cameraMovement = {
            x: 0,
            y: 0
        };
        // Toggle buttons' info
        function setDefaultToggleValues(propNameGamepad, propNameKeyboard) {
            return {
                pressed: false,
                changed: false,
                gamepadButtonId: propNameGamepad,
                keyboardKeyId: propNameKeyboard
            };
        }
        this.up    = setDefaultToggleValues(0, PUBLIC.keyboard.UP);
        this.down  = setDefaultToggleValues(1, PUBLIC.keyboard.DOWN);
        this.left  = setDefaultToggleValues(2, PUBLIC.keyboard.LEFT);
        this.right = setDefaultToggleValues(3, PUBLIC.keyboard.RIGHT);
        this.run   = setDefaultToggleValues(12, PUBLIC.keyboard.SHIFT);

        this.yes = setDefaultToggleValues(9, 'y');
        this.no  = setDefaultToggleValues(8, 'n');

        // Save the current gamepad
        this.gamepad = (function() {
            if (typeof(navigator.getGamepads) !== 'function') {
                return undefined;
            }
            return navigator.getGamepads()[0];
        })();

        // Set the methods of input
        this.input = {
            keyboard: {
                // In-game player actions
                movementLeft: 'a',
                movementRight: 'd',
                movementForward: 'w',
                movementBackward: 's',
                cameraMovementLeft: PUBLIC.keyboard.LEFT,
                cameraMovementRight: PUBLIC.keyboard.RIGHT,
                cameraMovementUp: PUBLIC.keyboard.UP,
                cameraMovementDown: PUBLIC.keyboard.DOWN,
                run: PUBLIC.keyboard.SHIFT,
                jump: PUBLIC.keyboard.SPACE,
                glitch: 'r', // We call "glitching" the equivalent of "rolling" on Dark Souls
                focus: PUBLIC.keyboard.TAB,
                attackLeft: 'q',
                attackRight: 'e',
                attackLeftStrong: '1',
                attackRightStrong: '3',
                interact: 'f',
        
                // Menu and other controls
                pause: PUBLIC.keyboard.ESC,
                resume: PUBLIC.keyboard.ESC,
                up: PUBLIC.keyboard.UP,
                down: PUBLIC.keyboard.DOWN,
                left: PUBLIC.keyboard.LEFT,
                right: PUBLIC.keyboard.RIGHT
            },
            gamepad: {
                // Dead zone for axis
                deadZone: 0.15, // TODO: adjust this value

                // In-game player actions
                movementX: 0, // index of axis
                movementY: 1,
                cameraMovementX: 3,
                cameraMovementY: 4,
                run: 12,
                jump: 6,
                glitch: 12, // We call "glitching" the equivalent of "rolling" on Dark Souls
                focus: 7,
                attackLeft: 8,
                attackRight: 9,
                attackLeftStrong: 2, // axis
                attackRightStrong: 5, // axis
                interact: 11,
        
                // Menu and other controls
                pause: 4,
                resume: 4,
                up: 0,
                down: 1,
                left: 2,
                right: 3
            }
        };

        // Adds event listeners to handle connect/disconnect of gamepads
        var thisController = this;
        window.addEventListener("gamepadconnected", function(event) {
            thisController.gamepad = event.gamepad;
            console.log('Controller connected', thisController.gamepad.index, thisController.gamepad.id);
        });
        window.addEventListener("gamepaddisconnected", function(event) {
            if (thisController.gamepad.id === event.gamepad.id) {
                thisController.gamepad = null;
            }
            console.log('Controller disconnected', event.gamepad.index, event.gamepad.id);
        });
    };

    // Generic function to set if button value was changed
    function changeButtonPressedValue(button, newPressed) {
        button.changed = (button.pressed != newPressed); // old value != new
        button.pressed = newPressed;
        return button;
    }

    // Generic function to check a gamepad button or keyboard
    PRIVATE.PlayerControl.prototype.updateButtonState = function(button) {
        // Check gamepad button status
        if (this.gamepad && this.gamepad.connected) {
            if (this.gamepad.buttons[button.gamepadButtonId].pressed) { 
                return changeButtonPressedValue(button, true);
            }
            // If not pressed, must check keyboard before returning
        }
        // Now check keyboard status
        if (PUBLIC.keyboard) {
            return changeButtonPressedValue(button, PUBLIC.keyboard.pressed(button.keyboardKeyId));
        }
        return changeButtonPressedValue(button, false); // Default not pressed
    };

    // Helper function to simulate a 'dead zone' on the center of the axis of controller
    function applyDeadZone(originalValue, deadZoneAmount) {
        return Math.abs(originalValue) < deadZoneAmount ? 0 : originalValue;
    }

    // Normalize the movement and set variables
    function normalizeMovement(movement, deadZone) {
        // Only normalize if it is bigger than unit vector
        if (movement.length() > 1) {
            movement.normalize();
        }
        // Set the length considering dead zone
        movement.deadLength = movement.length() - (deadZone || 0);

        return movement;
    }

    // Read every control input and store it
    PRIVATE.PlayerControl.prototype.update = function() {
        this.movement = this.getPlayerMovement();
        this.cameraMovement = this.getCameraMovement();
        this.updateButtonState(this.run);
        this.updateButtonState(this.up);
        this.updateButtonState(this.down);
        this.updateButtonState(this.left);
        this.updateButtonState(this.right);

        this.updateButtonState(this.yes);
        this.updateButtonState(this.no);
    };

    // Get object with X and Y values for player movement 
    PRIVATE.PlayerControl.prototype.getPlayerMovement = function() {
        var movement = new THREE.Vector2();

        // First check gamepad
        var checkKeyboard = true;
        if (this.gamepad && this.gamepad.connected) {
            var axisX = this.gamepad.axes[this.input.gamepad.movementX];
            var axisY = this.gamepad.axes[this.input.gamepad.movementY];
            movement.x = applyDeadZone(axisX, this.input.gamepad.deadZone);
            movement.y = applyDeadZone(axisY, this.input.gamepad.deadZone);

            // If there is movement with the gamepad, use it
            if (movement.x !== 0 || movement.y !== 0) {
                // Soften movements near axis, if is already moving
                if (movement.x === 0) {
                    movement.x = axisX;
                } else if (movement.y === 0) {
                    movement.y = axisY;
                }
                checkKeyboard = false;
            }
        }
        // Then check keyboard
        if (checkKeyboard && PUBLIC.keyboard) {
            if (PUBLIC.keyboard.pressed(this.input.keyboard.movementLeft)) {
                movement.x -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.input.keyboard.movementRight)) {
                movement.x += 1;
            }
            if (PUBLIC.keyboard.pressed(this.input.keyboard.movementForward)) {
                movement.y -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.input.keyboard.movementBackward)) {
                movement.y += 1;
            }
        }

        // Normalize, save and return
        this.lastMovement = normalizeMovement(movement, checkKeyboard ? 0 : this.input.gamepad.deadZone);
        return this.lastMovement;
    };

    // Get object with X and Y values for player movement 
    PRIVATE.PlayerControl.prototype.getCameraMovement = function() {
        // Default value is stopped
        var movement = {
            x: 0,
            y: 0
        };

        // First check gamepad
        if (this.gamepad && this.gamepad.connected) {
            movement.x = applyDeadZone(this.gamepad.axes[this.input.gamepad.cameraMovementX], this.input.gamepad.deadZone);
            movement.y = applyDeadZone(this.gamepad.axes[this.input.gamepad.cameraMovementY], this.input.gamepad.deadZone);
            if (movement.x !== 0 || movement.y !== 0) {
                // If there is movement with the gamepad, use it
                return movement;
            }
        }
        // Then check keyboard
        if (PUBLIC.keyboard) {
            if (PUBLIC.keyboard.pressed(this.input.keyboard.cameraMovementLeft)) {
                movement.x -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.input.keyboard.cameraMovementRight)) {
                movement.x += 1;
            }
            if (PUBLIC.keyboard.pressed(this.input.keyboard.cameraMovementUp)) {
                movement.y -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.input.keyboard.cameraMovementDown)) {
                movement.y += 1;
            }
        }
        return movement;
    };

})();
