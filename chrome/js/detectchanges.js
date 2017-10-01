/*
 * StackExchangeNotifications 1.0.1
 * Copyright (c) 2017 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/stack-exchange-notification
 */

(function(w, d, browser) {
    "use strict";

    var running = false,
        unreadRegExp       = /(^|\s)(js-unread-count|unread-count)(\s|$)/,
        inboxRegExp        = /(^|\s)(js-inbox-button|icon-inbox)(\s|$)/,
        achievementsRegExp = /(^|\s)(js-achievements-button|icon-achievements)(\s|$)/
    ;

    function isHide(elem)
    {
        var prop = w.getComputedStyle(elem, null);

        return prop.getPropertyValue("display") === "none" ||
                prop.getPropertyValue("visibility") === "hidden";
    }

    function updateStates(mutations)
    {
        mutations.forEach(function (mutation) {
            var type, checkTab, el = mutation.target;

            if (unreadRegExp.test(el.className)) {
                if (achievementsRegExp.test(el.parentNode.className)) {
                    type = "achievements";
                } else if (inboxRegExp.test(el.parentNode.className)) {
                    type = "inbox";
                }

                if (type && browser && browser.runtime && browser.runtime.sendMessage) {
                    var data = isHide(el) ? 0 : (el.textContent ? parseInt(el.textContent) : 0);

                    browser.runtime.sendMessage({
                        "data": data,
                        "clear": type
                    }, function(response) {});
                }
            }
        });
    }

    function applyEvents()
    {
        if (running) {
            return;
        }

        var networkSE = d.querySelector(".network-items, body > header .secondary-nav");

        if (!networkSE) {
            setTimeout(applyEvents, 1000);
            return;
        }

        running = true;

        var observer = new MutationObserver(updateStates);

        observer.observe(networkSE, {
            "subtree": true,
            "childList": true,
            "attributes": true
        });
    }

    if (/interactive|complete/i.test(d.readyState)) {
        applyEvents();
    } else {
        d.addEventListener("DOMContentLoaded", applyEvents);
        w.addEventListener("onload", applyEvents);
    }
})(window, document, chrome||browser);
