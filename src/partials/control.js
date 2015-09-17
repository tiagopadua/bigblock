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

    // Helper function to simulate a 'dead zone' on the center of the axis of controller
    function applyDeadZone(originalValue, deadZoneAmount) {
        return Math.abs(originalValue) < deadZoneAmount ? 0 : originalValue;
    }
    // Helper function to check if value is in dead zone
    function isInDeadZone(value, deadZoneAmount) {
        return (Math.abs(value) < deadZoneAmount);
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

    // Class that defines movement
    function Movement() {
        this.deadLength = 0;
        this.changedX = false;
        this.changedY = false;
        this.lastX = 0;
        this.lastY = 0;
        this.CHANGED_OFFSET = 0.27; // TODO: calibrate this
    }
    // Inherit
    Movement.prototype = new THREE.Vector2(0, 0);

    // Override set functions, to save last values
    Movement.prototype.setX = function(newValue) {
        this.lastX = this.x;
        this.x = newValue;
        this.changedX = isInDeadZone(this.x, this.CHANGED_OFFSET) !== isInDeadZone(this.lastX, this.CHANGED_OFFSET); 
    };
    Movement.prototype.setY = function(newValue) {
        this.lastY = this.y;
        this.y = newValue;
        this.changedY = isInDeadZone(this.y, this.CHANGED_OFFSET) !== isInDeadZone(this.lastY, this.CHANGED_OFFSET); 
    };
    Movement.prototype.set = function(newValueX, newValueY) {
        this.setX(newValueX);
        this.setY(newValueY);
    };

    // Create control class
    PRIVATE.PlayerControl = function() {

        // Save the current gamepad
        this.gamepad = null;
        this.lastGamepadTimestamp = 0;
        this.gamePadIndex = (function() {
            if (typeof(navigator.getGamepads) !== 'function') {
                return null;
            }
            return (navigator.getGamepads().length > 0) ? 0 : -1;
        })();

        // Store the control's current values
        // Movement info
        this.movement = new Movement();
        this.cameraMovement = new Movement();

        this.gamepadDeadZone = 0.27; // TODO: calibrate this
        this.gamepadAxisTrigger = 0.2; // TODO: calibrate this
        this.setupButtons();

        // Adds event listeners to handle connect/disconnect of gamepads
        var _this = this;
        window.addEventListener("gamepadconnected", function(event) {
            // TODO: pause game and ask if user wants to use this gamepad
            _this.gamepad = event.gamepad;
            _this.gamepadIndex = event.gamepad.index;
            _this.setupButtons();
            console.log('Controller connected', _this.gamepad.index, _this.gamepad.id);
        });
        window.addEventListener("gamepaddisconnected", function(event) {
            if (_this.gamepad.index === event.gamepad.index) {
                _this.gamepad = null;
                _this.gamepadIndex = -1;
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

    // Read every control input and store it
    PRIVATE.PlayerControl.prototype.update = function() {
        if (this.gamepadIndex >= 0) {
            var newGamepadObject = navigator.getGamepads()[this.gamepadIndex];
            if (this.gamepad) {
                this.lastGamepadTimestamp = this.gamepad.timestamp;
            }
            if (newGamepadObject.timestamp !== this.lastGamepadTimestamp) {
                this.gamepad = newGamepadObject;
            }
        }
        this.updatePlayerMovement();
        this.updateCameraMovement();
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
    PRIVATE.PlayerControl.prototype.updatePlayerMovement = function() {
        // First check gamepad
        var checkKeyboard = true;
        this.movement.set(0, 0);
        if (this.gamepad && this.gamepad.connected) {
            var axisX = this.gamepad.axes[this.gamepadAxisX];
            var axisY = this.gamepad.axes[this.gamepadAxisY];
            this.movement.setX(applyDeadZone(axisX, this.gamepadDeadZone));
            this.movement.setY(applyDeadZone(axisY, this.gamepadDeadZone));

            // If there is movement with the gamepad, use it
            if (this.movement.x !== 0 || this.movement.y !== 0) {
                // Soften movements near axis, if is already moving
                if (this.movement.x === 0) {
                    this.movement.x = axisX;
                } else if (this.movement.y === 0) {
                    this.movement.y = axisY;
                }
                checkKeyboard = false;
            }
        }
        // Then check keyboard
        if (checkKeyboard && PUBLIC.keyboard) {
            if (PUBLIC.keyboard.pressed(this.keyboardMoveLeft)) {
                this.movement.setX(this.movement.x - 1);
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveRight)) {
                this.movement.setX(this.movement.x + 1);
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveUp)) {
                this.movement.setY(this.movement.y - 1);
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveDown)) {
                this.movement.setY(this.movement.y + 1);
            }
        }

        // Normalize
        normalizeMovement(this.movement, checkKeyboard ? 0 : this.gamepadDeadZone);
    };

    // Get object with X and Y values for player movement 
    PRIVATE.PlayerControl.prototype.updateCameraMovement = function() {
        var moveX = 0;
        var moveY = 0;
        var checkKeyboard = true;
        // First check gamepad
        if (this.gamepad && this.gamepad.connected) {
            moveX = applyDeadZone(this.gamepad.axes[this.gamepadAxisCameraX], this.gamepadDeadZone);
            moveY = applyDeadZone(this.gamepad.axes[this.gamepadAxisCameraY], this.gamepadDeadZone);
            if (moveX !== 0 || moveY !== 0) {
                // If there is movement with the gamepad, use it
                checkKeyboard = false;
            }
        }
        // Then check keyboard
        if (PUBLIC.keyboard && checkKeyboard) {
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraLeft)) {
                moveX -= 1; // additive, because it may counter the own keyboard opposite key, or the gamepad
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraRight)) {
                moveX += 1; // additive, because it may counter the own keyboard opposite key, or the gamepad
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraUp)) {
                moveY -= 1; // additive, because it may counter the own keyboard opposite key, or the gamepad
            }
            if (PUBLIC.keyboard.pressed(this.keyboardMoveCameraDown)) {
                moveY += 1; // additive, because it may counter the own keyboard opposite key, or the gamepad
            }
        }
        this.cameraMovement.set(moveX, moveY);
    };

})();
