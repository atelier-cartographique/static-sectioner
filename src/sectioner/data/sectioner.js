/**
 * sectioner.js
 *
 */


"use strict";

/************************
 *
 * polyfills from Mozilla
 *
 ************************/
// creates a global "addWheelListener" method
// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
(function(window,document) {

    var prefix = "", _addEventListener, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }


})(window,document);

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback /*, initialValue*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && !(k in t)) {
        k++; 
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}


// end of Mozilla polyfills

var KEY = {
    'BACKSPACE': 8,
    'TAB': 9,
    'ENTER': 13,
    'SHIFT': 16,
    'CTRL': 17,
    'ALT': 18,
    'ESC': 27,
    'SPACE': 32,
    'PAGE_UP': 33,
    'PAGE_DOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40,
    'INSERT': 45,
    'DELETE': 46,
    'A': 65 ,
    'B': 66 ,
    'C': 67 ,
    'D': 68 ,
    'E': 69 ,
    'F': 70 ,
    'G': 71 ,
    'H': 72 ,
    'I': 73 ,
    'J': 74 ,
    'K': 75 ,
    'L': 76 ,
    'M': 77 ,
    'N': 78 ,
    'O': 79 ,
    'P': 80 ,
    'Q': 81 ,
    'R': 82 ,
    'S': 83 ,
    'T': 84 ,
    'U': 85 ,
    'V': 86 ,
    'W': 87 ,
    'X': 88 ,
    'Y': 89 ,
    'Z': 90 ,
    '0': 48 ,
    '1': 49 ,
    '2': 50 ,
    '3': 51 ,
    '4': 52 ,
    '5': 53 ,
    '6': 54 ,
    '7': 55 ,
    '8': 56 ,
    '9': 57
};

Object.freeze(KEY);

function isKeyCode (event, kc) {
    var result = false; 
    if (Array.isArray(kc)) {
        for (var i = 0; i < kc.length; i++) {
            var k = kc[i];
            if (k === event.which || k === event.keyCode) {
                result = true;
                break;
            }
        }
    }
    else {
        result = (kc === event.which || kc === event.keyCode);
    }
    return result;
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


var ZINDEX = {
    FRONT: 10,
    BACK: 1
}

Object.freeze(ZINDEX);

var DIRECTION = {
    VERTICAL: 1,
    HORIZONTAL: 0
}

Object.freeze(DIRECTION);


function mkEmiter (obj, node) {
    var prefix = Date.now() + '#';
    
    function emit (name) {
        console.log('emit', prefix, name);
        var event = new Event(prefix + name);
        node.dispatchEvent(event);
    }
    
    function on (event, fn, ctx) {
        console.log('on', prefix, event);
        node.addEventListener(prefix + event, function () {
            fn.apply(ctx, arguments);
        }, false);
    }
    
    function once (event, fn, ctx) {
        console.log('once', prefix, event);
        var fired = false;

        function g() {
            node.removeEventListener(prefix + event, g, false);
            if (!fired) {
              fired = true;
              fn.apply(ctx, arguments);
            }
        }

        node.addEventListener(prefix + event, g, false);
    }
    
    Object.defineProperties(obj, {
        emit: {value: emit},
        on : {value: on},
        once: {value: once}
    });
}



function emptyElement (elem) {
    while (elem.firstChild) {
        removeElement(elem.firstChild);
    }
    return elem;
}

function removeElement (elem, keepChildren) {
    if (!keepChildren) {
        emptyElement(elem);
    }
    var parent = elem.parentNode,
        evt = document.createEvent('CustomEvent');
    parent.removeChild(elem);
    evt.initCustomEvent('remove', false, false, null);
    elem.dispatchEvent(evt);
    return elem;
}

function scheduleDetach (elem) {
    window.setTimeout(function () {
        removeElement(elem);
    }, 1000);
}

function animateOptions (before, after) {
    return {
        begin: before,
        complete: after,
        duration: 1000
    };
}


function getMouseEventPos (ev) {
    if (ev instanceof MouseEvent) {
        var target = ev.target,
            trect = target.getBoundingClientRect();
            return [
                ev.clientX - trect.left,
                ev.clientY - trect.top
            ];
    }
    return [0, 0];
}


function touchFind (ev, id) {
    var touches = ev.changedTouches,
        item, touch;
    for (var i = 0; i < touches.length; i++) {
        item = touches.item(i);
        if (id === item.identifier) {
            touch = item;
            break;
        }
    }
    return touch;
}


function getTouchEventPos (ev, id) {
    if (ev instanceof TouchEvent) {
        var touch = touchFind(ev, id);
        if (touch) {
            var target = ev.target,
                trect = target.getBoundingClientRect();
            return [
                touch.clientX - trect.left,
                touch.clientY - trect.top
            ];
        }
    }
    return [0, 0];
}



function Page (data, index, direction) {
    if ((index < 0) || (index > (data.length - 1))) {
        throw (new Error('PageIndexOutOfRange'));
    }
    var html = data[index],
        node = document.createElement('div');
    node.setAttribute('class', 'page');
    node.setAttribute('data-index', index);
    node.innerHTML = html;
    
    Object.defineProperty(this, 'node', {value: node});
    Object.defineProperty(this, 'index', {value: index});
    Object.defineProperty(this, 'direction', {value: direction || DIRECTION.VERTICAL});
    
    this.offset = 0;
    this.callbacks = [];
    
    mkEmiter(this, this.node);
}

Page.prototype.remove = function () {
    console.log('page remove', this.index);
    return removeElement(this.node);
};

Page.prototype.recordOffset = function (offset) {
    this.offset = offset;
};

Page.prototype.recorder = function (fn) {
    var that = this;
    function g (elem, c, r, s, t) {
        that.offset = t;
        if (fn) {
            fn(elem, c, r, s, t);
        }
    };
    return g;
};

Page.prototype.completer = function (fn) {
    var that = this;
    function g () {
        that.isAnimating = false;
        that.emit('stop:animation');
        if (fn) {
            try {
                fn();
            }
            catch(e) {
                console.error('Page.completer', e);
            }
        }
    };
    return g;
};

Page.prototype.after = function (fn, ctx) {
    
    if (this.isAnimating) {
        this.once('stop:animation', fn, ctx);
    }
    else {
        setTimeout(function(){
            fn.call(ctx);
        }, 1);
    }
};

Page.prototype.setOffset = function (offset, animOptions) {
    if (offset === this.offset) {
        return;
    }
    var previousOffset = this.offset,
        node = this.node;
    
    this.recordOffset(offset);
    if (animOptions) {
        this.isAnimating = true;
        this.emit('start:animation');
        
        var animation = {
            tween: [offset, previousOffset]
        };
        var options = {
            progress: this.recorder(),
            complete: this.completer(),
            duration: 600
        };
        
        for (var k in animOptions) {
            if ('progress' === k) {
                options.progress = this.recorder(animOptions.progress);
            }
            else if ('complete' === k) {
                options.complete = this.completer(animOptions.complete);
            }
            else {
                options[k] = animOptions[k];
            }
        }
        
        if (DIRECTION.VERTICAL) {
            animation.translateY = [offset, previousOffset];
        }
        else {
            animation.translateX = [offset, previousOffset];
        }
        
        Velocity(node, 'finish');
        Velocity(node, animation, options);
        
        console.log('page animation', this.index, 'from', previousOffset, 'to', offset);
    }
    else {
        var trProp = (DIRECTION.VERTICAL === this.direction)? 'translateY': 'translateX',
            trString = trProp + '(' + offset.toString() + 'px)' ;
        this.node.style.transform =  trString;
    }
};

Page.prototype.translate = function (offset, animOptions) {
    this.setOffset(this.offset + offset, animOptions);
};


Page.prototype.setStyle = function (key, value) {
    var styles = {};
    if (value) {
        styles[key] = value;
    }
    else {
        styles = key;
    }
    for (var k in styles) {
        this.node[k] = styles[k];
    }
};


/**
 * Constructor of a Pager
 * @param   {DOMElement} elem      An element to attach the Pager to
 * @param   {Array}      pages     [[Description]]
 * @param   {DIRECTION}  direction [[Description]]
 * @param   {number}   index     optional, defaulut to 0, internal index initializer
 * @returns {[[Type]]}   [[Description]]
 */
