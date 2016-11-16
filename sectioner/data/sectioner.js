/**
 * sectioner.js
 *
 */

(function(window){
'use strict';


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
};

Object.freeze(ZINDEX);

var SPEED = {
    FAST: 200,
    MEDIUM: 500,
    SLOW: 1000
};

Object.freeze(SPEED);

var DIRECTION = {
    VERTICAL: 1,
    HORIZONTAL: 0
};

Object.freeze(DIRECTION);


function mkEmiter (obj, node) {
    var prefix = Date.now() + '#';

    node = node || document;

    function emit (name, data) {
        console.log('emit', prefix, name);
        var event = new Event(prefix + name);
        event.data = data;
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

function addClass (elem, c) {
    var ecStr = elem.getAttribute('class');
    var ec = ecStr ? ecStr.split(' ') : [];
    ec.push(c);
    elem.setAttribute('class', _.uniq(ec).join(' '));
}

function toggleClass (elem, c) {
    var ecStr = elem.getAttribute('class');
    var ec = ecStr ? ecStr.split(' ') : [];
    if (_.indexOf(ec, c) < 0) {
        addClass(elem, c);
    }
    else {
        removeClass(elem, c);
    }
}

function setDocumentTitle (title) {
    var headerNode = document.querySelector('head'),
        titleNode = headerNode.querySelector('title'),
        toInsert = document.createTextNode(title);

    emptyElement(titleNode);
    titleNode.appendChild(toInsert);
}

function hasClass (elem, c) {
    var ecStr = elem.getAttribute('class');
    var ec = ecStr ? ecStr.split(' ') : [];
    return !(_.indexOf(ec, c) < 0);
}

function removeClass (elem, c) {
    var ecStr = elem.getAttribute('class');
    var ec = ecStr ? ecStr.split(' ') : [];
    elem.setAttribute('class', _.without(ec, c).join(' '));
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

function getTouchEventPos (target, ev, id) {
    if (ev instanceof TouchEvent) {
        var touch = touchFind(ev, id);
        if (touch) {
            var trect = target.getBoundingClientRect();
            return [
                touch.clientX - trect.left,
                touch.clientY - trect.top
            ];
        }
    }
    return [0, 0];
};


function scheduleDetach (elem) {
    window.setTimeout(function () {
        removeElement(elem);
    }, 1000);
}




var SZ = {
    WIDTH: 0,
    HEIGHT: 1,
    SOURCE: 2
};

Object.freeze(SZ);

function SImage (parent, options) {
    var parentRect = parent.getBoundingClientRect(),
        node = document.createElement('img');
    Object.defineProperty(this, 'node', {value: node});
    for (var k in options) {
        Object.defineProperty(this, k, {value: options[k]});
    }

    parent.appendChild(node);

    var orig = this.sizes[0],
        aspect = orig[SZ.WIDTH] / orig[SZ.HEIGHT];
    this.offset = 0;
    this.height = parentRect.height;
    this.width = this.height * aspect;
    node.setAttribute('class', 'slider-image');
    node.setAttribute('width', this.width);
    node.setAttribute('height', this.height);

    mkEmiter(this, node);
}


SImage.prototype.getMeta = function () {
    return (this.html || '');
};

SImage.prototype.findSize = function () {
    var sizes = this.sizes,
        w = this.width,
        h = this.height,
        sz = 0;

    for (var i = 0; i < sizes.length; i++) {
        var s = sizes[i];
        if ((s[SZ.WIDTH] < w) || (s[SZ.HEIGHT] < h)) {
            break;
        }
        sz = i;
    }
    return sizes[sz];
};

SImage.prototype.load = function () {
    var that = this,
        node = this.node,
        size = this.findSize(),
        source = size[SZ.SOURCE];

    function g () {
        node.removeEventListener('load', g, false);
        that.emit('load');
    }

    node.addEventListener('load', g, false);
    node.setAttribute('src', source);
};

SImage.prototype.recordOffset = function (offset) {
    this.offset = offset;
};

SImage.prototype.recorder = function (fn) {
    var that = this;
    function g (elem, c, r, s, t) {
        that.offset = t;
        if (fn) {
            fn(elem, c, r, s, t);
        }
    }
    return g;
};

SImage.prototype.completer = function (fn) {
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
    }
    return g;
};

SImage.prototype.after = function (fn, ctx) {

    if (this.isAnimating) {
        this.once('stop:animation', fn, ctx);
    }
    else {
        setTimeout(function(){
            fn.call(ctx);
        }, 1);
    }
};

SImage.prototype.setOffset = function (offset, animOptions) {
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
            tween: [offset, previousOffset],
            translateX: [offset, previousOffset]
        };

        var options = {
            progress: this.recorder(),
            complete: this.completer(),
            duration: SPEED.MEDIUM
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

        Velocity(node, 'finish');
        Velocity(node, animation, options);
    }
    else {
        var trString = 'translateX(' + offset.toString() + 'px)' ;
        this.node.style.transform =  trString;
    }
};

SImage.prototype.translate = function (offset, animOptions) {
    this.setOffset(this.offset + offset, animOptions);
};


function Slider (node, data) {
    this.images = [];
    this.index = 0;
    this.gap = 10;

    var currentMeta = '';
    Object.defineProperty(this, 'node', {value: node});
    Object.defineProperty(this, 'items', {value: data.items});
    Object.defineProperty(this, 'meta', {
        get: function(){
            return currentMeta;
        },
        set: function(im){
            currentMeta = im.getMeta();
        }
    });


    var navPrevious = node.querySelector('[data-role="media.previous"]'),
        navNext = node.querySelector('[data-role="media.next"]');

    if (navPrevious) {
        navPrevious.addEventListener('click', _.bind(this.previous, this), false);
    }
    if (navNext) {
        navNext.addEventListener('click', _.bind(this.next, this), false);
    }

    mkEmiter(this, node);
    this.resetImages();
}

Slider.prototype.resetImages = function () {
    this.images.forEach(function(im){
        removeElement(im.node);
    });
    this.images = [];

    var offset = 0;
    for (var idx = 0; idx < this.items.length; idx++) {
        var si = new SImage(this.node, this.items[idx]);
        this.images.push(si);
        si.setOffset(offset);
        offset += si.width + this.gap;
    }

    if (this.isStarted) {
        this.isStarted = false;
        this.start();
    }
};

Slider.prototype.resize = function () {
    // console.log('slider.resize');
    this.resetImages();
};

Slider.prototype.start = function () {
    if (this.isStarted) {
        return;
    }
    var images = this.images,
        idx = 0,
        that = this;

    function loadNext () {
        if (idx >= images.length) {
            return;
        }
        var img = images[idx];
        idx += 1;
        img.once('load', loadNext);
        img.load();
    }

    loadNext();
    this.meta = _.first(images);
    this.isStarted = true;
    this.emit('change:media');
};

Slider.prototype.at = function (index) {
    index = _.clamp(index, 0, this.images.length - 1);

    if ((index === this.index) || this.isAnimating) {
        return;
    }
    this.isAnimating = true;

    var currentIndex = this.index,
        slice = (index < currentIndex) ? _.slice(this.images, index, currentIndex) : _.slice(this.images, currentIndex, index),
        offset = _.reduce(slice, function(memo, im){return im.width + memo;}, 0);

    offset += slice.length * this.gap;

    if (index > currentIndex) {
        offset = offset * -1;
    }
    this.index = index;
    var lastImage = _.last(this.images);
    lastImage.once('stop:animation', function(){
        this.isAnimating = false;
    }, this);
    _.each(this.images, function(im){
        im.translate(offset, {
            duration: SPEED.MEDIUM
        });
    });
    this.meta = this.images[index];
    this.emit('change:media');
};

Slider.prototype.next = function () {
    var newIndex = this.index + 1;
    if (newIndex >= this.images.length) {
        this.emit('after:media');
        return;
    }
    this.at(newIndex);
};

Slider.prototype.previous = function () {
    var newIndex = this.index - 1;
    if (newIndex < 0) {
        this.emit('before:media');
        return;
    }
    this.at(newIndex);
};



function Page (parent, data, index, direction) {
    if ((index < 0) || (index > (data.length - 1))) {
        throw (new Error('PageIndexOutOfRange'));
    }
    var pageData = data[index],
        html = pageData['page.html'],
        node = document.createElement('div');
    node.setAttribute('class', 'page');
    node.setAttribute('data-index', index);
    node.innerHTML = html;
    parent.appendChild(node);

    var meta = node.querySelector('[data-role="media.meta"]');

    Object.defineProperty(this, 'node', {value: node});
    Object.defineProperty(this, 'meta', {value: meta});
    Object.defineProperty(this, 'index', {value: index});
    Object.defineProperty(this, 'data', {value: pageData});



    this.offset = 0;
    this.bookmark = null;
    this.callbacks = [];

    this.attachSlider(pageData);
    mkEmiter(this, this.node);

    var navPrevious = node.querySelector('[data-role="page.previous"]'),
        navNext = node.querySelector('[data-role="page.next"]'),
        that = this;

    if (navPrevious) {
        navPrevious.addEventListener('click', function () {
            that.emit('previous');
        }, false);
    }
    if (navNext) {
        navNext.addEventListener('click', function () {
            that.emit('next');
        }, false);
    }
}

Page.prototype.attachSlider = function (pageData) {
    var media = pageData.media;
    if (!media) {
        return;
    }
    var node = this.node.querySelector('[data-role="media.slider"]');
    Object.defineProperty(this, 'slider', {value: new Slider(node, media)});
    this.loadMediaMeta();
    this.slider.on('change:media', this.loadMediaMeta, this);
};

Page.prototype.loadMediaMeta = function () {
    if (this.meta) {
        emptyElement(this.meta);
    }
    if (this.slider) {
        this.meta.innerHTML = this.slider.meta;
    }
};


Page.prototype.setBookmark = function () {
    this.bookmark = this.offset;
};

Page.prototype.resetBookmark = function () {
    var offset = this.bookmark;
    if (null === offset) {
        return;
    }
    this.bookmark = null;
    this.setOffset(offset);
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
    }
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
    }
    return g;
};

