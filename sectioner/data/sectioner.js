/**
 * sectioner.js
 *
 */


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
}

Object.freeze(ZINDEX);

var SPEED = {
    FAST: 100,
    MEDIUM: 500,
    SLOW: 1000
}

Object.freeze(SPEED);

var DIRECTION = {
    VERTICAL: 1,
    HORIZONTAL: 0
}

Object.freeze(DIRECTION);


function mkEmiter (obj, node) {
    var prefix = Date.now() + '#';

    node = node || document;

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
        exports.addClass(elem, c);
    }
    else {
        exports.removeClass(elem, c);
    }
}

function hasClass (elem, c) {
    var ecStr = elem.getAttribute('class');
    var ec = ecStr ? ecStr.split(' ') : [];
    return !(_.indexOf(ec, c) < 0)
}

function removeClass (elem, c) {
    var ecStr = elem.getAttribute('class');
    var ec = ecStr ? ecStr.split(' ') : [];
    elem.setAttribute('class', _.without(ec, c).join(' '));
}


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
    this.height = parentRect.height,
    this.width = this.height * aspect;
    node.setAttribute('class', 'slider-image');
    node.setAttribute('width', this.width);
    node.setAttribute('height', this.height);

    mkEmiter(this, node);
}


SImage.prototype.getMeta = function () {
    return (this.html || '');
}

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
    };
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
    };
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
    Object.defineProperty(this, 'meta', {
        get: function(){
            return currentMeta;
        },
        set: function(im){
            currentMeta = im.getMeta();
        }
    });

    var offset = 0;
    for (var idx = 0; idx < data.items.length; idx++) {
        var si = new SImage(node, data.items[idx]);
        this.images.push(si);
        si.setOffset(offset);

        offset += si.width + this.gap;
    }

    mkEmiter(this, node);
}


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
    }, this)
    _.each(this.images, function(im){
        im.translate(offset, {
            duration: SPEED.MEDIUM
        });
    });
    this.meta = this.images[index];
    this.emit('change:media');
};

Slider.prototype.next = function () {
    this.at(this.index + 1);
}

Slider.prototype.previous = function () {
    this.at(this.index - 1);
}



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


    this.offset = 0;
    this.callbacks = [];

    this.attachSlider(pageData);
    mkEmiter(this, this.node);
}

Page.prototype.attachSlider = function (pageData) {
    var media = pageData.media;
    if (!media) {
        return;
    }
    var node = this.node.querySelector('[data-role="media.slider"]');
    this.slider = new Slider(node, media);
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
 * @param   {Array}      pages     [[Description]]
 * @param   {number}   index     optional, defaulut to 0, internal index initializer
 * @returns {[[Type]]}   [[Description]]
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
                tr = [Math.floor(rect.width * 0.3), Math.floor(rect.height * 0.3)];
            return tr;
        }
    });

    this.index = index || 0;
    emptyElement(elem);
    var pages = [],
        rect = elem.getBoundingClientRect(),
        height = rect.height;

    for (var i = 0; i < collection.length; i++) {
        var page = new Page(this.node, collection, i);
        if(i === this.index) {
            page.setStyle('zIndex', ZINDEX.BACK);
            if (page.slider) {
                page.slider.start();
            }
        }
        else {
            page.setStyle('zIndex', ZINDEX.FRONT);
        }
        var iOffset = i - this.index;
        // console.log('initial position', i, iOffset * height);
        page.setOffset(iOffset * height);
        pages.push(page);
    }

    Object.defineProperty(this, 'pages', {value: pages});
    this.setHandlers();
}

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


Pager.prototype.touchFind = function (ev, id) {
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
};

Pager.prototype.getTouchEventPos = function (ev, id) {
    if (ev instanceof TouchEvent) {
        var touch = this.touchFind(ev, id);
        if (touch) {
            var target = this.node,
                trect = target.getBoundingClientRect();
            return [
                touch.clientX - trect.left,
                touch.clientY - trect.top
            ];
        }
    }
    return [0, 0];
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

};


Pager.prototype.start = function (pos) {
    console.log('START', pos);
    if (this.isStarted) {
        this.stop();
    }
    this.isStarted = true;
    this.wheelDeltas = [];
    this.startPos = pos;
    this.touchDirection = -1;
    this.touchDeltas = [[0,0]];
};

