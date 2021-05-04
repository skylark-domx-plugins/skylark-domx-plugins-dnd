/**
 * skylark-langx-funcs - The skylark JavaScript language extension library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./funcs"],function(n){return n.defer=function(n,t,e){var r,u={stop:null},i=n;return t&&(i=function(){n.apply(e,t)}),requestAnimationFrame?(r=requestAnimationFrame(i),u.stop=function(){return cancelAnimationFrame(r)}):(r=setTimeoutout(i),u.stop=function(){return clearTimeout(r)}),u}});
//# sourceMappingURL=sourcemaps/defer.js.map
