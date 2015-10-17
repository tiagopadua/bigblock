(function() {
    var hudUpdateTime = 300; // milli-seconds
    var hudTimer = null;
    var baseBarWidth = 200;
    var healthWidthFactor = 10;
    var staminaWidthFactor = 10;

    // Add HUD templates to DOM
    PRIVATE.renderHud = function() {
        // "render" templates (just append html code)
        PRIVATE.container.insertAdjacentHTML('afterbegin', PRIVATE.templates.hud);

        // Save DOM elements for future use
        PRIVATE.dom = PRIVATE.dom || {};
        PRIVATE.dom.health = PRIVATE.container.querySelector('.bb-health');
        PRIVATE.dom.healthCurrent = PRIVATE.container.querySelector('.bb-health-current');
        PRIVATE.dom.stamina = PRIVATE.container.querySelector('.bb-stamina');
        PRIVATE.dom.staminaCurrent = PRIVATE.container.querySelector('.bb-stamina-current');
    };

    // Update health bar
    PRIVATE.updateHealthBar = function(current, total) {
        var finalHealthWidth = baseBarWidth + total * healthWidthFactor;
        PRIVATE.dom.health.style.width = finalHealthWidth.toString() + 'px';
        
        // Avoid exception
        if (total === 0) {
            return;
        }
        PRIVATE.dom.healthCurrent.style.width = (100.0 * current / total).toString() + '%';
    };
    
    // Update stamina bar
    PRIVATE.updateStaminaBar = function(current, total) {
        var finalStaminaWidth = baseBarWidth + total * staminaWidthFactor;
        PRIVATE.dom.stamina.style.width = finalStaminaWidth.toString() + 'px';
        
        // Avoid exception
        if (total === 0) {
            return;
        }
        PRIVATE.dom.staminaCurrent.style.width = (100.0 * current / total).toString() + '%';
    };

    // Update the hud values
    PRIVATE.updateHud = function() {
        PRIVATE.updateHealthBar(PRIVATE.player.currentAttributes.health, PRIVATE.player.attributes.health);
        // Update stamina bar
        PRIVATE.updateStaminaBar(PRIVATE.player.currentAttributes.stamina, PRIVATE.player.attributes.stamina);
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
