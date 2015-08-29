/* global requestAnimFrame */

// This is intended to be a singleton - only 1 engine per page
(function(cls) {
    "use strict";

    // Just create an object to hold variables we do not want to share
    var PRIVATE = {
        FOV: 75, // Field of view for the camera
        scene: null,
        camera: null,
        renderer: null,
        controllerZero: 0.1, // Minimum movement detection (because the physical controller cannot be at perfect zero)
        walkAxisX: 0,
        walkAxisY: 1,
        cameraAxisX: 3,
        cameraAxisY: 4,
        mainLoopIntervalId: null,
        loaded: false,
        running: false,
        player: null
    };

    // Shim layer with setTimeout fallback
    window.requestAnimFrame = window.requestAnimationFrame       ||
                              window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame    ||
                              function(callback) {
                                  window.setTimeout(callback, 1000 / 60); // 60 fps
                              };


    /*
     * Include other parts of the code
     * This is processed in build time before uglyfication
     */

    // !include partials/controller.js
    // !include partials/player.js
    // !include partials/level.js
    // !include partials/setup.js


    // Loads all necessary data to start the loop
    cls.load = function(container) {
        if (!(container instanceof HTMLElement)) {
            console.error('Container must be a DOM element');
        }

        // Create three.js objects
        setupThreeJS(container);

        // Create a player object
        PRIVATE.player = new Player();
        PRIVATE.scene.add(PRIVATE.player.mesh);

        // Load a level
        // TODO: select levels
        var level = new Level();
        PRIVATE.scene.add(level.mesh);

        // set camera initial position
        PRIVATE.camera.position.z = 4;
        PRIVATE.camera.position.y = 4;
        PRIVATE.camera.lookAt(PRIVATE.player.getPosition());

        // Render first frame
        PRIVATE.renderer.render(PRIVATE.scene, PRIVATE.camera);

        // Mark things as loaded
        PRIVATE.loaded = true;
    };

    // Starts the main game engine loop
    cls.start = function() {
        if (!PRIVATE.loaded) {
            console.warn('Cannot start loop without loading things before');
            return;
        }
        if (PRIVATE.started || PRIVATE.mainLoopIntervalId) {
            console.warn('Engine already started. Aborting');
            return;
        }
        PRIVATE.running = true;
        PRIVATE.lastLoopTime = window.performance.now();
        requestAnimFrame(PRIVATE.mainLoop);
    };

    // Stops the main game engine loop
    cls.stop = function() {
        if (!PRIVATE.running) {
            console.warn('Engine is not running - can\'t stop');
            return;
        }
        PRIVATE.running = false;
    };

    // Returns the state of the engine (true: running; false: stopped)
    cls.running = function() {
        return PRIVATE.running;
    };

    // This is a user function - intended to be overwritten
    cls.loop = function(movement) {
        // override to do custom actions
    };

    // The most important function, here we call everything that happens inside the game
    PRIVATE.mainLoop = function() {
        if (!PRIVATE.running) {
            return;
        }

        // First thing: request next frame to try to maintain consistent fps
        requestAnimFrame(PRIVATE.mainLoop);

        var currentTime = window.performance.now();
        var elapsedTime = currentTime - PRIVATE.lastLoopTime; // Save the time (milliseconds) since the last loop
        PRIVATE.lastLoopTime = currentTime;

        // Save the character's current movement
        var movement = {
            x: PRIVATE.axisState(PRIVATE.walkAxisX),
            y: -PRIVATE.axisState(PRIVATE.walkAxisY)
        };
        // Save the camera's current movement 
        var cameraMovement = {
            x: PRIVATE.axisState(PRIVATE.cameraAxisX),
            y: -PRIVATE.axisState(PRIVATE.cameraAxisY)
        };

        // Process player's movements
        PRIVATE.player.animate(elapsedTime, movement, cameraMovement);

        // Always point camera at player
        PRIVATE.camera.lookAt(PRIVATE.player.getPosition());

        // Call user's function
        try {
            cls.loop(elapsedTime, movement, cameraMovement);
        } catch (e) {
            // Ok; just ignore user exceptions
        }

        // At last, render the scene
        PRIVATE.renderer.render(PRIVATE.scene, PRIVATE.camera);
    };

}(window.BigBlock = window.BigBlock || {}));
