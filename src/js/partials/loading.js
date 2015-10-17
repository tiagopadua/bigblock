(function loading() {

    var itemCounter = 0;
    var loadingItems = [];

    PRIVATE.renderLoadingScreen = function() {
        // "render" templates (just append html code)
        PRIVATE.container.insertAdjacentHTML('beforeend', PRIVATE.templates.loading);

        // Save DOM elements for future use
        PRIVATE.dom = PRIVATE.dom || {};
        PRIVATE.dom.loading = PRIVATE.container.querySelector('.bb-loading');
        PRIVATE.dom.loadingItems = PRIVATE.container.querySelector('.bb-loading-items');

        // Capture and do NOT propagate clicks
        PRIVATE.dom.loading.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
        });
        PRIVATE.dom.loading.addEventListener('mousedown', function(event) {
            event.stopPropagation();
            event.preventDefault();
        });
    };

    PRIVATE.hideLoadingScreen = function() {
        if (PRIVATE.dom && PRIVATE.dom.loading) {
            PRIVATE.dom.loading.style.display = 'none';
        }
    };

    PRIVATE.addLoadingItem = function(name) {
        if (!PRIVATE.dom.loading) {
            return;
        }

        var itemId = 'bbLoadingItem_' + (itemCounter++).toString();

        var itemHtml = PRIVATE.templates.loadingItem.replace(/#NAME#/g, name).replace(/#ID#/g, itemId);
        PRIVATE.dom.loadingItems.insertAdjacentHTML('beforeend', itemHtml);

        var item = document.getElementById(itemId);
        if (item) {
            loadingItems.push(item);
        
            item.setDone = function() {
                this.setAttribute('status', 'done');
            };
            item.setError = function() {
                this.setAttribute('status', 'error');
            };
        }
        return item;
    };

})();
