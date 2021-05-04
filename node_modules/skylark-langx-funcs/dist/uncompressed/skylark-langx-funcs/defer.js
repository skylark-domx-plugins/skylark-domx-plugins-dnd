define([
    "./funcs"
],function(funcs){
    function defer(fn,args,context) {
        var ret = {
            stop : null
        },
        id,
        fn1 = fn;

        if (args) {
            fn1 = function() {
                fn.apply(context,args);
            };
        }
        if (requestAnimationFrame) {
            id = requestAnimationFrame(fn1);
            ret.stop = function() {
                return cancelAnimationFrame(id);
            };
        } else {
            id = setTimeoutout(fn1);
            ret.stop = function() {
                return clearTimeout(id);
            };
        }
        return ret;
    }

    return funcs.defer = defer;
})