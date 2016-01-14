/**
 * sectioner.js
 *
 */


"use strict";


function isKeyCode (event, kc) {
    return (kc === event.which || kc === event.keyCode);
}

function rand (min, max) {
    if (arguments.length === 1) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomColor () {
    return "rgb(" + rand(255) + "," + rand(255) + "," + rand(255) + ")";
}


var KC = {
    P: 80,
    N: 78
};

Object.freeze(KC);


var ZINDEX = {
    FRONT: 10,
    BACK: 1
}

Object.freeze(ZINDEX);


function scheduleDetach (elem) {
    window.setTimeout(function () {
        elem.remove();
    }, 1000);
}

function animateOptions (before, after) {
    return {
        begin: before,
        complete: after,
        duration: 1000
    };
}

/**
 * Create a new page
 * @param   {number} index an index into the Sectioner.data list
 * @returns {object} a wrapped DOM element filled with page data
 */

function createPage (index) {
    var pageData = Sectioner.data[index];
    var page = $(document.createElement('div'));
    page.addClass("page");
    page.attr("data-index", index);
    page.html(pageData);
    return page;
}

Zepto(function($){
    var viewport = $("#viewport");
    var currentPage = viewport.find(".page");
    var index = parseInt(currentPage.attr("data-index"));
    if (isNaN(index)) {
        return;
    }

    function prev () {
        if (0 === index) {
            // nothing or some visual hint ?
            return;
        }
        var newIndex = index - 1;
        var page = createPage(newIndex);
        var vh = viewport.height();

        page.css({
            transform: "translateY(-" + vh + "px)",
            "z-index": ZINDEX.FRONT
        });

        currentPage.css({
            transform: "translateY(0px)",
            "z-index": ZINDEX.BACK
        });

        viewport.prepend(page);
        page.velocity({ translateY: [0, -vh] }, animateOptions());
        currentPage.velocity({ translateY: [vh, 0] }, animateOptions());
        scheduleDetach(currentPage);
        currentPage = page;
        index = newIndex;
    }

    function next () {
        if (index >= (Sectioner.data.length - 1)) {
            // nothing or some visual hint ?
            return;
        }
        var newIndex = index + 1;
        var page = createPage(newIndex);
        var vh = viewport.height();

        page.css({
            transform: "translateY(" + vh + "px)",
            "z-index": ZINDEX.FRONT
        });

        currentPage.css({
            transform: "translateY(0px)",
            "z-index": ZINDEX.BACK
        });

        viewport.append(page);
        page.velocity({ translateY: [0, vh] }, animateOptions());
        currentPage.velocity({ translateY: [(-vh), 0] }, animateOptions());
        scheduleDetach(currentPage);
        currentPage = page;
        index = newIndex;
    }

    function keyHandler (event) {
        if (isKeyCode(event, KC.P)) {
            prev();
        }
        else if (isKeyCode(event, KC.N)) {
            next();
        }
        else {
            console.warn("unhandled key");
        }

    }

    document.addEventListener('keyup', keyHandler, false);
});
