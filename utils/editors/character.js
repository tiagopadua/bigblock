'use strict';

(function(PUBLIC) {

    PUBLIC.loadCharacter = function() {
        var modelName = document.getElementById('fileName').value;
        PUBLIC.loadModel(modelName).then(function() {
            PUBLIC.notifySuccess('Loaded model: ' + modelName);
        }).catch(function() {
            PUBLIC.notifyError('Unable to load model: ' + modelName);
        });
    };

})(window.Editor = window.Editor || {});
