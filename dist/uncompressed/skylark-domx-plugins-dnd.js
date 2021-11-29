/**
 * skylark-domx-plugins-dnd - The dnd features enhancement for dom.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-domx-plugins-dnd/dnd',[
    "skylark-domx-plugins-base/plugins"
], function(plugins) {

	return plugins.dnd = {};
});


define('skylark-domx-plugins-dnd/fallback/data-transfer',[],function(){
    'use strict';

    /**
     * Object used to hold the data that is being dragged during drag and drop operations.
     *
     * It may hold one or more data items of different types. For more information about
     * drag and drop operations and data transfer objects, see
     * <a href="https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer">HTML Drag and Drop API</a>.
     *
     * This object is created automatically by the @see:DragDropTouch singleton and is
     * accessible through the @see:dataTransfer property of all drag events.
     */

    function DataTransfer() {
        this._dropEffect = 'move';
        this._effectAllowed = 'all';
        this._data = {};
    }
    Object.defineProperty(DataTransfer.prototype, "dropEffect", {
        /**
         * Gets or sets the type of drag-and-drop operation currently selected.
         * The value must be 'none',  'copy',  'link', or 'move'.
         */
        get: function () {
            return this._dropEffect;
        },
        set: function (value) {
            this._dropEffect = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTransfer.prototype, "effectAllowed", {
        /**
         * Gets or sets the types of operations that are possible.
         * Must be one of 'none', 'copy', 'copyLink', 'copyMove', 'link',
         * 'linkMove', 'move', 'all' or 'uninitialized'.
         */
        get: function () {
            return this._effectAllowed;
        },
        set: function (value) {
            this._effectAllowed = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTransfer.prototype, "types", {
        /**
         * Gets an array of strings giving the formats that were set in the @see:dragstart event.
         */
        get: function () {
            return Object.keys(this._data);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Removes the data associated with a given type.
     *
     * The type argument is optional. If the type is empty or not specified, the data
     * associated with all types is removed. If data for the specified type does not exist,
     * or the data transfer contains no data, this method will have no effect.
     *
     * @param type Type of data to remove.
     */
    DataTransfer.prototype.clearData = function (type) {
        if (type != null) {
            delete this._data[type];
        }
        else {
            this._data = null;
        }
    };
    /**
     * Retrieves the data for a given type, or an empty string if data for that type does
     * not exist or the data transfer contains no data.
     *
     * @param type Type of data to retrieve.
     */
    DataTransfer.prototype.getData = function (type) {
        return this._data[type] || '';
    };
    /**
     * Set the data for a given type.
     *
     * For a list of recommended drag types, please see
     * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Recommended_Drag_Types.
     *
     * @param type Type of data to add.
     * @param value Data to add.
     */
    DataTransfer.prototype.setData = function (type, value) {
        this._data[type] = value;
    };
    /**
     * Set the image to be used for dragging if a custom one is desired.
     *
     * @param img An image element to use as the drag feedback image.
     * @param offsetX The horizontal offset within the image.
     * @param offsetY The vertical offset within the image.
     */
    DataTransfer.prototype.setDragImage = function (img, offsetX, offsetY) {
        this._imgCustom = img;
        this._imgOffset = { x: offsetX, y: offsetY };
    };

    return DataTransfer;
});
define('skylark-domx-plugins-dnd/fallback/moused-drag-drop',[
    "skylark-langx",
    "skylark-domx-noder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-finder",
    "skylark-domx-plugins-scrolls/auto-scroll",
    "./data-transfer"
],function(
    langx,
    noder,
    $,
    eventer,
    styler,
    finder,
    AutoScroll,
    DataTransfer
){
    'use strict';

    var MousedDragDrop = langx.Emitter.inherit({
        /**
         * Initializes the single instance of the @see:MousedDragDrop class.
         */
        _construct : function(dnd,dragSource,ptDown) {
            this.dnd = dnd;
            this._dragSource  =dragSource;
            this._ptDown = ptDown;


            this._lastClick = 0;
            this._isDragEnabled = true;
            this._dataTransfer = new DataTransfer();



            var $doc = $(document);

            this.listenTo($doc,"mousemove",this._onMouseMove);
            this.listenTo($doc,"mouseup",this._onMouseUp);

        },

        _onMouseMove : function (e) {
            if (this._shouldCancelPressHoldMove(e)) {
              this._reset();
              return;
            }
            if (this._shouldHandleMove(e) || this._shouldHandlePressHoldMove(e)) {
                var target = this._getTarget(e);

                // start dragging
                if (this._dragSource && !this._img && this._shouldStartDragging(e)) {
                    this._dispatchEvent(e, 'dragstart', this._dragSource);
                    this._createImage(e);
                    this._dispatchEvent(e, 'dragenter', target);
                }
                // continue dragging
                if (this._img) {
                    this._lastTouch = e;
                    e.preventDefault(); // prevent scrolling
                    if (target != this._lastTarget) {
                        this._dispatchEvent(this._lastTouch, 'dragleave', this._lastTarget);
                        this._dispatchEvent(e, 'dragenter', target);
                        this._lastTarget = target;
                    }
                    this._moveImage(e);
                    this._isDropZone = this._dispatchEvent(e, 'dragover', target);
                }

                this._handleAutoScroll(e);

            }
        },

        _onMouseUp : function (e) {
            if (this._shouldHandle(e)) {
                // finish dragging
                this._destroyImage();
                if (this._dragSource) {
                    if (e.type.indexOf('cancel') < 0 && this._isDropZone) {
                        this._dispatchEvent(this._lastTouch, 'drop', this._lastTarget);
                    }
                    this._dispatchEvent(this._lastTouch, 'dragend', this._dragSource);
                }
            }
            this.destroy();
        },

        // ** utilities
        // ignore events that have been handled or that involve more than one touch
        _shouldHandle : function (e) {
            return e &&
                !e.defaultPrevented ;
        },

        // use regular condition outside of press & hold mode
        _shouldHandleMove : function (e) {
          return !MousedDragDrop._ISPRESSHOLDMODE && this._shouldHandle(e);
        },

        // allow to handle moves that involve many touches for press & hold
        _shouldHandlePressHoldMove : function (e) {
          return MousedDragDrop._ISPRESSHOLDMODE &&  this._isDragEnabled ;
        },

        // reset data if user drags without pressing & holding
        _shouldCancelPressHoldMove : function (e) {
          return MousedDragDrop._ISPRESSHOLDMODE && !this._isDragEnabled &&
              this._getDelta(e) > MousedDragDrop._PRESSHOLDMARGIN;
        },

        // start dragging when specified delta is detected
        _shouldStartDragging : function (e) {
            var delta = this._getDelta(e);
            return delta > MousedDragDrop._THRESHOLD ||
                (MousedDragDrop._ISPRESSHOLDMODE && delta >= MousedDragDrop._PRESSHOLDTHRESHOLD);
        },

        // clear all members
        _reset : function () {
            this._destroyImage();
            this._dragSource = null;
            this._lastTouch = null;
            this._lastTarget = null;
            this._ptDown = null;
            this._isDragEnabled = false;
            this._isDropZone = false;
            this._dataTransfer = null;
            clearInterval(this._pressHoldInterval);


            if (this.pointerElemChangedInterval){
                clearInterval(this.pointerElemChangedInterval); 
                this.pointerElemChangedInterval = null
            } 
            if (this.autoscroller) {
                this.autoscroller.destroy();
                this.autoscroller = null;               
            }
        },

        // get point for a touch event
        _getPoint : function (e, page) {
             return { x: page ? e.pageX : e.clientX, y: page ? e.pageY : e.clientY };
        },

        // get distance between the current touch event and the first one
        _getDelta : function (e) {
            if (MousedDragDrop._ISPRESSHOLDMODE && !this._ptDown) { return 0; }
            var p = this._getPoint(e);
            return Math.abs(p.x - this._ptDown.x) + Math.abs(p.y - this._ptDown.y);
        },

        // get the element at a given touch event
        _getTarget : function (e) {
            var pt = this._getPoint(e), el = document.elementFromPoint(pt.x, pt.y);
            while (el && getComputedStyle(el).pointerEvents == 'none') {
                el = el.parentElement;
            }
            return el;
        },

        // create drag image from source element
        _createImage : function (e) {
            // just in case...
            if (this._img) {
                this._destroyImage();
            }
            // create drag image from custom element or drag source
            this._imgCustom = this._dataTransfer._imgCustom;
            this._imgOffset = this._dataTransfer._imgOffset;

            var src = this._imgCustom || this._dragSource;
            this._img = src.cloneNode(true);
            this._copyStyle(src, this._img);
            this._img.style.top = this._img.style.left = '-9999px';
            // if creating from drag source, apply offset and opacity
            if (!this._imgCustom) {
                var rc = src.getBoundingClientRect(), 
                    pt = this._getPoint(e);

                this._imgOffset = { x: pt.x - rc.left, y: pt.y - rc.top };
                this._img.style.opacity = MousedDragDrop._OPACITY.toString();
            }
            // add image to document
            this._moveImage(e);
            document.body.appendChild(this._img);
        },

        // dispose of drag image element
        _destroyImage : function () {
            if (this._img) {
                noder.remove(this._img);
            }
            this._img = null;
            this._imgCustom = null;
        },

        // move the drag image element
        _moveImage : function (e) {
            var _this = this;
            langx.defer(function () {
                if (_this._img) {
                    var pt = _this._getPoint(e, true);
                    styler.css(_this._img,{
                        position : 'absolute',
                        pointerEvents : 'none',
                        zIndex : '999999',
                        left : Math.round(pt.x - _this._imgOffset.x) + 'px',
                        top : Math.round(pt.y - _this._imgOffset.y) + 'px'
                    });
                }
            });
        },

        // copy properties from an object to another
        _copyProps : function (dst, src, props) {
            for (var i = 0; i < props.length; i++) {
                var p = props[i];
                dst[p] = src[p];
            }
        },

        _copyStyle : function (src, dst) {
            // remove potentially troublesome attributes
            MousedDragDrop._rmvAtts.forEach(function (att) {
                dst.removeAttribute(att);
            });
            // copy canvas content
            if (src instanceof HTMLCanvasElement) {
                var cSrc = src, cDst = dst;
                cDst.width = cSrc.width;
                cDst.height = cSrc.height;
                cDst.getContext('2d').drawImage(cSrc, 0, 0);
            }
            // copy style (without transitions)
            var cs = getComputedStyle(src);
            for (var i = 0; i < cs.length; i++) {
                var key = cs[i];
                if (key.indexOf('transition') < 0) {
                    dst.style[key] = cs[key];
                }
            }
            dst.style.pointerEvents = 'none';
            // and repeat for all children
            for (var i = 0; i < src.children.length; i++) {
                this._copyStyle(src.children[i], dst.children[i]);
            }
        },

        _dispatchEvent : function (e, type, target) {
            if (e && target) {
                var evt = document.createEvent('Event'), t = e.touches ? e.touches[0] : e;
                evt.initEvent(type, true, true);
                evt.button = 0;
                evt.which = evt.buttons = 1;
                this._copyProps(evt, e, MousedDragDrop._kbdProps);
                this._copyProps(evt, t, MousedDragDrop._ptProps);
                evt.dataTransfer = this._dataTransfer;
                target.dispatchEvent(evt);
                return evt.defaultPrevented;
            }
            return false;
        },

        // gets an element's closest draggable ancestor
        _closestDraggable : function (e) {
            for (; e; e = e.parentElement) {
                if (e.hasAttribute('data-draggable')) {
                    return e;
                }
            }
            return null;
        },

        _handleAutoScroll: function(evt) {
            var dnd = this.dnd;

            var x = evt.clientX,
                y = evt.clientY,

                elem = document.elementFromPoint(x, y);


            // Listener for pointer element change
            ////var ogElemScroller = finder.scrollableParent(elem, true);
            if (
                (
                    !this.pointerElemChangedInterval ||
                    x !== this.lastPointerElemX ||
                    y !== this.lastPointerElemY
                )
            ) {

                if (this.pointerElemChangedInterval){
                    clearInterval(this.pointerElemChangedInterval); 
                } 
                // Detect for pointer elem change, emulating native DnD behaviour
                var ogElemScroller = null ;
                this.pointerElemChangedInterval = setInterval(function() {
                    // could also check if scroll direction on newElem changes due to parent autoscrolling
                    var newElem = finder.scrollableParent(document.elementFromPoint(x, y), true);
                    if (newElem !== ogElemScroller) {
                        ogElemScroller = newElem;
                        if (this.autoscroller) {
                            this.autoscroller.destroy();
                            this.autoscroller = null;
                        }
                        this.autoscroller = new AutoScroll(ogElemScroller,dnd.dragging.options);
                        this.autoscroller.handle(x,y);
                    }
                }, 10);
                this.lastPointerElemX = x;
                this.lastPointerElemY = y;
            }
        },


        destroy : function() {
            this.unlistenTo();
            this._reset();
        }
    });

    // constants
    MousedDragDrop._THRESHOLD = 5; // pixels to move before drag starts
    MousedDragDrop._OPACITY = 0.5; // drag image opacity
    MousedDragDrop._DBLCLICK = 500; // max ms between clicks in a double click
    MousedDragDrop._CTXMENU = 900; // ms to hold before raising 'contextmenu' event
    MousedDragDrop._ISPRESSHOLDMODE = false; // decides of press & hold mode presence
    MousedDragDrop._PRESSHOLDAWAIT = 400; // ms to wait before press & hold is detected
    MousedDragDrop._PRESSHOLDMARGIN = 25; // pixels that finger might shiver while pressing
    MousedDragDrop._PRESSHOLDTHRESHOLD = 0; // pixels to move before drag starts
    // copy styles/attributes from drag source to drag image element
    MousedDragDrop._rmvAtts = 'id,class,style,draggable'.split(',');
    // synthesize and dispatch an event
    // returns true if the event has been handled (e.preventDefault == true)
    MousedDragDrop._kbdProps = 'altKey,ctrlKey,metaKey,shiftKey'.split(',');
    MousedDragDrop._ptProps = 'pageX,pageY,clientX,clientY,screenX,screenY'.split(',');	

    return MousedDragDrop
});
define('skylark-domx-plugins-dnd/manager',[
    "skylark-langx/langx",
    "skylark-langx-hoster/is-mobile",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "./dnd",
    "./fallback/moused-drag-drop"
], function(langx, isMobile,noder, datax, finder, geom, eventer, styler,dnd,MousedDragDrop) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;


        // This will not pass for IE9, because IE9 DnD only works on anchors
    var  supportDraggable = ('draggable' in document.createElement('div')) && !isMobile.apple.device; //TODO move to xxx


    var Manager = dnd.Manager = langx.Evented.inherit({
        klassName: "Manager",

        init: function() {

        },

        prepare: function(draggable,event) {
            var e = eventer.create("preparing", {
                dragSource: draggable.dragSource,
                dragHandle: draggable.dragHandle,
                originalEvent : event
            });
            draggable.trigger(e);
            draggable.dragSource = e.dragSource;
            draggable.dragHandle = e.dragHandle;


            if (draggable.dragSource) {
                this.useNativeDnd =  draggable.options.forceFallback ? false : supportDraggable;  
                this.dragging = draggable;

                datax.data(draggable.dragSource, "draggable", true);
                if (this.useNativeDnd) {
                    datax.attr(draggable.dragSource, "draggable", 'true');
                } else {
                    this._fallbacker = new MousedDragDrop(this,draggable.dragSource,draggable.startPos);
                }

                try {
                    if (document.selection) {
                       document.selection.empty();
                    } else {
                        window.getSelection().removeAllRanges();
                    }
                } catch (err) {
                }
            }
        },

        start: function(draggable, event) {
            datax.data(draggable.dragSource, "draggable", false);
            if (this.useNativeDnd) {
                datax.attr(draggable.dragSource, "draggable", 'false');
            }

            var p = geom.pagePosition(draggable.dragSource);
            this.draggingOffsetX = parseInt(event.pageX - p.left);
            this.draggingOffsetY = parseInt(event.pageY - p.top)

            var e = eventer.create("started", {
                elm: draggable.elm,
                dragSource: draggable.dragSource,
                dragHandle: draggable.dragHandle,
                ghost: null,

                originalEvent : event,

                transfer: {}
            });

            draggable.trigger(e);


            this.dragging = draggable;

            if (draggable.draggingClass) {
                styler.addClass(draggable.dragSource, draggable.draggingClass);
            }

            this.draggingGhost = e.ghost;
            if (!this.draggingGhost) {
                this.draggingGhost = draggable.dragSource;
            }

            this.draggingTransfer = e.transfer;
            if (this.draggingTransfer) {

                langx.each(this.draggingTransfer, function(key, value) {
                    event.dataTransfer.setData(key, value);
                });
            }

            event.dataTransfer.setDragImage(this.draggingGhost, this.draggingOffsetX, this.draggingOffsetY);

            ///event.dataTransfer.effectAllowed = "copyMove";

            var e1 = eventer.create("dndStarted", {
                elm: e.elm,
                dragSource: e.dragSource,
                dragHandle: e.dragHandle,
                ghost: e.ghost,
                transfer: e.transfer,
                dragging : this.dragging
            });

            this.trigger(e1);
        },

        over: function() {

        },

        end: function(dropped) {
            var dragging = this.dragging;
            if (dragging) {
                if (dragging.draggingClass) {
                    styler.removeClass(dragging.dragSource, dragging.draggingClass);
                }
            }

            var e2 = eventer.create("ended", {
                originalEvent : e
            });

            this.dragging.trigger(e2);


            var e = eventer.create("dndEnded", {});
            this.trigger(e);


            this.dragging = null;
            this.draggingTransfer = null;
            this.draggingGhost = null;
            this.draggingOffsetX = null;
            this.draggingOffsetY = null;
        }
    });

    var manager = new Manager();


    return manager;
});
define('skylark-domx-plugins-dnd/Draggable',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-devices-points/touch",
    "skylark-domx-plugins-base",
    "./dnd",
    "./manager"
], function(langx, noder, datax, finder, geom, eventer, styler, touch, plugins, dnd,manager) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;



    var Draggable = plugins.Plugin.inherit({
        klassName: "Draggable",
        
        pluginName : "lark.dnd.draggable",

        options : {
            draggingClass : "dragging",
            forceFallback : false
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            var self = this,
                options = this.options;

            self.draggingClass = options.draggingClass;

            ["preparing", "started", "ended", "moving"].forEach(function(eventName) {
                if (langx.isFunction(options[eventName])) {
                    self.on(eventName, options[eventName]);
                }
            });

            touch.mousy(elm);

            eventer.on(elm, {
                "mousedown": function(e) {
                    var options = self.options;
                    if (options.handle) {
                        if (langx.isFunction(options.handle)) {
                            self.dragHandle = options.handle(e.target,self._elm);
                        } else {
                            self.dragHandle = finder.closest(e.target, options.handle,self._elm);
                        }
                        if (!self.dragHandle) {
                            return;
                        }
                    }
                    if (options.source) {
                        if (langx.isFunction(options.source)) {
                            self.dragSource =  options.source(e.target, self._elm);                            
                        } else {
                            self.dragSource = finder.closest(e.target, options.source,self._elm);                            
                        }
                    } else {
                        self.dragSource = self._elm;
                    }

                    self.startPos = {
                        x : e.clientX,
                        y : e.clientY
                    };

                    manager.prepare(self,e);

                },

                "mouseup": function(e) {
                    ///if (self.dragSource) {
                    ///    //datax.attr(self.dragSource, "draggable", 'false');
                    ///    self.dragSource = null;
                    ///    self.dragHandle = null;
                    ///}
                },

                "dragstart": function(e) {
                    if (manager.dragging !== self) {
                        return;
                    }
                    manager.start(self, e);
                },

                "dragend": function(e) {
                    if (manager.dragging !== self) {
                        return;
                    }
                    eventer.stop(e);

                    if (!manager.dragging) {
                        return;
                    }

                    manager.end(false);
                }
            });

        }

    });

    plugins.register(Draggable,"draggable");

    return dnd.Draggable = Draggable;
});
define('skylark-domx-plugins-dnd/Droppable',[
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-plugins-base",
    "./dnd",
    "./manager"
], function(langx, noder, datax, finder, geom, eventer, styler, plugins, dnd,manager) {
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;


    var Droppable = plugins.Plugin.inherit({
        klassName: "Droppable",

        pluginName : "lark.dnd.droppable",

        options : {
            draggingClass : "dragging"
        },

        _construct: function(elm, options) {
            this.overrided(elm,options);

            var self = this,
                options = self.options,
                draggingClass = options.draggingClass,
                hoverClass,
                activeClass,
                acceptable = true;

            ["started", "entered", "leaved", "dropped", "overing"].forEach(function(eventName) {
                if (langx.isFunction(options[eventName])) {
                    self.on(eventName, options[eventName]);
                }
            });

            eventer.on(elm, {
                "dragover": function(e) {
                    e.stopPropagation()

                    if (!acceptable) {
                        return
                    }

                    var e2 = eventer.create("overing", {
                        originalEvent : e,
                        overElm: e.target,
                        transfer: manager.draggingTransfer,
                        acceptable: true
                    });
                    self.trigger(e2);

                    if (e2.acceptable) {
                        e.preventDefault() // allow drop

                        ///e.dataTransfer.dropEffect = "copyMove";
                    }

                },

                "dragenter": function(e) {
                    var options = self.options,
                        elm = self._elm;

                    var e2 = eventer.create("entered", {
                        originalEvent : e,
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    e.stopPropagation()

                    if (hoverClass && acceptable) {
                        styler.addClass(elm, hoverClass)
                    }
                },

                "dragleave": function(e) {
                    var options = self.options,
                        elm = self._elm;
                    if (!acceptable) return false

                    var e2 = eventer.create("leaved", {
                        originalEvent : e,
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    e.stopPropagation()

                    if (hoverClass && acceptable) {
                        styler.removeClass(elm, hoverClass);
                    }
                },

                "drop": function(e) {
                    var options = self.options,
                        elm = self._elm;

                    eventer.stop(e); // stops the browser from redirecting.

                    if (!manager.dragging) return

                    // manager.dragging.elm.removeClass('dragging');

                    if (hoverClass && acceptable) {
                        styler.addClass(elm, hoverClass)
                    }

                    var e2 = eventer.create("dropped", {
                        originalEvent : e,
                        transfer: manager.draggingTransfer
                    });

                    self.trigger(e2);

                    manager.end(true)
                }
            });

            manager.on("dndStarted", function(e) {
                var e2 = eventer.create("started", {
                    transfer: manager.draggingTransfer,
                    acceptable: false,
                    dragging : e.dragging 
                });

                self.trigger(e2);

                acceptable = e2.acceptable;
                hoverClass = e2.hoverClass;
                activeClass = e2.activeClass;

                if (activeClass && acceptable) {
                    styler.addClass(elm, activeClass);
                }

            }).on("dndEnded", function(e) {
                var e2 = eventer.create("ended", {
                    transfer: manager.draggingTransfer,
                    acceptable: false
                });

                self.trigger(e2);

                if (hoverClass && acceptable) {
                    styler.removeClass(elm, hoverClass);
                }
                if (activeClass && acceptable) {
                    styler.removeClass(elm, activeClass);
                }

                acceptable = false;
                activeClass = null;
                hoverClass = null;
            });

        }
    });

    plugins.register(Droppable,"droppable");

    return dnd.Droppable = Droppable;
});
define('skylark-domx-plugins-dnd/main',[
    "./dnd",
    "./Draggable",
    "./Droppable"
], function(dnd) {
    return dnd;
})
;
define('skylark-domx-plugins-dnd', ['skylark-domx-plugins-dnd/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-dnd.js.map
