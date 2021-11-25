/**
 * skylark-domx-plugins-dnd - The dnd features enhancement for dom.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","skylark-devices-points/touch","skylark-domx-plugins-base","./dnd","./manager"],function(a,r,e,n,o,s,t,d,g,i,l){s.on,s.off,e.attr,e.removeAttr,o.pagePosition,t.addClass,o.height;var c=g.Plugin.inherit({klassName:"Draggable",pluginName:"lark.dnd.draggable",options:{draggingClass:"dragging",forceFallback:!1},_construct:function(r,e){this.overrided(r,e);var o=this;e=this.options;o.draggingClass=e.draggingClass,["preparing","started","ended","moving"].forEach(function(r){a.isFunction(e[r])&&o.on(r,e[r])}),d.mousy(r),s.on(r,{mousedown:function(a){var r=o.options;r.handle&&(o.dragHandle=n.closest(a.target,r.handle,o._elm),!o.dragHandle)||(r.source?o.dragSource=n.closest(a.target,r.source,o._elm):o.dragSource=o._elm,o.startPos={x:a.clientX,y:a.clientY},l.prepare(o,a))},mouseup:function(a){},dragstart:function(a){l.start(o,a)},dragend:function(a){s.stop(a),l.dragging&&l.end(!1)}})}});return g.register(c,"draggable"),i.Draggable=c});
//# sourceMappingURL=sourcemaps/draggable.js.map
