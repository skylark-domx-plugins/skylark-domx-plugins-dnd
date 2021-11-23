/**
 * skylark-domx-plugins-dnd - The dnd features enhancement for dom.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/langx","skylark-langx-hoster/is-mobile","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","./dnd","./fallback/moused-drag-drop"],function(a,r,e,g,t,d,n,s,i,o){n.on,n.off,g.attr,g.removeAttr,d.pagePosition,s.addClass,d.height;var l="draggable"in document.createElement("div")&&!r.apple.device;return new(i.Manager=a.Evented.inherit({klassName:"Manager",init:function(){},prepare:function(a,r){r=n.create("preparing",{dragSource:a.dragSource,dragHandle:a.dragHandle});if(a.trigger(r),a.dragSource=r.dragSource,this.useNativeDnd=!a.options.forceFallback&&l,this.dragging=a,a.dragSource){g.data(a.dragSource,"draggable",!0),this.useNativeDnd?g.attr(a.dragSource,"draggable","true"):this._fallbacker=new o(this,a.dragSource,a.startPos);try{document.selection?document.selection.empty():window.getSelection().removeAllRanges()}catch(a){}}},start:function(r,e){g.data(r.dragSource,"draggable",!1),this.useNativeDnd&&g.attr(r.dragSource,"draggable","false");var t=d.pagePosition(r.dragSource);this.draggingOffsetX=parseInt(e.pageX-t.left),this.draggingOffsetY=parseInt(e.pageY-t.top);var i=n.create("started",{elm:r.elm,dragSource:r.dragSource,dragHandle:r.dragHandle,ghost:null,transfer:{}});r.trigger(i),this.dragging=r,r.draggingClass&&s.addClass(r.dragSource,r.draggingClass),this.draggingGhost=i.ghost,this.draggingGhost||(this.draggingGhost=r.elm),this.draggingTransfer=i.transfer,this.draggingTransfer&&a.each(this.draggingTransfer,function(a,r){e.dataTransfer.setData(a,r)}),e.dataTransfer.setDragImage(this.draggingGhost,this.draggingOffsetX,this.draggingOffsetY),e.dataTransfer.effectAllowed="copyMove";var o=n.create("dndStarted",{elm:i.elm,dragSource:i.dragSource,dragHandle:i.dragHandle,ghost:i.ghost,transfer:i.transfer});this.trigger(o)},over:function(){},end:function(a){var r=this.dragging;r&&r.draggingClass&&s.removeClass(r.dragSource,r.draggingClass);var e=n.create("dndEnded",{});this.trigger(e),this.dragging=null,this.draggingTransfer=null,this.draggingGhost=null,this.draggingOffsetX=null,this.draggingOffsetY=null}}))});
//# sourceMappingURL=sourcemaps/manager.js.map
