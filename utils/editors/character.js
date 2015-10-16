'use strict';

(function(PUBLIC) {

    PUBLIC.loadCharacter = function() {
        PUBLIC.setLoading();
        var modelFile = document.getElementById('fileName').value;
        PUBLIC.loadModel(modelFile).then(function() {
            PUBLIC.notifySuccess('Loaded model: ' + modelFile);
            PUBLIC.removeLoading();
        }).catch(function() {
            PUBLIC.notifyError('Unable to load model: ' + modelFile);
            PUBLIC.removeLoading();
        });
    };

})(window.Editor = window.Editor || {});