Page.prototype.after = function (fn, ctx) {

    if (this.isAnimating) {
        this.once('stop:animation', fn, ctx);
    }
    else {
        window.setTimeout(function(){
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
            tween: [offset, previousOffset],
            translateY: [offset, previousOffset]
        };

        var options = {
            progress: this.recorder(),
            complete: this.completer(),
            duration: SPEED.MEDIUM
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

        Velocity(node, 'finish');
        Velocity(node, animation, options);
    }
    else {
        var trString = 'translateY(' + offset.toString() + 'px)' ;
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
        this.node.style[k] = styles[k];
    }
};


/**
 * Constructor of a Pager
 * @param   {DOMElement} elem      An element to attach the Pager to
 * @param   {Array}      collection     pages data
 * @param   {number}   index     optional, defaulut to 0, internal index initializer
 * @returns {Pager}   A Pages Manager
 */
function Pager (elem, collection, index) {
    var startPos = [0, 0];
    Object.defineProperty(this, 'node', {value: elem});

    Object.defineProperty(this, 'startPos', {
        set: function (x, y) {
            if (Array.isArray(x)) {
                startPos = x;
            }
            else {
                startPos = [x, y];
            }
        },
        get: function () {
            return startPos;
        }
    });

    Object.defineProperty(this, 'threshold', {
        get: function () {
            var rect = elem.getBoundingClientRect(),
                tr = [
                    32, // Math.floor(rect.width * 0.3), // DIRECTION.HORIZONTAL
                    32 // Math.floor(rect.height * 0.2) // DIRECTION.VERTICAL
                ];
            return tr;
        }
    });

    this.index = index || 0;
    emptyElement(elem);
    var pages = [];

    for (var i = 0; i < collection.length; i++) {
        var page = new Page(this.node, collection, i);
        if(i === this.index) {
            page.setStyle('zIndex', ZINDEX.BACK);
            if (page.slider) {
                page.slider.start();
            }
        }
        else if ((i === (this.index + 1)) || (i === (this.index - 1))) {
            if (page.slider) {
                page.slider.start();
            }
        }
        else {
            page.setStyle('zIndex', ZINDEX.FRONT);
        }
        pages.push(page);
    }

    Object.defineProperty(this, 'pages', {value: pages});

    this.resetPositions();
    this.setHandlers();
}

Pager.prototype.resetPositions = function () {
    var pages = this.pages,
        index = this.index,
        rect = this.node.getBoundingClientRect(),
        height = rect.height;

    for (var i = 0; i < pages.length; i++) {
        var page = pages[i],
            iOffset = i - this.index;

        page.setOffset(iOffset * height);
    }
};


Pager.prototype.resize = function () {
    this.resetPositions();
    this.each(function (page) {
        if (page.slider) {
            page.slider.resize();
        }
    });
};

Pager.prototype.getMouseEventPos = function (ev) {
    if (ev instanceof MouseEvent) {
        var target = this.node,
            trect = target.getBoundingClientRect();
            return [
                ev.clientX - trect.left,
                ev.clientY - trect.top
            ];
    }
    return [0, 0];
};



Pager.prototype.getTouchEventPos = function (ev, id) {
    return getTouchEventPos(this.node, ev, id);
};


Pager.prototype.getCurrentPage = function () {
    return this.pages[this.index];
};

Pager.prototype.getNextPage = function () {
    if (this.index < (this.pages.length - 1)) {
        return this.pages[this.index + 1];
    }
    return null;
};

Pager.prototype.getPreviousPage = function () {
    if (this.index > 0) {
        return this.pages[this.index - 1];
    }
    return null;
};

Pager.prototype.each = function (fn, ctx) {
    _.forEach(this.pages, function(){
        fn.apply(ctx, arguments);
    });
};

Pager.prototype.NEXT_KEYS = [
    KEY.DOWN,
    KEY.SPACE,
    KEY.PAGE_DOWN
];

Pager.prototype.PREVIOUS_KEYS = [
    KEY.UP,
    KEY.PAGE_UP
];

Pager.prototype.NEXT_IMAGE_KEYS = [
    KEY.RIGHT
];

Pager.prototype.PREVIOUS_IMAGE_KEYS = [
    KEY.LEFT
];




Pager.prototype.bindCallback = function (method, prevent) {
    var ctx = this,
        fn = this[method];

    var callback = function () {
        var event = arguments[0];
        // console.log(event);
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
    this.bindCallback('keydown', false); // well, difficult to manage focus though


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

    this.each(function(page){
        page.on('previous', this.pagePrevious, this);
        page.on('next', this.pageNext, this);
        if (page.slider) {
            page.slider.on('after:media', this.pageNext, this);
            page.slider.on('before:media', this.pagePrevious, this);
        }
    }, this);

};


Pager.prototype.start = function (pos) {
    console.log('START', pos);
    if (this.isStarted) {
        this.stop();
    }
    this.isStarted = true;
    this.wheelDeltas = [];
    this.startPos = pos;
    this.touchStartTime = _.now();
    this.touchDirection = -1;
    this.touchDeltas = [[0,0]];
    this.touchOffset = 0;

    this.each(function(page){
        page.setBookmark();
    });
};

Pager.prototype.stop = function () {
    console.log('STOP');
    this.isStarted = false;
    this.startPos = [0,0];
    this.touchDirection = -1;
    this.touchOffset = 0;
};

Pager.prototype.touchstart = function (event) {
    console.log('Pager.touchstart');
    var touches = event.changedTouches,
        touch = touches[0];

    this.currentTouchId = touch.identifier;
    this.start(this.getTouchEventPos(event, this.currentTouchId));
};

Pager.prototype.touchend = function (event) {
    console.log('Pager.touchend');

    if (this.isStarted) {
        var tsDiff = _.now() - this.touchStartTime;
        if (tsDiff < 200) {
            event.target.click();
        }
        else {
            var dir = this.touchDirection,
                cp = this.getCurrentPage(),
                offset = this.touchOffset;

            if (DIRECTION.HORIZONTAL === dir) {
                var slider = cp.slider;
                if (slider) {
                    this.checkOffset(offset, dir,
                                     slider.next, slider.previous, slider);
                }
            }
            else {
                this.checkOffset(offset, dir,
                                 this.pageNext, this.pagePrevious);
            }
        }


        this.each(function(page){
            page.resetBookmark();
        });
    }
    this.stop();
};

Pager.prototype.touchcancel = function (event) {
    console.log('Pager.touchcancel');
    this.stop();
};

Pager.prototype.touchmove = function (event) {
    console.log('Pager.touchmove');
    var id = this.currentTouchId,
        touch = touchFind(event, id);
    if (touch) {
        var pos = this.getTouchEventPos(event, id),
            startPos = this.startPos,
            tr = this.touchDeltas.reduce(function(a,b){
                return [a[0] + b[0], a[1] + b[1]];
            }),
            delta = [
                (pos[0] - startPos[0]) - tr[0],
                (pos[1] - startPos[1]) - tr[1]
            ];
        this.touchDeltas.push(delta);
        if (this.touchDirection < 0) {
            var vdiff = Math.abs(startPos[1] - pos[1]),
                hdiff = Math.abs(startPos[0] - pos[0]);

            if (vdiff > hdiff) {
                this.touchDirection = DIRECTION.VERTICAL;
            }
            else {
                this.touchDirection = DIRECTION.HORIZONTAL;
            }

        }

        var dir = this.touchDirection;
        this.touchOffset = pos[dir] - startPos[dir];
        if (DIRECTION.VERTICAL === dir) {
            this.each(function (page) {
                page.translate(delta[DIRECTION.VERTICAL]);
            });
        }

        // var dir = this.touchDirection,
        //     cp = this.getCurrentPage(),
        //     offset = pos[dir] - startPos[dir];
        //
        // if (DIRECTION.HORIZONTAL === dir) {
        //     var slider = cp.slider;
        //     if (slider) {
        //         this.checkOffset(offset, dir,
        //                          slider.next, slider.previous, slider);
        //     }
        // }
        // else {
        //     var isPaging = this.checkOffset(offset, dir,
        //                      this.pageNext, this.pagePrevious);
        //     if (/* !isPaging */ true) {
        //         this.each(function(page){
        //             page.translate(delta[DIRECTION.VERTICAL]);
        //         });
        //     }
        // }
    }
};

Pager.prototype.wheel = function (event) {
    console.log('Pager.wheel');
    var that = this;
    function wheelingStoper (){
        console.log('Pager.wheel.wheelingStoper');
        that.isWheeling = false;
    }
    if (this.isWheeling) {
        // clearTimeout(this.wheelingStopId);
        // this.wheelingStopId = setTimeout(wheelingStoper, 600);
        return;
    }
    if (!this.isStarted) {
        this.start([0,0]);
        this.isWheeling = true;
        clearTimeout(this.wheelingStopId);
        this.wheelingStopId = setTimeout(wheelingStoper, 600);
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
    return this.checkOffset(offset * 10, DIRECTION.VERTICAL,
                            this.pagePrevious, this.pageNext);
};

Pager.prototype.checkOffset = function (offset, dir, prev, next, ctx) {
    var threshold = this.threshold[dir],
        absOffset = Math.abs(offset);
    console.log('check', offset, threshold);
    if (absOffset >= threshold) {
        if (offset < 0) {
            prev.call(ctx || this);
        }
        else {
            next.call(ctx || this);
        }
        return true;
    }
    return false;
};


Pager.prototype.keydown = function (event) {
    if (isKeyCode(event, this.NEXT_KEYS)) {
        this.pageNext();
    }
    else if (isKeyCode(event, this.PREVIOUS_KEYS)) {
        this.pagePrevious();
    }
    else {
        var cp = this.getCurrentPage(),
            slid = cp.slider;
        if (slid) {
            if (isKeyCode(event, this.PREVIOUS_IMAGE_KEYS)) {
                slid.previous();
            }
            else if (isKeyCode(event, this.NEXT_IMAGE_KEYS)) {
                slid.next();
            }
        }
    }
};

Pager.prototype.at = function (index, silent) {
    this.stop();
    index = _.clamp(index, 0, this.pages.length - 1);

    if ((index === this.index) || this.isAnimating) {
        return;
    }
    this.isAnimating = true;

    var that = this,
        rect = this.node.getBoundingClientRect(),
        height = rect.height,
        oldIndex = this.index,
        nextPage = this.pages[index],
        nextNextPage = undefined;

    this.index = index;

    if (oldIndex < index) {
        nextNextPage = this.pages[index + 1]
    }
    else {
        nextNextPage = this.pages[index - 1];
    }
    if (nextNextPage && nextNextPage.slider) {
        nextNextPage.slider.start();
    }

    function animationEnd () {
        that.emit('stop:animation');
    }

    var nextOptions = {
        complete: animationEnd,
        duration: SPEED.FAST
    };
    that.each(function(page){
        page.setStyle('zIndex', ZINDEX.BACK);
    });
    nextPage.setStyle('zIndex', ZINDEX.FRONT);
    nextPage.after(function () {
        nextPage.once('stop:animation', function(){
            that.each(function(page){
                if(page.index !== nextPage.index) {
                    // page.translate(offset, {
                    //     duration: SPEED.SLOW
                    // });
                    // page.setOffset((page.index - index) * height, {
                    //     duration: SPEED.FAST
                    // });
                    page.setOffset((page.index - index) * height);
                }
            });
        });
        if (nextPage.slider) {
            nextPage.once('stop:animation', nextPage.slider.start, nextPage.slider);
        }
        nextPage.setOffset(0, nextOptions);
    });

    if (!silent) {
        this.emit('change:page', index);
    }

    setDocumentTitle(nextPage.data['page.title'] || 'untitled');
};

Pager.prototype.pagePrevious = function () {
    this.at(this.index - 1);
};

Pager.prototype.pageNext = function () {
    this.at(this.index + 1);
};


function Menu (container, pager, index) {
    this.container = container;
    this.pager = pager;
    this.listContainer = container.querySelector('[data-role="menu-items"]');
    var attributeString = this.listContainer.getAttribute('data-attributes') || '';
    var attrs = {};
    _.each(attributeString.split(';'), function (item) {
        var kv = item.split('='),
            k = kv[0].trim(),
            v = kv[1].trim();
        attrs[k] = v;
    });
    this.attrs = attrs;
    this.build();

    function toggleMenu () {
        var t = Toggler.prototype.getToggle('.menu');
        if (t && t.isOn()) {
            t.toggle(true);
        }
    }

    pager.node.addEventListener('click', function (event) {
        var eventTarget = event.target,
            role = eventTarget.getAttribute('data-role'),
            target = eventTarget.getAttribute('data-target');
        if (role
            && ('toggle' === role)
            && target
            && ('.menu' === target)) {
            return;
        }
        toggleMenu();
    }, false);


    pager.on('change:page', function (event) {
        // console.log('on.page:change', event.data);
        var idx = event.data,
            currentElem = this.elements[idx];

        _.forEach(this.elements, function (elem) {
            removeClass(elem, 'active');
        });
        addClass(currentElem, 'active');
        this.isPaging = false;
    }, this);
    addClass(this.elements[index], 'active');

    this.touchy();
}

Menu.prototype.navigator = function (index) {
    var that = this;
    return function () {
        that.isPaging = true;
        that.pager.at(index);
    };
};

Menu.prototype.build = function () {
    if (this.listContainer) {
        var pages = Sectioner.pages;
        var fattrs = function (elem) {
            return function (v, k) {
                elem.setAttribute(k, v);
            };
        };
        this.elements = [];
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx],
                title = page['page.title'];
            var elem = document.createElement('div');
            _.each(this.attrs, fattrs(elem));
            elem.innerHTML = title;
            this.listContainer.appendChild(elem);
            elem.addEventListener('click', this.navigator(idx), false);
            this.elements.push(elem);
        }
    }
};

Menu.prototype.touchy = function () {
    var that = this,
        container = this.container,
        touchId = null,
        startPos = 0,
        offset = 0;


        function offsetize () {
            if (offset === null) {
                container.style.left = '';
            }
            else {
                container.style.left = offset + 'px';
            }
        }

        container.addEventListener('touchstart', function (event) {
            console.log('touchstart');
            var touches = event.changedTouches,
                touch = touches[0];
            touchId = touch.identifier;
            startPos = touch.clientX; //getTouchEventPos(container, event, touchId);
        }, false);

        container.addEventListener('touchend', function (event) {
            var absOffset = Math.abs(offset);
            offset = null;
            if (absOffset < 2) {
                console.log('touchend was a click');
                return offsetize();
            }
            if (!that.isPaging
                && (absOffset > 32)){
                var t = Toggler.prototype.getToggle('.menu');
                if (t && t.isOn()) {
                    container.style.visibility = 'hidden';
                    var resetElem = function () {
                        container.style.left = '';
                        container.style.visibility = '';
                        container.removeEventListener('animationend', resetElem, false);
                    }
                    container.addEventListener('animationend', resetElem, false);
                    t.toggle(true);
                }
                // removeClass(container, 'on');
                //
                // var rect = container.getBoundingClientRect();
                // container.style.left = '-' + rect.width + 'px';
                // // container.style.left = '';
                // container.style.visibility = 'hidden';
                // function resetElem () {
                //     container.style.left = '';
                //     container.style.visibility = '';
                //     container.addEventListener('animationend', resetElem, false);
                // }
                // ['animationend', 'webkitAnimationEnd'].forEach(function (tr) {
                //     container.addEventListener(tr, resetElem, false);
                // })
                // addClass(container, 'off');
                return;
            }
            offsetize();
        }, false);

        container.addEventListener('touchmove', function (event) {
            var touches = event.changedTouches,
                touch = touchFind(event, touchId);
            if (touch) {
                // var pos = getTouchEventPos(container, event, touchId);
                // offset = pos[0] - startPos[0];
                offset = Math.min(touch.clientX  - startPos, 0);
                // console.log(touch.clientX, offset);
                offsetize();
            }
        }, false);

        container.addEventListener('touchcancel', function (event) {
            offset = null;
            offsetize();
        }, false);
}


function Toggle (selector) {
    this.status = false;
    this.targets = document.querySelectorAll(selector);
}

Toggle.prototype.getTargets = function () {
    return this.targets;
};

Toggle.prototype.toggle = function (state, elem) {
    var on = 'on',
        off = 'off';

    function onner (node) {
        removeClass(node, off);
        addClass(node, on);
    }

    function offer (node) {
        removeClass(node, on);
        addClass(node, off);
    }

    var targets = this.getTargets(),
        op = state ? offer : onner,
        i = 0;

    if (elem) {
        op(elem);
    }
    for (; i < targets.length; i++) {
        op(targets.item(i));
    }
    this.t();
};

Toggle.prototype.getHandler = function (elem) {
    var that = this;
    function toggleHandler (evt) {
        that.toggle(that.isOn(), elem);
    }
    return toggleHandler;
};

Toggle.prototype.isOn = function () {
    return !!(this.status);
};

Toggle.prototype.t = function () {
    this.status = !this.status;
    return this;
};




function Toggler (elem) {
    var selector = elem.getAttribute('data-target'),
        initStateAttr = elem.getAttribute('data-state') || 'off',
        id = _.uniqueId('T.'),
        initState = false;

    var attrOn = ['1', 'true', 'visible', 'on'];

    _.each(attrOn, function (pat) {
        var re = new RegExp('^' + pat + '$', 'i');
        if (re.test(initStateAttr)) {
            initState = true;
        }
    });

    elem.setAttribute('id', id);
    var tog = this.registerToggle(selector);

    if (!tog.isOn()) {
        if (initState) {
            console.log('\t switched on by', id);
            tog.toggle(false, elem);
        }
    }

    elem.addEventListener('click', tog.getHandler(elem), false);
}


Toggler.prototype.registry = {};

Toggler.prototype.registerToggle = function(selector) {
    if (!(selector in this.registry)) {
        this.registry[selector] = new Toggle(selector);
    }
    return this.registry[selector];
};

Toggler.prototype.getToggle = function(selector) {
    if (selector in this.registry) {
        return this.registry[selector];
    }
    return null;
};

function Router (pager) {
    var hasHistory = ((typeof window !== 'undefined') && window.history && window.history.pushState);

    this.pager = pager;
    if (hasHistory) {
        this.history = window.history;
        pager.on('change:page', this.push, this);
        window.onpopstate = _.bind(function(evt){
            this.pop(evt.state);
        }, this);
    }
}

Router.prototype.push = function () {
    console.log('router.push');
    if (this.history) {
        var page = this.pager.getCurrentPage(),
            pageData = page.data,
            title = pageData['page.title'],
            slug = pageData['slug'];
        this.history.pushState(page.index, title, '/' + slug + '.html');
    }
};


Router.prototype.pop = function (index, title) {
    console.log('router.pop');
    this.pager.at(index, true);
};

document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        var viewport = document.querySelector("#viewport");
        var currentPage = viewport.querySelector(".page");
        var index = parseInt(currentPage.getAttribute("data-index"));
        var menu = document.querySelector('[data-role="menu"]');
        if (isNaN(index)) {
            return;
        }


        var pager = new Pager(viewport, Sectioner.pages, index);
        var router = new Router(pager);

        if (menu) {
            new Menu(menu, pager, index);
        }

        var togglerElements = document.querySelectorAll('[data-role="toggle"]'),
            togglers = [];

        for (var t = 0; t < togglerElements.length; t++) {
            togglers.push(new Toggler(togglerElements.item(t)));
        }


        window.addEventListener("resize", _.debounce(function(){
            // console.log('resize', _.uniqueId('R.'));
            pager.resize();
        }, 500), false);
    }
};

})(window);