function Pager (elem, pages, direction, index) {
    var startPos = [0, 0];
    Object.defineProperty(this, 'node', {value: elem});
    Object.defineProperty(this, 'pages', {value: pages});
    Object.defineProperty(this, 'direction', {value: direction});
    
    Object.defineProperty(this, 'startPos', {
        set: function (val) {
            if (Array.isArray(val)) {
                startPos = val;
            }
            else {
                startPos[direction] = val;
            }
        },
        get: function () {
            return startPos[direction];
        }
    });
    
    Object.defineProperty(this, 'threshold', {
        get: function () {
            var rect = elem.getBoundingClientRect(),
                tr;
            if (DIRECTION.HORIZONTAL === direction) {
                tr = Math.floor(rect.width * 0.8);
            }
            else {
                tr = Math.floor(rect.height * 0.8);
            }
            return tr;
        }
    })
    
    this.index = index || 0;
    this.previousPage = null;
    this.currentPage = null;
    this.nextPage = null;
    
    emptyElement(elem);
    this.currentPage = this.createPage(this.index);
    this.currentPage.setOffset(0);
    this.currentPage.setStyle('zIndex', ZINDEX.BACK);
    this.node.appendChild(this.currentPage.node);
    
    this.preparePreviousPage();
    this.prepareNextPage();
    this.setHandlers();
}


