/* global requestAnimFrame */

// This is intended to be a singleton - only 1 engine per page
(function(PUBLIC) {
    "use strict";

    // Just create an object to hold variables we do not want to share
    var PRIVATE = {
        FOV: 75, // Field of view for the camera
        scene: null,
        camera: null,
        cameraOffset: new THREE.Vector3(0, 2.5, 3), // Values must be tuned
        renderer: null,
        controllerZero: 0.12, // Minimum movement detection (because the physical controller cannot be at perfect zero)
        walkAxisX: 0,
        walkAxisY: 1,
        runButton: 12,
        cameraAxisX: 3,
        cameraAxisY: 4,
        mainLoopIntervalId: null,
        loaded: false,
        running: false,
        player: null,
        level: null
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
    // !include partials/camera.js


    // Loads all necessary data to start the loop
    PUBLIC.load = function(container) {
        if (!(container instanceof HTMLElement)) {
            console.error('Container must be a DOM element');
        }

        // Create three.js objects
        setupThreeJS(container);

        // Create a player object
        PUBLIC.player = PRIVATE.player = new Player();
        PRIVATE.scene.add(PRIVATE.player.mesh);

        // Load a level
        // TODO: select levels
        PRIVATE.level = new Level(PRIVATE.player);
        PRIVATE.level.addComponentsToScene(PRIVATE.scene);

        // set camera initial position
        PUBLIC.camera = PRIVATE.camera; // TODO remover
 
        // Render first frame
        PRIVATE.lastLoopTime = window.performance.now();
        requestAnimFrame(PRIVATE.mainLoop);

        // Mark things as loaded
        PRIVATE.loaded = true;
    };

    // Starts the main game engine loop
    PUBLIC.start = function() {
        if (!PRIVATE.loaded) {
            console.warn('Cannot start loop without loading things before');
            return;
        }
        if (PRIVATE.running) {
            console.warn('Engine already started. Aborting');
            return;
        }
        PRIVATE.running = true;
        PRIVATE.lastLoopTime = window.performance.now();
        requestAnimFrame(PRIVATE.mainLoop);
    };

    // Stops the main game engine loop
    PUBLIC.stop = function() {
        if (!PRIVATE.running) {
            console.warn('Engine is not running - can\'t stop');
            return;
        }
        PRIVATE.running = false;
    };

    // Returns the state of the engine (true: running; false: stopped)
    PUBLIC.running = function() {
        return PRIVATE.running;
    };

    // This is a user function - intended to be overwritten
    PUBLIC.loop = function(movement) {
        // override to do custom actions
    };

    // The most important function, here we call everything that happens inside the game
    PRIVATE.mainLoop = function() {
        if (PRIVATE.running) {
            // First thing: request next frame to try to maintain consistent fps
            requestAnimFrame(PRIVATE.mainLoop);
        }

        var currentTime = window.performance.now();
        var elapsedTime = currentTime - PRIVATE.lastLoopTime; // Save the time (milliseconds) since the last loop
        PRIVATE.lastLoopTime = currentTime;

        // Save the character's current movement
        var movement = {
            x: PRIVATE.getControllerAxis(PRIVATE.walkAxisX),
            y: PRIVATE.getControllerAxis(PRIVATE.walkAxisY),
            run: PRIVATE.isButtonPressed(PRIVATE.runButton)
        };
        // Save the camera's current movement 
        var cameraMovement = {
            x: PRIVATE.getControllerAxis(PRIVATE.cameraAxisX),
            y: PRIVATE.getControllerAxis(PRIVATE.cameraAxisY)
        };

        // Process player's movements
        PRIVATE.player.animate(elapsedTime, movement, cameraMovement);

        // Position camera
        PRIVATE.followObjectWithCamera(elapsedTime, PRIVATE.player.mesh, PRIVATE.cameraOffset, cameraMovement);

        // Process scenario stuff
        PRIVATE.level.animate(elapsedTime, PRIVATE.player);

        // Call user's function
        try {
            PUBLIC.loop(elapsedTime, movement, cameraMovement);
        } catch (e) {
            // Ok; just ignore user exceptions
        }

        // At last, render the scene
        PRIVATE.renderer.render(PRIVATE.scene, PRIVATE.camera);
    };

}(window.BigBlock = window.BigBlock || {}));
