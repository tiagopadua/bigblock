/* global PUBLIC */
/* global PRIVATE */

// !include partials/keyboard.js

(function() {

    Math.SIN45 = Math.COS45 = Math.sin(Math.PI / 4);

    PRIVATE.PlayerControl = function() {

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

    // Generic function to check a gamepad button or keyboard
    function getButtonState(gamepad, buttonIndex, keyIndex) {
        // Check gamepad button status
        if (gamepad && gamepad.connected) {
            if (gamepad.buttons[buttonIndex].pressed) { 
                return true;
            }
            // If not pressed, must check keyboard before returning
        }
        // Now check keyboard status
        if (PUBLIC.keyboard) {
            return PUBLIC.keyboard.pressed[keyIndex];
        }
        return false; // Default not pressed
    }

    // Checks if player should be running
    PRIVATE.PlayerControl.prototype.isRunning = function() {
        // Just call default function with correct keys
        return false;/*
        return getButtonState(this.gamepad,
                              this.input.gamepad.run,
                              this.input.keyboard.run);*/
    };

    // Helper function to simulate a 'dead zone' on the center of the axis of controller
    function applyDeadZone(originalValue, deadZoneAmount) {
        return Math.abs(originalValue) < deadZoneAmount ? 0 : originalValue;
        /*
        if (originalValue > 0) {
            if (originalValue < deadZoneAmount) {
                return 0;
            }
            return (originalValue - deadZoneAmount) / (1 - deadZoneAmount); 
        }
        // originalValue <= 0
        if (originalValue > -deadZoneAmount) {
            return 0;
        }
        return (originalValue + deadZoneAmount) / (1 - deadZoneAmount);
        */
    }

    // Get object with X and Y values for player movement 
    PRIVATE.PlayerControl.prototype.getPlayerMovement = function() {
        // Default value is stopped
        var movement = {
            x: 0,
            y: 0,
            run: this.isRunning()
        };

        // First check gamepad
        if (this.gamepad && this.gamepad.connected) {
            var axisX = this.gamepad.axes[this.input.gamepad.movementX];
            var axisY = this.gamepad.axes[this.input.gamepad.movementY];
            movement.x = applyDeadZone(axisX, this.input.gamepad.deadZone);
            movement.y = applyDeadZone(axisY, this.input.gamepad.deadZone);
            if (movement.x !== 0 || movement.y !== 0) {
                // Soften movements near axis, if is already moving
                if (movement.x === 0) {
                    movement.x = axisX;
                } else if (movement.y === 0) {
                    movement.y = axisY;
                }
                // If there is movement with the gamepad, use it
                return movement;
            }
        }
        // Then check keyboard
        if (PUBLIC.keyboard) {
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
            // normalize speed
            if (movement.x !== 0 && movement.y !== 0) {
                movement.x *= Math.SIN45;
                movement.y *= Math.COS45;
            }
        }
        return movement;
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
            // normalize speed
            if (movement.x !== 0 && movement.y !== 0) {
                movement.x *= Math.SIN45;
                movement.y *= Math.COS45;
            }
        }
        return movement;
    };

})();