Pager.prototype.stop = function () {
    console.log('STOP');
    this.isStarted = false;
    this.startPos = [0,0];
    this.touchDirection = -1;
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
        var sp = this.startPos,
            delta = this.touchDeltas.reduce(function(a,b){
            return [a[0] + b[0], a[1] + b[1]];
        }, [sp[0], sp[1]]);
        console.log('Pager.touchend reset', delta);
        this.each(function(page){
            page.translate(-delta[DIRECTION.VERTICAL], {
                duration: SPEED.MEDIUM
            });
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
        touch = this.touchFind(event, id);
    if (touch) {
        var pos = this.getTouchEventPos(event, id),
            startPos = this.startPos,
            tr = this.touchDeltas.reduce(function(a,b){
                return [a[0] + b[0], a[1] + b[1]];
            }),
            delta = [
                pos[0] - [startPos[0] + tr[0]],
                pos[1] - [startPos[1] + tr[0]]
            ];
        this.touchDeltas.push(delta);
console.log('POS', pos);
console.log('TR', tr);
console.log('DELTA', delta);
        {
            var debugPos = startPos[1] + tr[1] + delta[1];
            console.log('DEBUG', debugPos === pos[1]);
        }
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

        var dir = this.touchDirection,
            cp = this.getCurrentPage(),
            offset = pos[dir] - startPos[dir];

        if (DIRECTION.HORIZONTAL === dir) {
            var slider = cp.slider;
            if (slider) {
                this.checkOffset(offset, dir,
                                 slider.next, slider.previous, slider);
            }
        }
        else {
            var isPaging = this.checkOffset(offset, dir,
                             this.pageNext, this.pagePrevious);
            if (!isPaging) {
                this.each(function(page){
                    page.translate(delta[DIRECTION.VERTICAL]);
                });
            }
        }
    }
};

Pager.prototype.wheel = function (event) {
    console.log('Pager.wheel');
    var that = this;
    function wheelingStoper (){
        that.isWheeling = false;
    }
    if (this.isWheeling) {
        clearTimeout(this.wheelingStopId);
        this.wheelingStopId = setTimeout(wheelingStoper, 1000);
        return;
    }
    if (!this.isStarted) {
        this.start([0,0]);
        this.isWheeling = true;
        this.wheelingStopId = setTimeout(wheelingStoper, 1000);
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

Pager.prototype.at = function (index) {
    this.stop();
    index = _.clamp(index, 0, this.pages.length - 1);

    if ((index === this.index) || this.isAnimating) {
        return;
    }
    this.isAnimating = true;

    var that = this,
        rect = this.node.getBoundingClientRect(),
        height = rect.height,
        // offsets = [], //(this.index - index) * rect.height,
        nextPage = this.pages[index];

    this.index = index;
    //
    // for (var i = 0; i < this.images.length; i++) {
    //     offsets.push((i - index) * height);
    // }

    function animationEnd () {
        that.emit('stop:animation');
    }


    var nextOptions = {
        complete: animationEnd,
        duration: SPEED.MEDIUM
    };
    that.each(function(page){
        page.setStyle('zIndex', ZINDEX.BACK);
    });
    nextPage.setStyle('zIndex', ZINDEX.FRONT);
    nextPage.after(function(){
        nextPage.once('start:animation', function(){
            that.each(function(page){
                if(page.index !== nextPage.index) {
                    // page.translate(offset, {
                    //     duration: SPEED.SLOW
                    // });
                    page.setOffset((page.index - index) * height, {
                        duration: SPEED.SLOW
                    });
                }
            });
        });
        if (nextPage.slider) {
            nextPage.once('stop:animation', nextPage.slider.start, nextPage.slider);
        }
        nextPage.setOffset(0, nextOptions);
    });
};

Pager.prototype.pagePrevious = function () {
    this.at(this.index - 1);
};

Pager.prototype.pageNext = function () {
    this.at(this.index + 1);
};


function Menu (container, pager) {
    this.container = container;
    this.pager = pager;
    this.listContainer = container.querySelector('[data-role="menu-items"]');
    this.build();
}

Menu.prototype.navigator = function (index) {
    var that = this;
    return function () {
        that.pager.at(index);
    };
};

Menu.prototype.build = function () {
    if (this.listContainer) {
        var pages = Sectioner.pages;
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx],
                title = page['page.title'];
            var elem = document.createElement('div');
            elem.setAttribute('class', 'menu-item');
            elem.innerHTML = title;
            this.listContainer.appendChild(elem);
            elem.addEventListener('click', this.navigator(idx), false);
        }
    }
};


function Toggler (elem) {
    var on = 'on',
        off = 'off';

    var selector = elem.getAttribute('data-target'),
            targets = document.querySelectorAll(selector),
        isOn = false;

    function onner (node) {
        removeClass(node, off);
        addClass(node, on);
    }

    function offer (node) {
            removeClass(node, on);
            addClass(node, off);
    }

    function toggle (evt) {
        var i = 0;
        if (isOn) {
            offer(elem);
            for (; i < targets.length; i++) {
                offer(targets.item(i));
            }
        }
        else {
            onner(elem);
            for (; i < targets.length; i++) {
                onner(targets.item(i));
            }
        }
        isOn = !isOn;
    }

    elem.addEventListener('click', toggle, false);
}

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
        if (menu) {
            new Menu(menu, pager);
        }

        var togglers = document.querySelectorAll('[data-role="toggle"]');

        for (var t = 0; t < togglers.length; t++) {
            new Toggler(togglers.item(t));
        }
    }
};
