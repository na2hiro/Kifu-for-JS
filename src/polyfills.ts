if (!Array.prototype.some) {
    Array.prototype.some = function(fun /*, thisp */) {
        "use strict";

        if (this == null) { throw new TypeError(); }

        const t = Object(this),
            len = t.length >>> 0;

        if (typeof fun != "function") { throw new TypeError(); }

        // eslint-disable-next-line prefer-rest-params
        const thisp = arguments[1];

        for (let i = 0; i < len; i++) {
            if (i in t && fun.call(thisp, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

export {};
