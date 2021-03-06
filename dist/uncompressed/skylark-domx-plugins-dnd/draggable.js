define([
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