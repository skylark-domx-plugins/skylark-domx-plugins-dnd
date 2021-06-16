/**
 * skylark-domx-plugins-dnd - The dnd features enhancement for dom.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
!function(r,a){var e=a.define,require=a.require,n="function"==typeof e&&e.amd,t=!n&&"undefined"!=typeof exports;if(!n&&!e){var g={};e=a.define=function(r,a,e){"function"==typeof e?(g[r]={factory:e,deps:a.map(function(a){return function(r,a){if("."!==r[0])return r;var e=a.split("/"),n=r.split("/");e.pop();for(var t=0;t<n.length;t++)"."!=n[t]&&(".."==n[t]?e.pop():e.push(n[t]));return e.join("/")}(a,r)}),resolved:!1,exports:null},require(r)):g[r]={factory:null,resolved:!0,exports:e}},require=a.require=function(r){if(!g.hasOwnProperty(r))throw new Error("Module "+r+" has not been defined");var module=g[r];if(!module.resolved){var e=[];module.deps.forEach(function(r){e.push(require(r))}),module.exports=module.factory.apply(a,e)||null,module.resolved=!0}return module.exports}}if(!e)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(r,require){r("skylark-domx-plugins-dnd/dnd",["skylark-langx/skylark"],function(r){return r.attach("domx.plugins.dnd",{})}),r("skylark-domx-plugins-dnd/manager",["./dnd","skylark-langx/langx","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler"],function(r,a,e,n,t,g,d,s){d.on,d.off,n.attr,n.removeAttr,g.pagePosition,s.addClass,g.height;var o=r.Manager=a.Evented.inherit({klassName:"Manager",init:function(){},prepare:function(r){var a=d.create("preparing",{dragSource:r.dragSource,dragHandle:r.dragHandle});r.trigger(a),r.dragSource=a.dragSource},start:function(r,e){var n=g.pagePosition(r.dragSource);this.draggingOffsetX=parseInt(e.pageX-n.left),this.draggingOffsetY=parseInt(e.pageY-n.top);var t=d.create("started",{elm:r.elm,dragSource:r.dragSource,dragHandle:r.dragHandle,ghost:null,transfer:{}});r.trigger(t),this.dragging=r,r.draggingClass&&s.addClass(r.dragSource,r.draggingClass),this.draggingGhost=t.ghost,this.draggingGhost||(this.draggingGhost=r.elm),this.draggingTransfer=t.transfer,this.draggingTransfer&&a.each(this.draggingTransfer,function(r,a){e.dataTransfer.setData(r,a)}),e.dataTransfer.setDragImage(this.draggingGhost,this.draggingOffsetX,this.draggingOffsetY),e.dataTransfer.effectAllowed="copyMove";var o=d.create("dndStarted",{elm:t.elm,dragSource:t.dragSource,dragHandle:t.dragHandle,ghost:t.ghost,transfer:t.transfer});this.trigger(o)},over:function(){},end:function(r){var a=this.dragging;a&&a.draggingClass&&s.removeClass(a.dragSource,a.draggingClass);var e=d.create("dndEnded",{});this.trigger(e),this.dragging=null,this.draggingTransfer=null,this.draggingGhost=null,this.draggingOffsetX=null,this.draggingOffsetY=null}}),i=new o;return i}),r("skylark-domx-plugins-dnd/Draggable",["skylark-langx/langx","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","skylark-domx-plugins-base","./dnd","./manager"],function(r,a,e,n,t,g,d,s,o,i){g.on,g.off,e.attr,e.removeAttr,t.pagePosition,d.addClass,t.height;var l=s.Plugin.inherit({klassName:"Draggable",pluginName:"lark.dnd.draggable",options:{draggingClass:"dragging"},_construct:function(a,t){this.overrided(a,t);var d=this,t=this.options;d.draggingClass=t.draggingClass,["preparing","started","ended","moving"].forEach(function(a){r.isFunction(t[a])&&d.on(a,t[a])}),g.on(a,{mousedown:function(r){var a=d.options;a.handle&&(d.dragHandle=n.closest(r.target,a.handle),!d.dragHandle)||(a.source?d.dragSource=n.closest(r.target,a.source):d.dragSource=d._elm,i.prepare(d),d.dragSource&&e.attr(d.dragSource,"draggable","true"))},mouseup:function(r){d.dragSource&&(d.dragSource=null,d.dragHandle=null)},dragstart:function(r){e.attr(d.dragSource,"draggable","false"),i.start(d,r)},dragend:function(r){g.stop(r),i.dragging&&i.end(!1)}})}});return s.register(l,"draggable"),o.Draggable=l}),r("skylark-domx-plugins-dnd/Droppable",["skylark-langx/langx","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","skylark-domx-plugins-base","./dnd","./manager"],function(r,a,e,n,t,g,d,s,o,i){g.on,g.off,e.attr,e.removeAttr,t.pagePosition,d.addClass,t.height;var l=s.Plugin.inherit({klassName:"Droppable",pluginName:"lark.dnd.droppable",options:{draggingClass:"dragging"},_construct:function(a,e){this.overrided(a,e);var n,t,s=this,e=s.options,o=(e.draggingClass,!0);["started","entered","leaved","dropped","overing"].forEach(function(a){r.isFunction(e[a])&&s.on(a,e[a])}),g.on(a,{dragover:function(r){if(r.stopPropagation(),o){var a=g.create("overing",{overElm:r.target,transfer:i.draggingTransfer,acceptable:!0});s.trigger(a),a.acceptable&&(r.preventDefault(),r.dataTransfer.dropEffect="copyMove")}},dragenter:function(r){s.options;var a=s._elm,e=g.create("entered",{transfer:i.draggingTransfer});s.trigger(e),r.stopPropagation(),n&&o&&d.addClass(a,n)},dragleave:function(r){s.options;var a=s._elm;if(!o)return!1;var e=g.create("leaved",{transfer:i.draggingTransfer});s.trigger(e),r.stopPropagation(),n&&o&&d.removeClass(a,n)},drop:function(r){s.options;var a=s._elm;if(g.stop(r),i.dragging){n&&o&&d.addClass(a,n);var e=g.create("dropped",{transfer:i.draggingTransfer});s.trigger(e),i.end(!0)}}}),i.on("dndStarted",function(r){var e=g.create("started",{transfer:i.draggingTransfer,acceptable:!1});s.trigger(e),o=e.acceptable,n=e.hoverClass,(t=e.activeClass)&&o&&d.addClass(a,t)}).on("dndEnded",function(r){var e=g.create("ended",{transfer:i.draggingTransfer,acceptable:!1});s.trigger(e),n&&o&&d.removeClass(a,n),t&&o&&d.removeClass(a,t),o=!1,t=null,n=null})}});return s.register(l,"droppable"),o.Droppable=l}),r("skylark-domx-plugins-dnd/main",["./dnd","./Draggable","./Droppable"],function(r){return r}),r("skylark-domx-plugins-dnd",["skylark-domx-plugins-dnd/main"],function(r){return r})}(e),!n){var d=require("skylark-langx-ns");t?module.exports=d:a.skylarkjs=d}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-domx-plugins-dnd.js.map
