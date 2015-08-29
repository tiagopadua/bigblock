(function() {
    // Start up webgl variables
    function initWebGl(canvas) {
        PRIVATE.gl = canvas.getContext('webgl');
        if (!PRIVATE.gl) {
            console.error('Could not initialize WebGL');
            return;
        }
        PRIVATE.gl.viewportWidth = canvas.width;
        PRIVATE.gl.viewportHeight = canvas.height;
    }

    // Set up shaders
    function initShaders() {
        
    }

    // Fill initial buffers
    function initBuffers() {
        
    }

    // Set up everything for the webgl canvas
    PRIVATE.GraphicsInitialise = function(canvas) {
        initWebGl(canvas);
        initShaders();
        initBuffers();
    };
}())
