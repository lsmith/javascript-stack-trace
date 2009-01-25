var getStackTrace;

(function () {
var mode;

try {0()} catch (e) {
    mode = e.stack ? 'Firefox' : window.opera ? 'Opera' : 'Other';
}

getStackTrace = (
    mode === 'Firefox' ?
    function () {
        try {0()} catch (e) {
            return e.stack.replace(/^.*?\n/,'').
                           replace(/(?:\n@:0)?\s+$/m,'').
                           replace(/^\(/gm,'{anonymous}(').
                           split("\n");
        }
    } :

    mode === 'Opera' ?
    function () {
        try {0()} catch (e) {
            var lines = e.message.split("\n"),
                ANON = '{anonymous}(..)@',
                lineRE = /Line\s+(\d+).*?(http\S+)(?:.*?in\s+function\s+(\S+))?/i,
                i,j,len,m;

            for (i=4,j=0,len=lines.length; i<len; i+=2) {
                m = lines[i].match(lineRE);
                if (m) {
                    lines[j++] = (m[3] ? m[3] + '(..)@' + m[2] + m[1] :
                        ANON + m[2] + ':' + m[1]) + ' -- ' +
                        lines[i+1].replace(/^\s+/,'');
                }
            }

            lines.splice(j,lines.length-j);
            return lines;
        }
    } :

    // IE and Safari
    function () {
        var curr  = arguments.callee.caller,
            FUNC  = 'function', ANON = "{anonymous}",
            fnRE  = /function\s*([\w\-$]+)?\s*\(/i,
            callers = [arguments.callee],
            stack = [],j=0,
            fn,args,i;

        trace: while (curr) {
            // recursion protection
            i = callers.length;
            while (i--) {
                if (curr === callers[i]) {
                    curr = null;
                    break trace;
                }
            }

            callers.push(curr);

            fn    = (curr.toString().match(fnRE) || [])[1] || ANON;
            args  = stack.slice.call(curr.arguments);
            i     = args.length;

            while (i--) {
                switch (typeof args[i]) {
                    case 'string'  : args[i] = '"'+args[i].replace(/"/g,'\\"')+'"'; break;
                    // TODO: use fnRE to get function's name
                    case 'function': args[i] = FUNC; break;
                    // TODO: better type forking
                    default        : args[i] = args[i] == null ? 'null' : args[i].toString();
                }
            }

            stack[j++] = fn + '(' + args.join() + ')';

            curr = curr.caller;
        }

        return stack;
    });

})();
