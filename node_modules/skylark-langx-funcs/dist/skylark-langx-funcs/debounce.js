/**
 * skylark-langx-funcs - The skylark JavaScript language extension library.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./funcs","./defer"],function(n,t){return n.debounce=function(n,e,u){var o,i;return function(){var r=this,c=arguments;function f(){o&&clearTimeout(o),i&&i.stop(),o=void 0,i=void 0}return f(),o=setTimeout(function(){o=null,u?i=t(n,c,r):n.apply(r,c)},e),{stop:f}}}});
//# sourceMappingURL=sourcemaps/debounce.js.map
