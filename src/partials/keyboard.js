/* global PUBLIC */

/*
 * Handles keyboard events and store key states
 *
 * Based on https://github.com/jeromeetienne/threex.keyboardstate
 * But only what we need, and less buggy
 *
 */
 
 (function() {

    var keyCodes = [];
    //var modifiers = [];

     // Add listreners
    document.body.addEventListener('keydown', function(event) {
        keyCodes[event.keyCode] = true;
        event.preventDefault();
    });
    document.body.addEventListener('keyup', function(event) {
        keyCodes[event.keyCode] = false;
        event.preventDefault();
    });

    PUBLIC.keyboard = {
        // Define some key codes
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SPACE: 32,
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        DEL: 46,
        BACKSPACE: 8,
        TAB: 9,
        ESCAPE: 27,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        CAPSLOCK: 20,
        WINDOWS: 91,
        WINDOWS_RIGHT: 93,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        // Function to return if a key is pressed or not
        pressed: function(key) {
            // Simply check type to make sure we have the 'charCodeAt' function
            switch(typeof(key)) {
                case 'string':
                    key = key.toUpperCase().charCodeAt(0);
                    break;
                case 'number':
                    break;
                default:
                    return false;
            }
            // "!!" converts to boolean if is undefined or null
            return !!(keyCodes[key]);
        }
     };

 })();
 