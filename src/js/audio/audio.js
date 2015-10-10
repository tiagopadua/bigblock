(function audioMain(){
    // Fallback for Safari
    window.AudioContext = window.AudioContext || webkitAudioContext;

    // This object stores all the LOADED sound files
    var soundBuffers = {};
    var audioContext = new window.AudioContext();

    // Loads a file
    PRIVATE.loadSound = function(name, url) {
        return new Promise(function(resolve, reject) {

            // Check inputs
            if (!name || typeof(name) !== 'string') {
                return reject('Could not load audio:', name, url);
            }

            // Check if it's not loaded yet
            if (soundBuffers.hasOwnProperty(name)) {
                return resolve(); // OK we already have it
            }

            // Assume modern browsers - we are a WebGL game after all...
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arrayBuffer';
            request.onload = function() {
                try {
                    audioContext.decodeAudioData(request.response, function(audioBuffer) {
                        soundBuffers[name] = audioBuffer;
                        resolve(); // Success!
                    }, function(error) {
                        reject(error);
                    });
                } catch(e) {
                    reject(e);
                }
            };

            // Really send the request
            request.send();
        });
    };
})();