/**
 * skylark-domx-plugins-dnd - The dnd features enhancement for dom.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","skylark-devices-points/touch","skylark-domx-plugins-base","./dnd","./manager"],function(a,r,e,n,o,g,s,t,d,i,l){g.on,g.off,e.attr,e.removeAttr,o.pagePosition,s.addClass,o.height;var c=d.Plugin.inherit({klassName:"Draggable",pluginName:"lark.dnd.draggable",options:{draggingClass:"dragging",forceFallback:!1},_construct:function(r,e){this.overrided(r,e);var o=this;e=this.options;o.draggingClass=e.draggingClass,["preparing","started","ended","moving"].forEach(function(r){a.isFunction(e[r])&&o.on(r,e[r])}),t.mousy(r),g.on(r,{mousedown:function(r){var e=o.options;e.handle&&(a.isFunction(e.handle)?o.dragHandle=e.handle(r.target,o._elm):o.dragHandle=n.closest(r.target,e.handle,o._elm),!o.dragHandle)||(e.source?a.isFunction(e.source)?o.dragSource=e.source(r.target,o._elm):o.dragSource=n.closest(r.target,e.source,o._elm):o.dragSource=o._elm,o.startPos={x:r.clientX,y:r.clientY},l.prepare(o,r))},mouseup:function(a){},dragstart:function(a){l.dragging===o&&l.start(o,a)},dragend:function(a){l.dragging===o&&(g.stop(a),l.dragging&&l.end(!1))}})}});return d.register(c,"draggable"),i.Draggable=c});
//# sourceMappingURL=sourcemaps/draggable.js.map
