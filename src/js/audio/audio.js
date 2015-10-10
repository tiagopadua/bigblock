(function audioMain(){
    // Fallback for Safari
    window.AudioContext = window.AudioContext || webkitAudioContext;

    // This object stores all the LOADED sound files
    var soundBuffers = {};
    var audioContext = new window.AudioContext();
    var mainMusicName = null;
    var mainMusicSource = null;

    // Loads a file
    PRIVATE.loadSound = function(name, url) {
        return new Promise(function(resolve, reject) {

            // Check inputs
            if (!name || typeof(name) !== 'string') {
                return reject('Could not load audio:', name, url);
            }

            // Check if it's not loaded yet
            if (soundBuffers.hasOwnProperty(name)) {
                console.warn('Already found a sound with this name. Will not load!', name);
                return resolve(); // OK we already have it
            }

            // Assume modern browsers - we are a WebGL game after all...
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                try {
                    if (request.status !== 200) {
                        return reject('Could not load audio; response was not HTTP 200');
                    }
                    audioContext.decodeAudioData(request.response, function(audioBuffer) {
                        soundBuffers[name] = audioBuffer;
                        console.info('Loaded sound:', name);
                        return resolve(name); // Success!
                    }, function(error) {
                        console.error('Could not decode audio', name, url);
                        return reject(error);
                    });
                } catch(e) {
                    console.error('Could not load audio:', name, url);
                    return reject(e);
                }
            };
            request.onerror = function(e) {
                console.error('Could not load audio:', name, url);
                return reject(e);
            };

            // Really send the request
            request.send();
        });
    };

    // Play an already loaded file
    PUBLIC.playSound = PRIVATE.playSound = function(name) {
        if (!soundBuffers.hasOwnProperty(name)) {
            return console.error('Sound not found!', name);
        }
        
        var audioSource = audioContext.createBufferSource();
        audioSource.buffer = soundBuffers[name];
        audioSource.connect(audioContext.destination);
        audioSource.start();

        return audioSource;
    };

    // Sets up music source
    PRIVATE.setMainMusic = function(name) {
        mainMusicName = name;
    };
    // Starts the loaded music - if any
    PRIVATE.startMainMusic = function() {
        mainMusicSource = PRIVATE.playSound(mainMusicName);
    };
    // Stops playing music
    PRIVATE.stopMainMusic = function() {
        if (mainMusicSource === null) {
            return;
        }
        mainMusicSource.stop();
        mainMusicSource = null;
    };
})();
