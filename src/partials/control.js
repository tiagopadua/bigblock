/* global . */
/* global THREE */
/* global PUBLIC */
/* global PRIVATE */

// !include partials/keyboard.js

(function() {

    // Helper function to set default gamepad buttons' info
    function setDefaultToggleValues(propNameGamepad, propNameKeyboard) {
        return {
            pressed: false,
            changed: false,
            useAxis: false,
            gamepadButtonId: propNameGamepad, // or AXIS ID if useAxis is true
            keyboardKeyId: propNameKeyboard
        };
    }

    // Helper function to set if button value was changed
    function changeButtonPressedValue(button, newPressed) {
        button.changed = (button.pressed != newPressed); // old value != new
        button.pressed = newPressed;
        return button;
    }


    // Create control class
    PRIVATE.PlayerControl = function() {

        // Save the current gamepad
        this.gamepad = (function() {
            if (typeof(navigator.getGamepads) !== 'function') {
                return null;
            }
            return navigator.getGamepads()[0];
        })();

        // Store the control's current values
        // Movement info
        this.movement = new THREE.Vector2(0, 0);
        this.movement.deadLength = 0;
        this.cameraMovement = {
            x: 0,
            y: 0
        };

        this.gamepadDeadZone = 0.27; // TODO: calibrate this
        this.gamepadAxisTrigger = 0.2; // TODO: calibrate this
        this.setupButtons();


        // Adds event listeners to handle connect/disconnect of gamepads
        var _this = this;
        window.addEventListener("gamepadconnected", function(event) {
            // TODO: pause game and ask if user wants to use this gamepad
            _this.gamepad = event.gamepad;
            _this.setupButtons();
            console.log('Controller connected', _this.gamepad.index, _this.gamepad.id);
        });
        window.addEventListener("gamepaddisconnected", function(event) {
            if (_this.gamepad.id === event.gamepad.id) {
                _this.gamepad = null;
            }
            console.log('Controller disconnected', event.gamepad.index, event.gamepad.id);
        });
    };

    // Setup indexes for gamepad on OSX or 'default' mapping
    PRIVATE.PlayerControl.prototype.setupButtons = function() {
        // First set as if mapping === 'default'
        this.gamepadAxisX = 0;
        this.gamepadAxisY = 1;
        this.gamepadAxisCameraX = 2;
        this.gamepadAxisCameraY = 3;

        this.keyboardMoveUp = 'w';
        this.keyboardMoveDown = 's';
        this.keyboardMoveLeft = 'a';
        this.keyboardMoveRight = 'd';

        this.keyboardMoveCameraUp = PUBLIC.keyboard.UP;
        this.keyboardMoveCameraDown = PUBLIC.keyboard.DOWN;
        this.keyboardMoveCameraLeft = PUBLIC.keyboard.LEFT;
        this.keyboardMoveCameraRight = PUBLIC.keyboard.RIGHT;

        this.up    = setDefaultToggleValues(12, PUBLIC.keyboard.UP);
        this.down  = setDefaultToggleValues(13, PUBLIC.keyboard.DOWN);
        this.left  = setDefaultToggleValues(14, PUBLIC.keyboard.LEFT);
        this.right = setDefaultToggleValues(15, PUBLIC.keyboard.RIGHT);

        this.run        = setDefaultToggleValues(1, PUBLIC.keyboard.SHIFT);
        this.interact   = setDefaultToggleValues(0, 'f');
        this.swapWeapon = setDefaultToggleValues(3, 'r');
        this.useItem    = setDefaultToggleValues(2, 'c');
        this.jump       = setDefaultToggleValues(10, PUBLIC.keyboard.SPACE);
        this.focus      = setDefaultToggleValues(11, PUBLIC.keyboard.TAB);

        this.leftAttack = setDefaultToggleValues(4, 'q');
        this.rightAttack = setDefaultToggleValues(5, 'e');
        this.leftAttackStrong = setDefaultToggleValues(6, 'q');
        this.rightAttackStrong = setDefaultToggleValues(7, 'e');

        if (this.gamepad && this.gamepad.mapping === "") {
            this.gamepadAxisCameraX = 3;
            this.gamepadAxisCameraY = 4;

            this.up.gamepadButtonId = 0;
            this.down.gamepadButtonId = 1;
            this.left.gamepadButtonId = 2;
            this.right.gamepadButtonId = 3;

            this.run.gamepadButtonId = 12;
            this.interact.gamepadButtonId = 11;
            this.swapWeapon.gamepadButtonId = 14; 
            this.useItem.gamepadButtonId = 13;
            this.jump.gamepadButtonId = 6;
            this.focus.gamepadButtonId = 7;
    
            this.leftAttack.gamepadButtonId = 8;
            this.rightAttack.gamepadButtonId = 9;
            this.leftAttackStrong.gamepadButtonId = 2;
            this.rightAttackStrong.gamepadButtonId = 5;
            this.leftAttackStrong.useAxis = true;
            this.rightAttackStrong.useAxis = true;
        }
    };

    // Generic function to check a gamepad button or keyboard
    PRIVATE.PlayerControl.prototype.updateButtonState = function(button) {
        // Check gamepad button status
        if (this.gamepad && this.gamepad.connected) {
            if ((button.useAxis && (this.gamepad.axes[button.gamepadButtonId] > this.gamepadAxisTrigger)) ||
                this.gamepad.buttons[button.gamepadButtonId].pressed) { 
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
        this.updateButtonState(this.up);
        this.updateButtonState(this.down);
        this.updateButtonState(this.left);
        this.updateButtonState(this.right);

        this.updateButtonState(this.run);
        this.updateButtonState(this.swapWeapon);
        this.updateButtonState(this.interact);
        this.updateButtonState(this.useItem);
        this.updateButtonState(this.jump);
        this.updateButtonState(this.focus);

        this.updateButtonState(this.leftAttack);
        this.updateButtonState(this.rightAttack);
        
        if (this.leftAttack.useAxis) {
            
        } else {
            this.updateButtonState(this.leftAttackStrong);
            this.updateButtonState(this.rightAttackStrong);
        }
    };

    // Get object with X and Y values for player movement 
    PRIVATE.PlayerControl.prototype.getPlayerMovement = function() {
        var movement = new THREE.Vector2();

        // First check gamepad
        var checkKeyboard = true;
        if (this.gamepad && this.gamepad.connected) {
            var axisX = this.gamepad.axes[this.gamepadAxisX];
            var axisY = this.gamepad.axes[this.gamepadAxisY];
            movement.x = applyDeadZone(axisX, this.gamepadDeadZone);
            movement.y = applyDeadZone(axisY, this.gamepadDeadZone);

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
            if (PUBLIC.keyboard.pressed(this.keyboardMoveLeft)) {
                movement.x -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveRight)) {
                movement.x += 1;
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveUp)) {
                movement.y -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveDown)) {
                movement.y += 1;
            }
        }

        // Normalize, save and return
        this.lastMovement = normalizeMovement(movement, checkKeyboard ? 0 : this.gamepadDeadZone);
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
            movement.x = applyDeadZone(this.gamepad.axes[this.gamepadAxisCameraX], this.gamepadDeadZone);
            movement.y = applyDeadZone(this.gamepad.axes[this.gamepadAxisCameraY], this.gamepadDeadZone);
            if (movement.x !== 0 || movement.y !== 0) {
                // If there is movement with the gamepad, use it
                return movement;
            }
        }
        // Then check keyboard
        if (PUBLIC.keyboard) {
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraLeft)) {
                movement.x -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraRight)) {
                movement.x += 1;
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraUp)) {
                movement.y -= 1;
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraDown)) {
                movement.y += 1;
            }
        }
        return movement;
    };

})();
