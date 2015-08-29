// This is intended to be a singleton - only 1 engine per page
(function(cls) {
    "use strict";

    // Loads all necessary data to start the loop
    cls.load = function() {
         // TODO
    };

    // Starts the main game engine loop
    cls.start = function() {
        if (PRIVATE.started || PRIVATE.mainLoopIntervalId) {
            console.error('Engine already started. Aborting');
            return;
        }
        var loopUpdateTime = 1000 / PRIVATE.FPS;
        PRIVATE.lastLoopTime = (new Date()).getTime();
        PRIVATE.mainLoopIntervalId = setInterval(this.mainLoop, loopUpdateTime);
    };

    // Stops the main game engine loop
    cls.stop = function() {
        if (!PRIVATE.mainLoopIntervalId) {
            console.warn('Unable to stop. The interval ID was not found');
            return;
        }
        clearInterval(PRIVATE.mainLoopIntervalId);
        PRIVATE.mainLoopIntervalId = null;
    };

    // Returns the state of the engine (true: running; false: stopped)
    cls.running = function() {
        return (PRIVATE.mainLoopIntervalId !== null);
    };

    var x = document.getElementById('x');
    var y = document.getElementById('y');
    // The most important function, here we call everything that happens inside the game
    cls.mainLoop = function() {
        var currentTime = (new Date()).getTime();
        var elapsedTime = currentTime - PRIVATE.lastLoopTime; // Save the time (milliseconds) since the last loop
        PRIVATE.lastLoopTime = currentTime;

        x.innerHTML = PRIVATE.axisState(PRIVATE.walkAxisX).toString();
        y.innerHTML = PRIVATE.axisState(PRIVATE.walkAxisY).toString();
        //var el = document.getElementById('container');
        //el.innerHTML = PRIVATE.isButtonPressed(0).toString() + " " + elapsedTime.toString();
    };

    // Just create an object to hold variables we do not want to share
    var PRIVATE = {
        FPS: 60, // the framerate which the engine will run
        walkAxisX: 1,
        walkAxisY: 0,
        cameraAxisX: 3,
        cameraAxisY: 2,
        mainLoopIntervalId: null
    };

    // !include partials/controller.js

}(window.BigBlock = window.BigBlock || {}));
