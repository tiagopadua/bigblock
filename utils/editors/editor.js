'use strict';

(function(PUBLIC) {

    PUBLIC.FOV = 75;
    PUBLIC.MIN_DRAW = 0.1;
    PUBLIC.MAX_DRAW = 1000;

    PUBLIC.meshes = [];
    PUBLIC.lights = [];

    // Templates
    PUBLIC.templates = {
        listItem: '<li>#VALUE#</li>',
        checkbox: '<label><input type="checkbox" name="#NAME#" value="#VALUE#">#VALUE#</label>'
    };

    // Initialize 3d scene with three.js
    PUBLIC.setupScene = function(domTarget) {
        // Save the container
        PUBLIC.container = domTarget;

        // Set width and height - if not already defined
        if (!PUBLIC.width) {
            PUBLIC.width = domTarget.offsetWidth;
        }
        if (!PUBLIC.height) {
            PUBLIC.height = domTarget.offsetHeight;
        }

        // Set up THREE.js base objects
        PUBLIC.scene = new THREE.Scene();
        PUBLIC.camera = new THREE.PerspectiveCamera(
            PUBLIC.FOV,
            PUBLIC.width / PUBLIC.height,
            PUBLIC.MIN_DRAW, // Min drawing distance
            PUBLIC.MAX_DRAW // Max drawing distance
        );
        PUBLIC.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        PUBLIC.renderer.shadowMap.enabled = true;
        PUBLIC.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        PUBLIC.renderer.setSize(PUBLIC.width, PUBLIC.height);

        // Append renderer element to the container dom element
        domTarget.appendChild(PUBLIC.renderer.domElement);

        // Set listener to window changing size
        window.addEventListener('resize', function() {
            // Save new dimensions
            if (PUBLIC.container === document.body) {
                PUBLIC.width = window.innerWidth;
                PUBLIC.height = window.innerHeight;
            } else {
                PUBLIC.width = PUBLIC.container.offsetWidth;
                PUBLIC.height = PUBLIC.container.offsetHeight;
            }

            // Update camera
            PUBLIC.camera.aspect = PUBLIC.width / PUBLIC.height;
            PUBLIC.camera.updateProjectionMatrix();

            // Update renderer size
            PUBLIC.renderer.setSize(PUBLIC.width, PUBLIC.height);
        }, false);

        // set bg color
        PUBLIC.renderer.setClearColor(0x191917, 1);

        PUBLIC.addLights();
    };

    PUBLIC.addLights = function() {
        // Add lights
        PUBLIC.lights.push(new THREE.PointLight(0xffffff, 1.5, 100));
        PUBLIC.lights.push(new THREE.PointLight(0xffffff, 1.0, 100));
        PUBLIC.lights.push(new THREE.PointLight(0xffffff, 1.0, 100));

        PUBLIC.lights[0].position.set(10, 10, 10);
        PUBLIC.lights[1].position.set(-10, 10, 10);
        PUBLIC.lights[2].position.set(2, 2, -10);

        var i = 0;
        for (i = 0; i < PUBLIC.lights.length; i++) {
            PUBLIC.scene.add(PUBLIC.lights[i]);
        }
    }

    PUBLIC.positionCamera = function() {
        if (!PUBLIC.camera) {
            return;
        }
        PUBLIC.camera.position.set(-2, 5, 10);
        PUBLIC.camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    // Render a single frame
    PUBLIC.renderFrame = function() {
        PUBLIC.positionCamera();
        if (PUBLIC.renderer) {
            PUBLIC.renderer.render(PUBLIC.scene, PUBLIC.camera);
        }
    };

    // Load three.js json file
    PUBLIC.loadModel = function(fileName) {
        return new Promise(function(resolve, reject) {
            try {
                // Load model
                var loader = new THREE.JSONLoader();

                loader.load(fileName, function(geometry, materials) {
                    try {
                        // Set material flag to follow bones
                        materials.forEach(function(mat) {
                            mat.skinning = true;
                        });

                        // Create the mesh
                        var mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
                        PUBLIC.addMesh(mesh);

                        var i;
                        for (i=0; i<geometry.animations.length; i++) {
                            PUBLIC.addAnimation(geometry.animations[i]);
                        }

                        debugger;
                        for (i=0; i<mesh.skeleton.bones.length; i++) {
                            PUBLIC.addBone(mesh.skeleton.bones[i]);
                        }

                        PUBLIC.renderFrame();

                        resolve('Loaded model + added to scene');
                    } catch(error) {
                        reject('Unable to load model');
                    }
                });
            } catch (error) {
                reject('Unable to load model');
            }
        });
    };

    PUBLIC.addMesh = function(mesh) {
        PUBLIC.meshes.push(mesh);
        PUBLIC.scene.add(mesh);

        if (!mesh.name) {
            mesh.name = 'Mesh' + (PUBLIC.meshes.length).toString();
        }
        var domList = document.getElementById('meshes');
        domList.innerHTML += PUBLIC.templates.checkbox.replace(/#NAME#/g, 'meshes').replace(/#VALUE#/g, mesh.name);
    };

    PUBLIC.addAnimation = function(animation) {
        var domList = document.getElementById('animations');
        domList.innerHTML += PUBLIC.templates.checkbox.replace(/#NAME#/g, 'animations').replace(/#VALUE#/g, animation.name);
    };

    PUBLIC.addBone = function(bone) {
        var domList = document.getElementById('bones');
        domList.innerHTML += PUBLIC.templates.listItem.replace(/#VALUE#/g, bone.name);
    };

    // Notifications
    PUBLIC.notifySuccess = function(text) {
        var statusDom = document.getElementById('status');
        if (statusDom.className.indexOf('error') >= 0) {
            statusDom.className = statusDom.className.replace('error', '').trim();
        }
        statusDom.innerHTML = text;
    };
    PUBLIC.notifyError = function(text) {
        var statusDom = document.getElementById('status');
        if (!(statusDom.className.indexOf('error') >= 0)) {
            statusDom.className += ' error';
        }
        statusDom.innerHTML = text;
    };

})(window.Editor = window.Editor || {});