Pager.prototype.NEXT_KEYS = [
    KEY.RIGHT,
    KEY.DOWN,
    KEY.SPACE,
    KEY.PAGE_DOWN
];

Pager.prototype.PREVIOUS_KEYS = [
    KEY.LEFT,
    KEY.UP,
    KEY.PAGE_UP
];

Pager.prototype.createPage = function (index) {
    if ((index < 0) || (index > (this.pages.length - 1))) {
        return null;
    }
    return (new Page(this.pages, index, this.direction));
}

Pager.prototype.preparePreviousPage = function () {
    var index = this.index - 1;
    if (this.previousPage) {
        this.previousPage.remove();
        this.previousPage = null;
    }
    if (index < 0) {
        return;
    }
    
    var page = this.createPage(index),
        rect = this.node.getBoundingClientRect();
    page.setOffset(-rect.height);
    page.setStyle('zIndex', ZINDEX.FRONT);
    this.node.appendChild(page.node);
    this.previousPage = page;
};

Pager.prototype.prepareNextPage = function () {
    var index = this.index + 1;
    if (this.nextPage) {
        removeElement(this.nextPage);
        this.nextPage = null;
    }
    if (index > (this.pages.length - 1)) {
        return;
    }
    
    var page = this.createPage(index),
        rect = this.node.getBoundingClientRect();
    page.setOffset(rect.height);
    page.setStyle('zIndex', ZINDEX.FRONT);
    this.node.appendChild(page.node);
    this.nextPage = page;
};


Pager.prototype.bindCallback = function (method, prevent) {
    var ctx = this,
        fn = this[method];
    
    var callback = function () {
        var event = arguments[0];
        if (prevent) {
            event.preventDefault();
            event.stopPropagation();
        }
        fn.apply(ctx, arguments);
    };
    
    this.node.addEventListener(method, callback, false);
};

/**
 * 
 */
Pager.prototype.setHandlers = function () {
    mkEmiter(this, this.node);
    this.bindCallback('touchstart', true);
    this.bindCallback('touchend', true);
    this.bindCallback('touchcancel', true);
    this.bindCallback('touchmove', true);
    this.bindCallback('wheel', true);
    this.node.setAttribute('tabindex', -1);
    this.node.focus();
    this.bindCallback('keyup', true); // well, difficult to manage focus though
    
    
    this.pendings = [];

    
    this.on('stop:animation', function(){
        this.isAnimating = false;
        if (this.pendings.length > 0) {
            var pending = this.pendings.shift();
            if ('next' === pending) {
                this.pageNext();
            }
            else {
                this.pagePrevious();
            }
        }
    }, this);
    
};


Pager.prototype.start = function (pos) {
    if (this.isStarted) {
        this.stop();
    }
    this.isStarted = true;
    this.wheelDeltas = [];
    this.startPos = pos;
};

Pager.prototype.stop = function () {
    this.isStarted = false;
    this.startPos = [0,0];
};

Pager.prototype.touchstart = function (event) {
    var touches = event.changedTouches,
        touch = touches[0];
    
    this.currentTouchId = touch.identifier;
    this.start(getTouchEventPos(event, this.currentTouchId));
};

Pager.prototype.touchend = function (event) {
    this.stop();
};

Pager.prototype.touchcancel = function (event) {
    this.stop();
};

Pager.prototype.touchmove = function (event) {
    var id = this.currentTouchId,
        touch = touchFind(event, id);
    if (touch) {
        var pos = getTouchEventPos(event, id),
            dpos = pos[this.direction],
            offset = this.startPos - dpos;
        this.checkOffset(offset);
    }
};

Pager.prototype.wheel = function (event) {
    if (!this.isStarted) {
        this.start([0,0]);
        var that = this;
        setTimeout(function(){
            that.stop();
        }, 100);
    }
    this.wheelDeltas.push(event.deltaY);
    var delta = this.wheelDeltas.reduce(function(a,b){return a + b;}),
        offset;
    if (WheelEvent.DOM_DELTA_PIXEL === event.deltaMode) {
        offset = delta;
    }
    else if (WheelEvent.DOM_DELTA_LINE === event.deltaMode) {
        offset = delta * 20; // rough approx
    }
    else if (WheelEvent.DOM_DELTA_PAGE === event.deltaMode) {
        var rect = this.node.getBoundingClientRect();
        offset = rect.height * delta;
    }
    else {
        offset = delta;
    }
    if (!this.checkOffset(offset * 4)) {
        if (!this.hintLock) {
            this.pageHint(offset * 2);
        }
    }
    else {
        this.hintLock = true;
        var that = this;
        setTimeout(function(){
            that.hintLock = false;
        }, 1200);
    }
};

