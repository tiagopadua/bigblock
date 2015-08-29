/* global PRIVATE */

(function() {

    var selectedController = null;

    // Called when a controller is connected
    function onControllerConnect(event) {
        selectedController = event.gamepad;
        console.log('Controller connected', selectedController.id);
    }

    function onControllerDisconnect(event) {
        if (selectedController === null) {
            return;
        }
        if (selectedController === event.gamepad) {
            console.log('Controller disconnecting', selectedController.id);
            selectedController = null;
        }
    }

    // Adds event listeners to handle connect/disconnect of gamepads
    window.addEventListener("gamepadconnected", onControllerConnect);
    window.addEventListener("gamepaddisconnected", onControllerDisconnect);

    // Returns the state of a button
    PRIVATE.isButtonPressed = function(buttonIndex) {
        if (selectedController === null) {
            return false;
        }
        var button = selectedController.buttons[buttonIndex];
        if (!button) {
            return false;
        }
        return button.pressed;
    };

    // Returns the state of an axis
    PRIVATE.axisState = function(axisIndex) {
        if (selectedController === null) {
            return 0;
        }
        var axis = selectedController.axes[axisIndex];
        if (typeof(axis) !== 'number') {
            return 0;
        }
        if (axis > 0) {
            // Dead zone
            if (axis < PRIVATE.controllerZero) {
                return 0;
            }
            return (axis - PRIVATE.controllerZero) / (1 - PRIVATE.controllerZero);
        } else {
            // Dead zone
            if (axis > -PRIVATE.controllerZero) {
                return 0;
            }
            return (axis + PRIVATE.controllerZero) / (1 - PRIVATE.controllerZero);
        }
        return 0;
    };

}());
