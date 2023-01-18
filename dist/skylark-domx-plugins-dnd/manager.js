/**
 * skylark-domx-plugins-dnd - The dnd features enhancement for dom.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["skylark-langx/langx","skylark-langx-hoster/is-mobile","skylark-domx-noder","skylark-domx-data","skylark-domx-finder","skylark-domx-geom","skylark-domx-eventer","skylark-domx-styler","./dnd","./fallback/moused-drag-drop"],function(a,r,g,e,t,n,d,s,i,o){d.on,d.off,e.attr,e.removeAttr,n.pagePosition,s.addClass,n.height;var l="draggable"in document.createElement("div")&&!r.apple.device;return new(i.Manager=a.Evented.inherit({klassName:"Manager",init:function(){},prepare:function(a,r){var g=d.create("preparing",{dragSource:a.dragSource,dragHandle:a.dragHandle,originalEvent:r});if(a.trigger(g),a.dragSource=g.dragSource,a.dragHandle=g.dragHandle,a.dragSource){this.useNativeDnd=!a.options.forceFallback&&l,this.dragging=a,e.data(a.dragSource,"draggable",!0),this.useNativeDnd?e.attr(a.dragSource,"draggable","true"):this._fallbacker=new o(this,a.dragSource,a.startPos);try{document.selection?document.selection.empty():window.getSelection().removeAllRanges()}catch(a){}}},start:function(r,g){e.data(r.dragSource,"draggable",!1),this.useNativeDnd&&e.attr(r.dragSource,"draggable","false");var t=n.pagePosition(r.dragSource);this.draggingOffsetX=parseInt(g.pageX-t.left),this.draggingOffsetY=parseInt(g.pageY-t.top);var i=d.create("started",{elm:r.elm(),dragSource:r.dragSource,dragHandle:r.dragHandle,ghost:null,originalEvent:g,transfer:{}});r.trigger(i),this.dragging=r,r.draggingClass&&s.addClass(r.dragSource,r.draggingClass),this.draggingGhost=i.ghost,this.draggingGhost||(this.draggingGhost=r.dragSource),this.draggingTransfer=i.transfer,this.draggingTransfer&&a.each(this.draggingTransfer,function(a,r){g.dataTransfer.setData(a,r)}),g.dataTransfer.setDragImage(this.draggingGhost,this.draggingOffsetX,this.draggingOffsetY);var o=d.create("dndStarted",{elm:i.elm,dragSource:i.dragSource,dragHandle:i.dragHandle,ghost:i.ghost,transfer:i.transfer,dragging:this.dragging});this.trigger(o)},over:function(){},end:function(a){var r=this.dragging;r&&r.draggingClass&&s.removeClass(r.dragSource,r.draggingClass);var g=d.create("ended",{originalEvent:e});this.dragging.trigger(g);var e=d.create("dndEnded",{});this.trigger(e),this.dragging=null,this.draggingTransfer=null,this.draggingGhost=null,this.draggingOffsetX=null,this.draggingOffsetY=null}}))});
//# sourceMappingURL=sourcemaps/manager.js.map
