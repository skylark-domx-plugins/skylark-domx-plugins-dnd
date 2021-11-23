define([
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