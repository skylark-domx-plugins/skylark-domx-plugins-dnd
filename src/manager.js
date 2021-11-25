define([
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

            this.useNativeDnd =  draggable.options.forceFallback ? false : supportDraggable;  
            this.dragging = draggable;

            if (draggable.dragSource) {
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
                transfer: e.transfer
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