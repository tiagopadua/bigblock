/* global loadFocusTexture */
/* global Level */
/* global toggleFullScreen */
/* global clock */
/* global BasicShield */
/* global BigSwordTest */
/* global setupThreeJS */
/* global requestAnimFrame */

// This is intended to be a singleton - only 1 engine per page
// The parameter PUBLIC is the only public object (window.BigBlock).
// It is named this way to be explicit that you are making some thing accessible for end user
(function bigBlockMain(PUBLIC) {
    'use strict';

    // Just create an object to hold variables we do not want to let others take control
    var PRIVATE = {
        FOV: 75, // Field of view for the camera
        scene: null,
        camera: null,
        cameraOffset: new THREE.Vector3(0, 5, 10), // Values must be tuned
        renderer: null,
        control: null,
        mainLoopIntervalId: null,
        loaded: false,
        running: false,
        player: null,
        level: null,
        focusTexture: null
    };

    // Shim layer with setTimeout fallback
    var requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           function(callback) {
                               window.setTimeout(callback, 1000 / 60); // 60 fps
                           };


    /*
     * Include other parts of the code
     * This is processed in build time (grunt task 'concat') before minification
     */

    // !include src/js/partials/helpers.js
    // !include src/js/partials/shaders.js
    // !include src/js/controls/control.js
    // !include src/js/characters/character.js
    // !include src/js/characters/enemies/first.js
    // !include src/js/characters/player.js
    // !include src/js/partials/hud.js
    // !include src/js/partials/loading.js
    // !include src/js/equipment/weapon.js
    // !include src/js/levels/level.js
    // !include src/js/partials/setup.js
    // !include src/js/controls/camera.js
    // !include src/js/audio/audio.js


    // Loads all necessary data to start the loop
    PUBLIC.load = function(container, autoStart, inputWidth, inputHeight) {
        PRIVATE.width = inputWidth;
        PRIVATE.height = inputHeight;
        PRIVATE.container = container;

        // Check container
        if (typeof(PRIVATE.container) === 'undefined' ||
            PRIVATE.container === null ||
            PRIVATE.container === document.body) {
            // Defaults to <body>
            PRIVATE.container = document.body;
            if (!PRIVATE.width) {
                PRIVATE.width = window.innerWidth;
            }
            if (!PRIVATE.height) {
                PRIVATE.height = window.innerHeight;
            }
        } else if (!(PRIVATE.container instanceof HTMLElement)) {
            return console.error('Container must be a DOM element. Received:', typeof(PRIVATE.container));
        }

        // Set up hud elements
        PRIVATE.renderHud();
        PRIVATE.renderLoadingScreen();

        // Prepare pointer locking on the container click
        PRIVATE.setupMouse(PRIVATE.container);

        // Create three.js stuff
        PRIVATE.setupThreeJS();

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

        // Pre-load the focus image file
        loadFocusTexture();

        // Load everything async
        Promise.all([
            PRIVATE.player.load(),
            PRIVATE.level.load()
        ]).then(function() {
            PRIVATE.player.addComponentsToScene(PRIVATE.scene);
            PRIVATE.level.addComponentsToScene(PRIVATE.scene);

            // set camera initial position
            PRIVATE.camera.position.set(PRIVATE.cameraOffset.x, PRIVATE.cameraOffset.y, PRIVATE.cameraOffset.z);
            PUBLIC.camera = PRIVATE.camera; // TODO remover

            // Load weapon and shield
            // TODO: must read save file or new game option
            var weaponTest = new BigSwordTest();
            var shieldTest = new BasicShield();
            Promise.all([weaponTest.load(), shieldTest.load()]).then(function(equipment) {
                PRIVATE.player.attachEquipmentRight(equipment[0]);
                PRIVATE.player.attachEquipmentLeft(equipment[1]);

                // Mark things as loaded
                PRIVATE.loaded = true;
                PRIVATE.hideLoadingScreen();
    
                // Render first frame
                requestAnimFrame(PRIVATE.mainLoop);
                PRIVATE.updateHud();

                console.info('Finished loading BigBlock');
    
                if (autoStart) {
                    PUBLIC.start();
                }
            }).catch(function(error) {
                console.error('Error loading; Aborting;', error);
            });
        }).catch(function(error) {
            console.error('Error loading; Aborting;', error);
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
        PRIVATE.startHudTimer();
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
