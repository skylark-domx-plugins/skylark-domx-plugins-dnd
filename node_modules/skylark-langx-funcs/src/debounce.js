define([
	"./funcs",
    "./defer"
],function(funcs,defer){
   
    function debounce(fn, wait,useAnimationFrame) {
        var timeout,
            defered;

        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (useAnimationFrame) {
                    defered = defer(fn,args,context);
                } else {
                    fn.apply(context, args);
                }
            };

            function stop() {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (defered) {
                    defered.stop();
                }
                timeout = void 0;
                defered = void 0;
            }

            stop();
            timeout = setTimeout(later, wait);

            return {
                stop 
            };
        };
    }

    return funcs.debounce = debounce;

})