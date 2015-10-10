(function() {
    var hudUpdateTime = 300; // milli-seconds
    var hudTimer = null;
    var baseBarWidth = 200;
    var healthWidthFactor = 10;
    var staminaWidthFactor = 10;

    // Insert inline template files (set by grunt 'concat' task)
    PRIVATE.templates = {
        hud: "// !include templates/hud.html"
    };

    // Add HUD templates to DOM
    PRIVATE.renderHud = function() {
        // "render" templates (just append html code)
        PRIVATE.container.insertAdjacentHTML('afterbegin', PRIVATE.templates.hud);

        // Save DOM elements for future use
        PRIVATE.dom = {
            health: PRIVATE.container.querySelector('.bb-health'),
            stamina: PRIVATE.container.querySelector('.bb-stamina')
        };
    };

    // Update the hud values
    PRIVATE.updateHud = function() {
        // Update health bar
        var finalHealthWidth = baseBarWidth + PRIVATE.player.attributes.health * healthWidthFactor;
        PRIVATE.dom.health.style.width = finalHealthWidth.toString() + 'px';
        // Update stamina bar
        var finalStaminaWidth = baseBarWidth + PRIVATE.player.attributes.stamina * staminaWidthFactor;
        PRIVATE.dom.stamina.style.width = finalStaminaWidth.toString() + 'px';
    };

    // Set up update hud timer
    PRIVATE.startHudTimer = function() {
        if (hudTimer !== null) {
            return console.warn('HUD update timer already set. Will not set up again...');
        }
        
        hudTimer = setInterval(PRIVATE.updateHud, hudUpdateTime);
    };

    // Stop updating hud timer
    PRIVATE.stopHudTimer = function() {
        if (hudTimer !== null) {
            clearInterval(hudTimer);
            hudTimer = null;
        } else {
            console.log('HUD timer not set. Cannot stop it...');
        }
    };
})();
