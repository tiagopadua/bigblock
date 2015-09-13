/* global Level */
/* global toggleFullScreen */
/* global clock */
/* global BasicShield */
/* global BigSwordTest */
/* global setupThreeJS */
/* global requestAnimFrame */

// This is intended to be a singleton - only 1 engine per page
(function(PUBLIC) {
    "use strict";

    // Just create an object to hold variables we do not want to share
    var PRIVATE = {
        FOV: 75, // Field of view for the camera
        scene: null,
        camera: null,
        cameraOffset: new THREE.Vector3(0, 6, 11), // Values must be tuned
        renderer: null,
        control: null,
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
     * This is processed in build time (grunt task 'concat') before minification
     */

    // !include partials/helpers.js
    // !include partials/shaders.js
    // !include partials/control.js
    // !include partials/character.js
    // !include partials/enemies/first.js
    // !include partials/player.js
    // !include partials/weapon.js
    // !include partials/level.js
    // !include partials/setup.js
    // !include partials/camera.js


    // Loads all necessary data to start the loop
    PUBLIC.load = function(container, autoStart, inputWidth, inputHeight) {
        PRIVATE.width = inputWidth;
        PRIVATE.height = inputHeight;
        PRIVATE.container = container;

        // Create three.js stuff
        setupThreeJS();

        if (typeof(autoStart) !== 'boolean') {
            autoStart = true; // Default is start automatically
        }

        // Setup controls
        PRIVATE.control = new PRIVATE.PlayerControl();

        // Create a player object
        PUBLIC.player = PRIVATE.player = new Player();
        PUBLIC.scene = PRIVATE.scene;
        PRIVATE.scene.add(PRIVATE.player.moveTarget);

        // Load a level
        // TODO: select levels from save file or new game
        PUBLIC.level = PRIVATE.level = new Level();

        // Load everything async
        Promise.all([
            PRIVATE.player.load(),
            PRIVATE.level.load()
        ]).then(function(objs) {
            // objs[0] = player mesh
            // objs[1] = level objects
            PRIVATE.scene.add(objs[0]);
            PRIVATE.level.addComponentsToScene(PRIVATE.scene);

            // Load weapon and shield
            // TODO: must read save file or new game option
            var weaponTest = new BigSwordTest();
            weaponTest.load(function(weapon) {
                PRIVATE.player.attachEquipmentRight(weapon);
            });
            var shieldTest = new BasicShield();
            shieldTest.load(function(shield) {
                PRIVATE.player.attachEquipmentLeft(shield);
            });

            // set camera initial position
            PRIVATE.camera.position.set(PRIVATE.cameraOffset.x, PRIVATE.cameraOffset.y, PRIVATE.cameraOffset.z);
            PUBLIC.camera = PRIVATE.camera; // TODO remover

            // Mark things as loaded
            PRIVATE.loaded = true;

            // Render first frame
            requestAnimFrame(PRIVATE.mainLoop);
            console.info("Finished loading BigBlock");

            if (autoStart) {
                PUBLIC.start();
            }

        }).catch(function(error) {
            console.error('Aborting;', error);
        });
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

        var elapsedTime = clock.getDelta(); // Seconds since last call

        // Update the control's input status
        PRIVATE.control.update();

        // Animate objects
        THREE.AnimationHandler.update(elapsedTime);

        // Process player's movements
        PRIVATE.player.update(elapsedTime);

        // Position camera
        PRIVATE.followObjectWithCamera(elapsedTime, PRIVATE.player.getCameraTarget());

        // Process scenario stuff
        PRIVATE.level.update(elapsedTime);

        // Call user's function
        try {
            PUBLIC.loop(elapsedTime, PRIVATE.control.movement, PRIVATE.control.cameraMovement);
        } catch (e) {
            // Ok; just ignore user exceptions
        }

        // At last, render the scene
        PRIVATE.renderer.render(PRIVATE.scene, PRIVATE.camera);
    };

})(window.BigBlock = window.BigBlock || {});