Pager.prototype.checkOffset = function (offset, threshold) {
    var threshold = threshold || this.threshold,
        absOffset = Math.abs(offset);
    if (absOffset >= threshold) {
        if (offset < 0) {
            this.pagePrevious();
        }
        else {
            this.pageNext();
        }
        return true;
    }
    return false;
};

Pager.prototype.pageHint = function (offset) {
    if (this.isHinting) {
        return;
    }
    var that = this,
        hintOffset = Math.floor(offset * -1),
        rect = this.node.getBoundingClientRect(),
        page = (offset < 0)? this.previousPage: this.nextPage;

    function complete () {
        console.log('hint middle', page.index);
        if (!that.isAnimating) {
            page.translate(-hintOffset, {
                duration: 500,
                complete: function(){
                    console.log('hint stop', page.index);
                    that.isHinting = false;
                }
            });
        }
        else {
            console.log('hint stop (no anim)', page.index);
            that.isHinting = false;
        }
    }
    
    if (page) {
        this.isHinting = true;
        console.log('hint start', page.index);
        page.translate(hintOffset, {duration: 300, complete:complete});
    }
};



Pager.prototype.keyup = function (event) {
    if (isKeyCode(event, this.NEXT_KEYS)) {
        this.pageNext();
    }
    else if (isKeyCode(event, this.PREVIOUS_KEYS)) {
        this.pagePrevious();
    }
};

Pager.prototype.pagePrevious = function () {
    this.stop();
    if (this.index <= 0) {
        return;
    }
    if (this.isAnimating) {
        this.pendings.push('previous');
        return;
    }
    console.log('previous', this.index);
    this.isAnimating = true;
    var that = this,
        oldIndex = this.index,
        rect = this.node.getBoundingClientRect(),
        offset = rect.height,
        previousPage = this.previousPage,
        currentPage = this.currentPage;
    this.index = this.index - 1;
    
    
    function animationEnd () {
        if (that.nextPage) {
            that.nextPage.remove();
        }
        that.previousPage = null;
        that.currentPage = previousPage;
        that.nextPage = currentPage;
        that.currentPage.setStyle('zIndex', ZINDEX.BACK);
        that.preparePreviousPage();
        that.emit('stop:animation');
    }
    
    var currentOptions = {
        duration: 1000
    };
    
    var previousOptions = {
        complete: animationEnd,
        duration: 1000
    };
    
    previousPage.after(function(){
        previousPage.once('start:animation', function(){
            currentPage.setOffset(offset, currentOptions);
        });
        previousPage.setOffset(0, previousOptions);
    });
};

Pager.prototype.pageNext = function () {
    this.stop();
    if (this.index >= (this.pages.length - 1)) {
        return;
    }
    if (this.isAnimating) {
//        this.once('stop:animation', function(){
//            console.log('delayed next', this);
//            this.pageNext();
//        }, this);
        this.pendings.push('next');
        return;
    }
    console.log('next', this.index, this.pages.length);
    this.isAnimating = true;
    
    var that = this,
        oldIndex = this.index,
        rect = this.node.getBoundingClientRect(),
        offset = rect.height,
        nextPage = this.nextPage,
        currentPage = this.currentPage;
    this.index = this.index + 1;
    
    function animationEnd () {
        if (that.previousPage) {
            that.previousPage.remove();
        }
        that.previousPage = currentPage;
        that.currentPage = nextPage;
        that.nextPage = null;
        that.currentPage.setStyle('zIndex', ZINDEX.BACK);
        that.prepareNextPage();
        that.emit('stop:animation');
    }
    
    
    var currentOptions = {
        duration: 1000
    };
    
    var nextOptions = {
        complete: animationEnd,
        duration: 1000
    };
    
    nextPage.after(function(){
        nextPage.once('start:animation', function(){
            currentPage.setOffset(-offset, currentOptions);
        });
        nextPage.setOffset(0, nextOptions);
    });
};




document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
    var viewport = document.querySelector("#viewport");
    var currentPage = viewport.querySelector(".page");
    var index = parseInt(currentPage.getAttribute("data-index"));
    if (isNaN(index)) {
        return;
    }
    
    var pager = new Pager(viewport, Sectioner.data, DIRECTION.VERTICAL, index);
    }
};
