/**
 * skylark-slax-runtime - The skylark shells widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-slax/skylark-slax-runtime/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-langx-ns/_attach',[],function(){
    return  function attach(obj1,path,obj2) {
        if (typeof path == "string") {
            path = path.split(".");//[path]
        };
        var length = path.length,
            ns=obj1,
            i=0,
            name = path[i++];

        while (i < length) {
            ns = ns[name] = ns[name] || {};
            name = path[i++];
        }

        return ns[name] = obj2;
    }
});
define('skylark-langx-ns/ns',[
    "./_attach"
], function(_attach) {
    var skylark = {
    	attach : function(path,obj) {
    		return _attach(skylark,path,obj);
    	}
    };
    return skylark;
});

define('skylark-langx-ns/main',[
	"./ns"
],function(skylark){
	return skylark;
});
define('skylark-langx-ns', ['skylark-langx-ns/main'], function (main) { return main; });

define('skylark-langx-types/types',[
    "skylark-langx-ns"
],function(skylark){
    var nativeIsArray = Array.isArray, 
        toString = {}.toString;
    
    var type = (function() {
        var class2type = {};

        // Populate the class2type map
        "Boolean Number String Function Array Date RegExp Object Error Symbol".split(" ").forEach(function(name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        return function type(obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object";
        };
    })();

 
    var  isArray = nativeIsArray || function(obj) {
        return object && object.constructor === Array;
    };


    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function/string/element and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * isArrayLike([1, 2, 3])
     * // => true
     *
     * isArrayLike(document.body.children)
     * // => false
     *
     * isArrayLike('abc')
     * // => true
     *
     * isArrayLike(Function)
     * // => false
     */    
    function isArrayLike(obj) {
        return !isString(obj) && !isHtmlNode(obj) && typeof obj.length == 'number' && !isFunction(obj);
    }

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
     * @example
     *
     * isBoolean(false)
     * // => true
     *
     * isBoolean(null)
     * // => false
     */
    function isBoolean(obj) {
       return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
       //return typeof(obj) === "boolean";
    }

    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }

   // Is a given value a DOM element?
    function isElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }   

    function isEmptyObject(obj) {
        var name;
        for (name in obj) {
            if (obj[name] !== null) {
                return false;
            }
        }
        return true;
    }


    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * isFunction(parseInt)
     * // => true
     *
     * isFunction(/abc/)
     * // => false
     */
    function isFunction(value) {
        return type(value) == "function";
    }



    function isHtmlNode(obj) {
        return obj && obj.nodeType; // obj instanceof Node; //Consider the elements in IFRAME
    }

    function isInstanceOf( /*Object*/ value, /*Type*/ type) {
        //Tests whether the value is an instance of a type.
        if (value === undefined) {
            return false;
        } else if (value === null || type == Object) {
            return true;
        } else if (typeof value === "number") {
            return type === Number;
        } else if (typeof value === "string") {
            return type === String;
        } else if (typeof value === "boolean") {
            return type === Boolean;
        } else if (typeof value === "string") {
            return type === String;
        } else {
            return (value instanceof type) || (value && value.isInstanceOf ? value.isInstanceOf(type) : false);
        }
    }

    function isNull(obj) {
        return obj === null;
    }

    function isNumber(obj) {
        return typeof obj == 'number';
    }

    function isObject(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;        
        //return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isWindow(obj) {
        return obj && obj == obj.window;
    }

    function isSameOrigin(href) {
        if (href) {
            var origin = location.protocol + '//' + location.hostname;
            if (location.port) {
                origin += ':' + location.port;
            }
            return href.startsWith(origin);
        }
    }

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag);
    }

    // Is a given variable undefined?
    function isUndefined(obj) {
        return obj === void 0;
    }

    return skylark.attach("langx.types",{

        isArray: isArray,

        isArrayLike: isArrayLike,

        isBoolean: isBoolean,

        isDefined: isDefined,

        isDocument: isDocument,

        isElement,

        isEmpty : isEmptyObject,

        isEmptyObject: isEmptyObject,

        isFunction: isFunction,

        isHtmlNode: isHtmlNode,

        isNaN : function (obj) {
            return isNaN(obj);
        },

        isNull: isNull,


        isNumber: isNumber,

        isNumeric: isNumber,

        isObject: isObject,

        isPlainObject: isPlainObject,

        isString: isString,

        isSameOrigin: isSameOrigin,

        isSymbol : isSymbol,

        isUndefined: isUndefined,

        isWindow: isWindow,

        type: type
    });

});
define('skylark-langx-types/main',[
	"./types"
],function(types){
	return types;
});
define('skylark-langx-types', ['skylark-langx-types/main'], function (main) { return main; });

define('skylark-langx-numbers/numbers',[
    "skylark-langx-ns",
    "skylark-langx-types"
],function(skylark,types){
	var isObject = types.isObject,
		isSymbol = types.isSymbol;

	var INFINITY = 1 / 0,
	    MAX_SAFE_INTEGER = 9007199254740991,
	    MAX_INTEGER = 1.7976931348623157e+308,
	    NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}	

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	return  skylark.attach("langx.numbers",{
		toFinite : toFinite,
		toNumber : toNumber,
		toInteger : toInteger
	});
});
define('skylark-langx-numbers/main',[
	"./numbers"
],function(numbers){
	return numbers;
});
define('skylark-langx-numbers', ['skylark-langx-numbers/main'], function (main) { return main; });

define('skylark-langx-objects/objects',[
    "skylark-langx-ns/ns",
    "skylark-langx-ns/_attach",
	"skylark-langx-types",
    "skylark-langx-numbers"
],function(skylark,_attach,types,numbers){
	var hasOwnProperty = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        isBoolean = types.isBoolean,
        isFunction = types.isFunction,
		isObject = types.isObject,
		isPlainObject = types.isPlainObject,
		isArray = types.isArray,
        isArrayLike = types.isArrayLike,
        isString = types.isString,
        toInteger = numbers.toInteger;

     // An internal function for creating assigner functions.
    function createAssigner(keysFunc, defaults) {
        return function(obj) {
          var length = arguments.length;
          if (defaults) obj = Object(obj);  
          if (length < 2 || obj == null) return obj;
          for (var index = 1; index < length; index++) {
            var source = arguments[index],
                keys = keysFunc(source),
                l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (!defaults || obj[key] === void 0) obj[key] = source[key];
            }
          }
          return obj;
       };
    }

    // Internal recursive comparison function for `isEqual`.
    var eq, deepEq;
    var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

    eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // `null` or `undefined` only equal to itself (strict comparison).
        if (a == null || b == null) return false;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a) return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        return deepEq(a, b, aStack, bStack);
    };

    // Internal recursive comparison function for `isEqual`.
    deepEq = function(a, b, aStack, bStack) {
        // Unwrap any wrapped objects.
        //if (a instanceof _) a = a._wrapped;
        //if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
            case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;
            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                               isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = Object.keys(a), key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (Object.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(b[key]!==undefined && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Retrieve all the property names of an object.
    function allKeys(obj) {
        if (!isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }

    function each(obj, callback) {
        var length, key, i, undef, value;

        if (obj) {
            length = obj.length;

            if (length === undef) {
                // Loop object items
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        value = obj[key];
                        if (callback.call(value, key, value) === false) {
                            break;
                        }
                    }
                }
            } else {
                // Loop array items
                for (i = 0; i < length; i++) {
                    value = obj[i];
                    if (callback.call(value, i, value) === false) {
                        break;
                    }
                }
            }
        }

        return this;
    }

    function extend(target) {
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        if (args.length == 0) {
            args = [target];
            target = this;
        }
        args.forEach(function(arg) {
            mixin(target, arg, deep);
        });
        return target;
    }

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`.
    function keys(obj) {
        if (isObject(obj)) return [];
        var keys = [];
        for (var key in obj) if (has(obj, key)) keys.push(key);
        return keys;
    }

    function has(obj, path) {
        if (!isArray(path)) {
            return obj != null && hasOwnProperty.call(obj, path);
        }
        var length = path.length;
        for (var i = 0; i < length; i++) {
            var key = path[i];
            if (obj == null || !hasOwnProperty.call(obj, key)) {
                return false;
            }
            obj = obj[key];
        }
        return !!length;
    }

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
    }


   // Perform a deep comparison to check if two objects are equal.
    function isEqual(a, b) {
        return eq(a, b);
    }

    // Returns whether an object has a given set of `key:value` pairs.
    function isMatch(object, attrs) {
        var keys = keys(attrs), length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
          var key = keys[i];
          if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    }    

    function _mixin(target, source, deep, safe) {
        for (var key in source) {
            //if (!source.hasOwnProperty(key)) {
            //    continue;
            //}
            if (safe && target[key] !== undefined) {
                continue;
            }
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                _mixin(target[key], source[key], deep, safe);
            } else if (source[key] !== undefined) {
                target[key] = source[key]
            }
        }
        return target;
    }

    function _parseMixinArgs(args) {
        var params = slice.call(arguments, 0),
            target = params.shift(),
            deep = false;
        if (isBoolean(params[params.length - 1])) {
            deep = params.pop();
        }

        return {
            target: target,
            sources: params,
            deep: deep
        };
    }

    function mixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, false);
        });
        return args.target;
    }

   // Return a copy of the object without the blacklisted properties.
    function omit(obj, prop1,prop2) {
        if (!obj) {
            return null;
        }
        var result = mixin({},obj);
        for(var i=1;i<arguments.length;i++) {
            var pn = arguments[i];
            if (pn in obj) {
                delete result[pn];
            }
        }
        return result;

    }

   // Return a copy of the object only containing the whitelisted properties.
    function pick(obj,prop1,prop2) {
        if (!obj) {
            return null;
        }
        var result = {};
        for(var i=1;i<arguments.length;i++) {
            var pn = arguments[i];
            if (pn in obj) {
                result[pn] = obj[pn];
            }
        }
        return result;
    }

    function removeItem(items, item) {
        if (isArray(items)) {
            var idx = items.indexOf(item);
            if (idx != -1) {
                items.splice(idx, 1);
            }
        } else if (isPlainObject(items)) {
            for (var key in items) {
                if (items[key] == item) {
                    delete items[key];
                    break;
                }
            }
        }

        return this;
    }

    function result(obj, path, fallback) {
        if (!isArray(path)) {
            path = path.split(".");//[path]
        };
        var length = path.length;
        if (!length) {
          return isFunction(fallback) ? fallback.call(obj) : fallback;
        }
        for (var i = 0; i < length; i++) {
          var prop = obj == null ? void 0 : obj[path[i]];
          if (prop === void 0) {
            prop = fallback;
            i = length; // Ensure we don't continue iterating.
          }
          obj = isFunction(prop) ? prop.call(obj) : prop;
        }

        return obj;
    }

    function safeMixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, true);
        });
        return args.target;
    }

    // Retrieve the values of an object's properties.
    function values(obj) {
        var keys = allKeys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    }

    function clone( /*anything*/ src,checkCloneMethod) {
        var copy;
        if (src === undefined || src === null) {
            copy = src;
        } else if (checkCloneMethod && src.clone) {
            copy = src.clone();
        } else if (isArray(src)) {
            copy = [];
            for (var i = 0; i < src.length; i++) {
                copy.push(clone(src[i]));
            }
        } else if (isPlainObject(src)) {
            copy = {};
            for (var key in src) {
                copy[key] = clone(src[key]);
            }
        } else {
            copy = src;
        }

        return copy;

    }

    return skylark.attach("langx.objects",{
        allKeys: allKeys,

        attach : _attach,

        clone: clone,

        defaults : createAssigner(allKeys, true),

        each : each,

        extend : extend,

        has: has,

        isEqual: isEqual,   

        includes: includes,

        isMatch: isMatch,

        keys: keys,

        mixin: mixin,

        omit: omit,

        pick: pick,

        removeItem: removeItem,

        result : result,
        
        safeMixin: safeMixin,

        values: values
    });


});
define('skylark-langx-objects/main',[
	"./objects"
],function(objects){
	return objects;
});
define('skylark-langx-objects', ['skylark-langx-objects/main'], function (main) { return main; });

define('skylark-langx-hoster/hoster',[
    "skylark-langx-ns"
],function(skylark){
	// The javascript host environment, brower and nodejs are supported.
	var hoster = {
		"isBrowser" : true, // default
		"isNode" : null,
		"global" : this,
		"browser" : null,
		"node" : null
	};

	if (typeof process == "object" && process.versions && process.versions.node && process.versions.v8) {
		hoster.isNode = true;
		hoster.isBrowser = false;
	}

	hoster.global = (function(){
		if (typeof global !== 'undefined' && typeof global !== 'function') {
			// global spec defines a reference to the global object called 'global'
			// https://github.com/tc39/proposal-global
			// `global` is also defined in NodeJS
			return global;
		} else if (typeof window !== 'undefined') {
			// window is defined in browsers
			return window;
		}
		else if (typeof self !== 'undefined') {
			// self is defined in WebWorkers
			return self;
		}
		return this;
	})();

	var _document = null;

	Object.defineProperty(hoster,"document",function(){
		if (!_document) {
			var w = typeof window === 'undefined' ? require('html-element') : window;
			_document = w.document;
		}

		return _document;
	});

	if (hoster.isBrowser) {
	    function uaMatch( ua ) {
		    ua = ua.toLowerCase();

		    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		      /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		      /(msie) ([\w.]+)/.exec( ua ) ||
		      ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		      [];

		    return {
		      browser: match[ 1 ] || '',
		      version: match[ 2 ] || '0'
		    };
	  	};

	    var matched = uaMatch( navigator.userAgent );

	    var browser = hoster.browser = {};

	    if ( matched.browser ) {
	      browser[ matched.browser ] = true;
	      browser.version = matched.version;
	    }

	    // Chrome is Webkit, but Webkit is also Safari.
	    if ( browser.chrome ) {
	      browser.webkit = true;
	    } else if ( browser.webkit ) {
	      browser.safari = true;
	    }
	}

	return  skylark.attach("langx.hoster",hoster);
});
define('skylark-langx-hoster/main',[
	"./hoster"
],function(hoster){
	return hoster;
});
define('skylark-langx-hoster', ['skylark-langx-hoster/main'], function (main) { return main; });

define('skylark-langx-arrays/arrays',[
  "skylark-langx-ns/ns",
  "skylark-langx-types",
  "skylark-langx-objects"
],function(skylark,types,objects){
  var filter = Array.prototype.filter,
      find = Array.prototype.find,
    isArrayLike = types.isArrayLike;

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return baseFindIndex(array, baseIsNaN, fromIndex);
      }
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }


    function compact(array) {
        return filter.call(array, function(item) {
            return item != null;
        });
    }

    function filter2(array,func) {
      return filter.call(array,func);
    }

    function flatten(array) {
        if (isArrayLike(array)) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (isArrayLike(item)) {
                    for (var j = 0; j < item.length; j++) {
                        result.push(item[j]);
                    }
                } else {
                    result.push(item);
                }
            }
            return result;
        } else {
            return array;
        }
        //return array.length > 0 ? concat.apply([], array) : array;
    }

    function grep(array, callback) {
        var out = [];

        objects.each(array, function(i, item) {
            if (callback(item, i)) {
                out.push(item);
            }
        });

        return out;
    }

    function inArray(item, array) {
        if (!array) {
            return -1;
        }
        var i;

        if (array.indexOf) {
            return array.indexOf(item);
        }

        i = array.length;
        while (i--) {
            if (array[i] === item) {
                return i;
            }
        }

        return -1;
    }

    function makeArray(obj, offset, startWith) {
       if (isArrayLike(obj) ) {
        return (startWith || []).concat(Array.prototype.slice.call(obj, offset || 0));
      }

      // array of single index
      return [ obj ];             
    }


    function forEach (arr, fn) {
      if (arr.forEach) return arr.forEach(fn)
      for (var i = 0; i < arr.length; i++) fn(arr[i], i);
    }

    function map(elements, callback) {
        var value, values = [],
            i, key
        if (isArrayLike(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback.call(elements[i], elements[i], i);
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback.call(elements[key], elements[key], key);
                if (value != null) values.push(value)
            }
        return flatten(values)
    }


    function merge( first, second ) {
      var l = second.length,
          i = first.length,
          j = 0;

      if ( typeof l === "number" ) {
        for ( ; j < l; j++ ) {
          first[ i++ ] = second[ j ];
        }
      } else {
        while ( second[j] !== undefined ) {
          first[ i++ ] = second[ j++ ];
        }
      }

      first.length = i;

      return first;
    }

    function reduce(array,callback,initialValue) {
        return Array.prototype.reduce.call(array,callback,initialValue);
    }

    function uniq(array) {
        return filter.call(array, function(item, idx) {
            return array.indexOf(item) == idx;
        })
    }

    function find2(array,func) {
      return find.call(array,func);
    }

    return skylark.attach("langx.arrays",{
        baseFindIndex: baseFindIndex,

        baseIndexOf : baseIndexOf,
        
        compact: compact,

        first : function(items,n) {
            if (n) {
                return items.slice(0,n);
            } else {
                return items[0];
            }
        },

        filter : filter2,

        find : find2,
        
        flatten: flatten,

        grep: grep,

        inArray: inArray,

        makeArray: makeArray,

        merge : merge,

        forEach : forEach,

        map : map,
        
        reduce : reduce,

        uniq : uniq

    });
});
define('skylark-langx-arrays/main',[
	"./arrays"
],function(arrays){
	return arrays;
});
define('skylark-langx-arrays', ['skylark-langx-arrays/main'], function (main) { return main; });

define('skylark-langx-funcs/funcs',[
  "skylark-langx-ns/ns",
  "skylark-langx-types",
  "skylark-langx-objects"
],function(skylark,types,objects){
	var mixin = objects.mixin,
        slice = Array.prototype.slice,
        isFunction = types.isFunction,
        isString = types.isString;

    function defer(fn) {
        if (requestAnimationFrame) {
            requestAnimationFrame(fn);
        } else {
            setTimeoutout(fn);
        }
        return this;
    }

    function noop() {
    }

    function proxy(fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2)
        if (isFunction(fn)) {
            var proxyFn = function() {
                return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
            }
            return proxyFn;
        } else if (isString(context)) {
            if (args) {
                args.unshift(fn[context], fn)
                return proxy.apply(null, args)
            } else {
                return proxy(fn[context], fn);
            }
        } else {
            throw new TypeError("expected function");
        }
    }

    function debounce(fn, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                fn.apply(context, args);
            };
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
   
    var delegate = (function() {
        // boodman/crockford delegation w/ cornford optimization
        function TMP() {}
        return function(obj, props) {
            TMP.prototype = obj;
            var tmp = new TMP();
            TMP.prototype = null;
            if (props) {
                mixin(tmp, props);
            }
            return tmp; // Object
        };
    })();


    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;


    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
      "'":      "'",
      '\\':     '\\',
      '\r':     'r',
      '\n':     'n',
      '\t':     't',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;


    function template(text, data, settings) {
        var render;
        settings = objects.defaults({}, settings,templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
          source += text.slice(index, offset)
              .replace(escaper, function(match) { return '\\' + escapes[match]; });

          if (escape) {
            source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
          }
          if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
          }
          if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
          }
          index = offset + match.length;
          return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
          "print=function(){__p+=__j.call(arguments,'');};\n" +
          source + 'return __p;\n';

        try {
          render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
          e.source = source;
          throw e;
        }

        if (data) {
          return render(data,this)
        }
        var template = proxy(function(data) {
          return render.call(this, data,this);
        },this);

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    }


    /**
     * Creates a function that negates the result of the predicate `func`. The
     * `func` predicate is invoked with the `this` binding and arguments of the
     * created function.
     * @category Function
     * @param {Function} predicate The predicate to negate.
     * @returns {Function} Returns the new negated function.
     * @example
     *
     * function isEven(n) {
     *   return n % 2 == 0
     * }
     *
     * filter([1, 2, 3, 4, 5, 6], negate(isEven))
     * // => [1, 3, 5]
     */
    function negate(predicate) {
      if (typeof predicate !== 'function') {
        throw new TypeError('Expected a function')
      }
      return function(...args) {
        return !predicate.apply(this, args)
      }
    }


    return skylark.attach("langx.funcs",{
        bind : proxy,
        
        debounce: debounce,

        delegate: delegate,

        defer: defer,

        negate: negate,

        noop : noop,

        proxy: proxy,

        returnTrue: function() {
            return true;
        },

        returnFalse: function() {
            return false;
        },

        templateSettings : templateSettings,
        template : template
    });
});
define('skylark-langx-funcs/main',[
	"./funcs"
],function(funcs){
	return funcs;
});
define('skylark-langx-funcs', ['skylark-langx-funcs/main'], function (main) { return main; });

define('skylark-langx-async/Deferred',[
    "skylark-langx-arrays",
	"skylark-langx-funcs",
    "skylark-langx-objects"
],function(arrays,funcs,objects){
    "use strict";

    var slice = Array.prototype.slice,
        proxy = funcs.proxy,
        makeArray = arrays.makeArray,
        result = objects.result,
        mixin = objects.mixin;

    mixin(Promise.prototype,{
        always: function(handler) {
            //this.done(handler);
            //this.fail(handler);
            this.then(handler,handler);
            return this;
        },
        done : function() {
            for (var i = 0;i<arguments.length;i++) {
                this.then(arguments[i]);
            }
            return this;
        },
        fail : function(handler) { 
            //return mixin(Promise.prototype.catch.call(this,handler),added);
            //return this.then(null,handler);
            this.catch(handler);
            return this;
         }
    });


    var Deferred = function() {
        var self = this,
            p = this.promise = makePromise2(new Promise(function(resolve, reject) {
                self._resolve = resolve;
                self._reject = reject;
            }));

        //wrapPromise(p,self);

        //this[PGLISTENERS] = [];
        //this[PGNOTIFIES] = [];

        //this.resolve = Deferred.prototype.resolve.bind(this);
        //this.reject = Deferred.prototype.reject.bind(this);
        //this.progress = Deferred.prototype.progress.bind(this);

    };

   
    function makePromise2(promise) {
        // Don't modify any promise that has been already modified.
        if (promise.isResolved) return promise;

        // Set initial state
        var isPending = true;
        var isRejected = false;
        var isResolved = false;

        // Observe the promise, saving the fulfillment in a closure scope.
        var result = promise.then(
            function(v) {
                isResolved = true;
                isPending = false;
                return v; 
            }, 
            function(e) {
                isRejected = true;
                isPending = false;
                throw e; 
            }
        );

        result.isResolved = function() { return isResolved; };
        result.isPending = function() { return isPending; };
        result.isRejected = function() { return isRejected; };

        result.state = function() {
            if (isResolved) {
                return 'resolved';
            }
            if (isRejected) {
                return 'rejected';
            }
            return 'pending';
        };

        var notified = [],
            listeners = [];

          
        result.then = function(onResolved,onRejected,onProgress) {
            if (onProgress) {
                this.progress(onProgress);
            }
            return makePromise2(Promise.prototype.then.call(this,
                onResolved && function(args) {
                    if (args && args.__ctx__ !== undefined) {
                        return onResolved.apply(args.__ctx__,args);
                    } else {
                        return onResolved(args);
                    }
                },
                onRejected && function(args){
                    if (args && args.__ctx__ !== undefined) {
                        return onRejected.apply(args.__ctx__,args);
                    } else {
                        return onRejected(args);
                    }
                }
            ));
        };

        result.progress = function(handler) {
            notified.forEach(function (value) {
                handler(value);
            });
            listeners.push(handler);
            return this;
        };

        result.pipe = result.then;

        result.notify = function(value) {
            try {
                notified.push(value);

                return listeners.forEach(function (listener) {
                    return listener(value);
                });
            } catch (error) {
            this.reject(error);
            }
            return this;
        };

        return result;
    }

 
    Deferred.prototype.resolve = function(value) {
        var args = slice.call(arguments);
        return this.resolveWith(null,args);
    };

    Deferred.prototype.resolveWith = function(context,args) {
        args = args ? makeArray(args) : []; 
        args.__ctx__ = context;
        this._resolve(args);
        this._resolved = true;
        return this;
    };

    Deferred.prototype.notify = function(value) {
        var p = result(this,"promise");
        p.notify(value);
        return this;
    };

    Deferred.prototype.reject = function(reason) {
        var args = slice.call(arguments);
        return this.rejectWith(null,args);
    };

    Deferred.prototype.rejectWith = function(context,args) {
        args = args ? makeArray(args) : []; 
        args.__ctx__ = context;
        this._reject(args);
        this._rejected = true;
        return this;
    };

    Deferred.prototype.isResolved = function() {
        var p = result(this,"promise");
        return p.isResolved();
    };

    Deferred.prototype.isRejected = function() {
        var p = result(this,"promise");
        return p.isRejected();
    };

    Deferred.prototype.state = function() {
        var p = result(this,"promise");
        return p.state();
    };

    Deferred.prototype.then = function(callback, errback, progback) {
        var p = result(this,"promise");
        return p.then(callback, errback, progback);
    };

    Deferred.prototype.progress = function(progback){
        var p = result(this,"promise");
        return p.progress(progback);
    };
   
    Deferred.prototype.catch = function(errback) {
        var p = result(this,"promise");
        return p.catch(errback);
    };


    Deferred.prototype.always  = function() {
        var p = result(this,"promise");
        p.always.apply(p,arguments);
        return this;
    };

    Deferred.prototype.done  = function() {
        var p = result(this,"promise");
        p.done.apply(p,arguments);
        return this;
    };

    Deferred.prototype.fail = function(errback) {
        var p = result(this,"promise");
        p.fail(errback);
        return this;
    };


    Deferred.all = function(array) {
        //return wrapPromise(Promise.all(array));
        var d = new Deferred();
        Promise.all(array).then(d.resolve.bind(d),d.reject.bind(d));
        return result(d,"promise");
    };

    Deferred.first = function(array) {
        return makePromise2(Promise.race(array));
    };


    Deferred.when = function(valueOrPromise, callback, errback, progback) {
        var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
        var nativePromise = receivedPromise && valueOrPromise instanceof Promise;

        if (!receivedPromise) {
            if (arguments.length > 1) {
                return callback ? callback(valueOrPromise) : valueOrPromise;
            } else {
                return new Deferred().resolve(valueOrPromise);
            }
        } else if (!nativePromise) {
            var deferred = new Deferred(valueOrPromise.cancel);
            valueOrPromise.then(proxy(deferred.resolve,deferred), proxy(deferred.reject,deferred), deferred.notify);
            valueOrPromise = deferred.promise;
        }

        if (callback || errback || progback) {
            return valueOrPromise.then(callback, errback, progback);
        }
        return valueOrPromise;
    };

    Deferred.reject = function(err) {
        var d = new Deferred();
        d.reject(err);
        return d.promise;
    };

    Deferred.resolve = function(data) {
        var d = new Deferred();
        d.resolve.apply(d,arguments);
        return d.promise;
    };

    Deferred.immediate = Deferred.resolve;


    Deferred.promise = function(callback) {
        var d = new Deferred();

        callback(d.resolve.bind(d),d.reject.bind(d),d.progress.bind(d));

        return d.promise;
    };

    return Deferred;
});
define('skylark-langx-async/async',[
    "skylark-langx-ns",
    "skylark-langx-objects",
    "./Deferred"
],function(skylark,objects,Deferred){
    var each = objects.each;
    
    var async = {
        Deferred : Deferred,

        parallel : function(arr,args,ctx) {
            var rets = [];
            ctx = ctx || null;
            args = args || [];

            each(arr,function(i,func){
                rets.push(func.apply(ctx,args));
            });

            return Deferred.all(rets);
        },

        series : function(arr,args,ctx) {
            var rets = [],
                d = new Deferred(),
                p = d.promise;

            ctx = ctx || null;
            args = args || [];

            d.resolve();
            each(arr,function(i,func){
                p = p.then(function(){
                    return func.apply(ctx,args);
                });
                rets.push(p);
            });

            return Deferred.all(rets);
        },

        waterful : function(arr,args,ctx) {
            var d = new Deferred(),
                p = d.promise;

            ctx = ctx || null;
            args = args || [];

            d.resolveWith(ctx,args);

            each(arr,function(i,func){
                p = p.then(func);
            });
            return p;
        }
    };

	return skylark.attach("langx.async",async);	
});
define('skylark-langx-async/main',[
	"./async"
],function(async){
	return async;
});
define('skylark-langx-async', ['skylark-langx-async/main'], function (main) { return main; });

define('skylark-langx-klass/klass',[
  "skylark-langx-ns/ns",
  "skylark-langx-types",
  "skylark-langx-objects",
  "skylark-langx-arrays",
],function(skylark,types,objects,arrays){
    var uniq = arrays.uniq,
        has = objects.has,
        mixin = objects.mixin,
        isArray = types.isArray,
        isDefined = types.isDefined;

/* for reference 
 function klass(props,parent) {
    var ctor = function(){
        this._construct();
    };
    ctor.prototype = props;
    if (parent) {
        ctor._proto_ = parent;
        props.__proto__ = parent.prototype;
    }
    return ctor;
}

// Type some JavaScript code here.
let animal = klass({
  _construct(){
      this.name = this.name + ",hi";
  },
    
  name: "Animal",
  eat() {         // [[HomeObject]] == animal
    alert(`${this.name} eats.`);
  }
    
    
});


let rabbit = klass({
  name: "Rabbit",
  _construct(){
      super._construct();
  },
  eat() {         // [[HomeObject]] == rabbit
    super.eat();
  }
},animal);

let longEar = klass({
  name: "Long Ear",
  eat() {         // [[HomeObject]] == longEar
    super.eat();
  }
},rabbit);
*/
    
    function inherit(ctor, base) {
        var f = function() {};
        f.prototype = base.prototype;

        ctor.prototype = new f();
    }

    var f1 = function() {
        function extendClass(ctor, props, options) {
            // Copy the properties to the prototype of the class.
            var proto = ctor.prototype,
                _super = ctor.superclass.prototype,
                noOverrided = options && options.noOverrided,
                overrides = options && options.overrides || {};

            for (var name in props) {
                if (name === "constructor") {
                    continue;
                }

                // Check if we're overwriting an existing function
                var prop = props[name];
                if (typeof props[name] == "function") {
                    proto[name] =  !prop._constructor && !noOverrided && typeof _super[name] == "function" ?
                          (function(name, fn, superFn) {
                            return function() {
                                var tmp = this.overrided;

                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this.overrided = superFn;

                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);

                                this.overrided = tmp;

                                return ret;
                            };
                        })(name, prop, _super[name]) :
                        prop;
                } else if (types.isPlainObject(prop) && prop!==null && (prop.get)) {
                    Object.defineProperty(proto,name,prop);
                } else {
                    proto[name] = prop;
                }
            }
            return ctor;
        }

        function serialMixins(ctor,mixins) {
            var result = [];

            mixins.forEach(function(mixin){
                if (has(mixin,"__mixins__")) {
                     throw new Error("nested mixins");
                }
                var clss = [];
                while (mixin) {
                    clss.unshift(mixin);
                    mixin = mixin.superclass;
                }
                result = result.concat(clss);
            });

            result = uniq(result);

            result = result.filter(function(mixin){
                var cls = ctor;
                while (cls) {
                    if (mixin === cls) {
                        return false;
                    }
                    if (has(cls,"__mixins__")) {
                        var clsMixines = cls["__mixins__"];
                        for (var i=0; i<clsMixines.length;i++) {
                            if (clsMixines[i]===mixin) {
                                return false;
                            }
                        }
                    }
                    cls = cls.superclass;
                }
                return true;
            });

            if (result.length>0) {
                return result;
            } else {
                return false;
            }
        }

        function mergeMixins(ctor,mixins) {
            var newCtor =ctor;
            for (var i=0;i<mixins.length;i++) {
                var xtor = new Function();
                xtor.prototype = Object.create(newCtor.prototype);
                xtor.__proto__ = newCtor;
                xtor.superclass = null;
                mixin(xtor.prototype,mixins[i].prototype);
                xtor.prototype.__mixin__ = mixins[i];
                newCtor = xtor;
            }

            return newCtor;
        }

        function _constructor ()  {
            if (this._construct) {
                return this._construct.apply(this, arguments);
            } else  if (this.init) {
                return this.init.apply(this, arguments);
            }
        }

        return function createClass(props, parent, mixins,options) {
            if (isArray(parent)) {
                options = mixins;
                mixins = parent;
                parent = null;
            }
            parent = parent || Object;

            if (isDefined(mixins) && !isArray(mixins)) {
                options = mixins;
                mixins = false;
            }

            var innerParent = parent;

            if (mixins) {
                mixins = serialMixins(innerParent,mixins);
            }

            if (mixins) {
                innerParent = mergeMixins(innerParent,mixins);
            }

            var klassName = props.klassName || "",
                ctor = new Function(
                    "return function " + klassName + "() {" +
                    "var inst = this," +
                    " ctor = arguments.callee;" +
                    "if (!(inst instanceof ctor)) {" +
                    "inst = Object.create(ctor.prototype);" +
                    "}" +
                    "return ctor._constructor.apply(inst, arguments) || inst;" + 
                    "}"
                )();


            // Populate our constructed prototype object
            ctor.prototype = Object.create(innerParent.prototype);

            // Enforce the constructor to be what we expect
            ctor.prototype.constructor = ctor;
            ctor.superclass = parent;

            // And make this class extendable
            ctor.__proto__ = innerParent;


            if (!ctor._constructor) {
                ctor._constructor = _constructor;
            } 

            if (mixins) {
                ctor.__mixins__ = mixins;
            }

            if (!ctor.partial) {
                ctor.partial = function(props, options) {
                    return extendClass(this, props, options);
                };
            }
            if (!ctor.inherit) {
                ctor.inherit = function(props, mixins,options) {
                    return createClass(props, this, mixins,options);
                };
            }

            ctor.partial(props, options);

            return ctor;
        };
    }

    var createClass = f1();

    return skylark.attach("langx.klass",createClass);
});
define('skylark-langx-klass/main',[
	"./klass"
],function(klass){
	return klass;
});
define('skylark-langx-klass', ['skylark-langx-klass/main'], function (main) { return main; });

define('skylark-langx-emitter/Event',[
  "skylark-langx-objects",
  "skylark-langx-funcs",
  "skylark-langx-klass",
],function(objects,funcs,klass){
    var eventMethods = {
        preventDefault: "isDefaultPrevented",
        stopImmediatePropagation: "isImmediatePropagationStopped",
        stopPropagation: "isPropagationStopped"
     };
        

    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            if (!source) {
                source = event;
            }

            objects.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name];
                event[name] = function() {
                    this[predicate] = funcs.returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                }
                event[predicate] = funcs.returnFalse;
            });
        }
        return event;
    }


    /*
    var Event = klass({
        _construct : function(type,props) {
            CustomEvent.call(this,type.props);
            objects.safeMixin(this, props);
            compatible(this);
        }
    },CustomEvent);
    */

    class Event extends CustomEvent {
        constructor(type,props) {
            super(type,props);
            objects.safeMixin(this, props);
            compatible(this);
        } 
    }


    Event.compatible = compatible;

    return Event;
    
});
define('skylark-langx-emitter/Emitter',[
  "skylark-langx-ns/ns",
  "skylark-langx-types",
  "skylark-langx-objects",
  "skylark-langx-arrays",
  "skylark-langx-klass",
  "./Event"
],function(skylark,types,objects,arrays,klass,Event){
    var slice = Array.prototype.slice,
        compact = arrays.compact,
        isDefined = types.isDefined,
        isPlainObject = types.isPlainObject,
        isFunction = types.isFunction,
        isString = types.isString,
        isEmptyObject = types.isEmptyObject,
        mixin = objects.mixin,
        safeMixin = objects.safeMixin;

    function parse(event) {
        var segs = ("" + event).split(".");
        return {
            name: segs[0],
            ns: segs.slice(1).join(" ")
        };
    }

    var Emitter = klass({
        on: function(events, selector, data, callback, ctx, /*used internally*/ one) {
            var self = this,
                _hub = this._hub || (this._hub = {});

            if (isPlainObject(events)) {
                ctx = callback;
                each(events, function(type, fn) {
                    self.on(type, selector, data, fn, ctx, one);
                });
                return this;
            }

            if (!isString(selector) && !isFunction(callback)) {
                ctx = callback;
                callback = data;
                data = selector;
                selector = undefined;
            }

            if (isFunction(data)) {
                ctx = callback;
                callback = data;
                data = null;
            }

            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(event) {
                var parsed = parse(event),
                    name = parsed.name,
                    ns = parsed.ns;

                (_hub[name] || (_hub[name] = [])).push({
                    fn: callback,
                    selector: selector,
                    data: data,
                    ctx: ctx,
                    ns : ns,
                    one: one
                });
            });

            return this;
        },

        one: function(events, selector, data, callback, ctx) {
            return this.on(events, selector, data, callback, ctx, 1);
        },

        emit: function(e /*,argument list*/ ) {
            if (!this._hub) {
                return this;
            }

            var self = this;

            if (isString(e)) {
                e = new Event(e); //new CustomEvent(e);
            }

            Object.defineProperty(e,"target",{
                value : this
            });

            var args = slice.call(arguments, 1);
            if (isDefined(args)) {
                args = [e].concat(args);
            } else {
                args = [e];
            }
            [e.type || e.name, "all"].forEach(function(eventName) {
                var parsed = parse(eventName),
                    name = parsed.name,
                    ns = parsed.ns;

                var listeners = self._hub[name];
                if (!listeners) {
                    return;
                }

                var len = listeners.length,
                    reCompact = false;

                for (var i = 0; i < len; i++) {
                    if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
                        return this;
                    }
                    var listener = listeners[i];
                    if (ns && (!listener.ns ||  !listener.ns.startsWith(ns))) {
                        continue;
                    }
                    if (e.data) {
                        if (listener.data) {
                            e.data = mixin({}, listener.data, e.data);
                        }
                    } else {
                        e.data = listener.data || null;
                    }
                    listener.fn.apply(listener.ctx, args);
                    if (listener.one) {
                        listeners[i] = null;
                        reCompact = true;
                    }
                }

                if (reCompact) {
                    self._hub[eventName] = compact(listeners);
                }

            });
            return this;
        },

        listened: function(event) {
            var evtArr = ((this._hub || (this._events = {}))[event] || []);
            return evtArr.length > 0;
        },

        listenTo: function(obj, event, callback, /*used internally*/ one) {
            if (!obj) {
                return this;
            }

            // Bind callbacks on obj,
            if (isString(callback)) {
                callback = this[callback];
            }

            if (one) {
                obj.one(event, callback, this);
            } else {
                obj.on(event, callback, this);
            }

            //keep track of them on listening.
            var listeningTo = this._listeningTo || (this._listeningTo = []),
                listening;

            for (var i = 0; i < listeningTo.length; i++) {
                if (listeningTo[i].obj == obj) {
                    listening = listeningTo[i];
                    break;
                }
            }
            if (!listening) {
                listeningTo.push(
                    listening = {
                        obj: obj,
                        events: {}
                    }
                );
            }
            var listeningEvents = listening.events,
                listeningEvent = listeningEvents[event] = listeningEvents[event] || [];
            if (listeningEvent.indexOf(callback) == -1) {
                listeningEvent.push(callback);
            }

            return this;
        },

        listenToOnce: function(obj, event, callback) {
            return this.listenTo(obj, event, callback, 1);
        },

        off: function(events, callback) {
            var _hub = this._hub || (this._hub = {});
            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(event) {
                var parsed = parse(event),
                    name = parsed.name,
                    ns = parsed.ns;

                var evts = _hub[name];

                if (evts) {
                    var liveEvents = [];

                    if (callback || ns) {
                        for (var i = 0, len = evts.length; i < len; i++) {
                            
                            if (callback && evts[i].fn !== callback && evts[i].fn._ !== callback) {
                                liveEvents.push(evts[i]);
                                continue;
                            } 

                            if (ns && (!evts[i].ns || evts[i].ns.indexOf(ns)!=0)) {
                                liveEvents.push(evts[i]);
                                continue;
                            }
                        }
                    }

                    if (liveEvents.length) {
                        _hub[name] = liveEvents;
                    } else {
                        delete _hub[name];
                    }

                }
            });

            return this;
        },
        unlistenTo: function(obj, event, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) {
                return this;
            }
            for (var i = 0; i < listeningTo.length; i++) {
                var listening = listeningTo[i];

                if (obj && obj != listening.obj) {
                    continue;
                }

                var listeningEvents = listening.events;
                for (var eventName in listeningEvents) {
                    if (event && event != eventName) {
                        continue;
                    }

                    var listeningEvent = listeningEvents[eventName];

                    for (var j = 0; j < listeningEvent.length; j++) {
                        if (!callback || callback == listeningEvent[i]) {
                            listening.obj.off(eventName, listeningEvent[i], this);
                            listeningEvent[i] = null;
                        }
                    }

                    listeningEvent = listeningEvents[eventName] = compact(listeningEvent);

                    if (isEmptyObject(listeningEvent)) {
                        listeningEvents[eventName] = null;
                    }

                }

                if (isEmptyObject(listeningEvents)) {
                    listeningTo[i] = null;
                }
            }

            listeningTo = this._listeningTo = compact(listeningTo);
            if (isEmptyObject(listeningTo)) {
                this._listeningTo = null;
            }

            return this;
        },

        trigger  : function() {
            return this.emit.apply(this,arguments);
        }
    });

    Emitter.createEvent = function (type,props) {
        //var e = new CustomEvent(type,props);
        //return safeMixin(e, props);
        return new Event(type,props);
    };

    Emitter.Event = Event;

    return skylark.attach("langx.Emitter",Emitter);

});
define('skylark-langx-emitter/Evented',[
  "skylark-langx-ns/ns",
	"./Emitter"
],function(skylark,Emitter){
	return skylark.attach("langx.Evented",Emitter);
});
define('skylark-net-http/http',[
  "skylark-langx-ns/ns",
],function(skylark){
	return skylark.attach("net.http",{});
});
define('skylark-net-http/Xhr',[
  "skylark-langx-ns/ns",
  "skylark-langx-types",
  "skylark-langx-objects",
  "skylark-langx-arrays",
  "skylark-langx-funcs",
  "skylark-langx-async/Deferred",
  "skylark-langx-emitter/Evented",
  "./http"
],function(skylark,types,objects,arrays,funcs,Deferred,Evented,http){

    var each = objects.each,
        mixin = objects.mixin,
        noop = funcs.noop,
        isArray = types.isArray,
        isFunction = types.isFunction,
        isPlainObject = types.isPlainObject,
        type = types.type;
 
     var getAbsoluteUrl = (function() {
        var a;

        return function(url) {
            if (!a) a = document.createElement('a');
            a.href = url;

            return a.href;
        };
    })();
   
    var Xhr = (function(){
        var jsonpID = 0,
            key,
            name,
            rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            scriptTypeRE = /^(?:text|application)\/javascript/i,
            xmlTypeRE = /^(?:text|application)\/xml/i,
            jsonType = 'application/json',
            htmlType = 'text/html',
            blankRE = /^\s*$/;

        var XhrDefaultOptions = {
            async: true,

            // Default type of request
            type: 'GET',
            // Callback that is executed before request
            beforeSend: noop,
            // Callback that is executed if the request succeeds
            success: noop,
            // Callback that is executed the the server drops error
            error: noop,
            // Callback that is executed on request complete (both: error and success)
            complete: noop,
            // The context for the callbacks
            context: null,
            // Whether to trigger "global" Ajax events
            global: true,

            // MIME types mapping
            // IIS returns Javascript as "application/x-javascript"
            accepts: {
                script: 'text/javascript, application/javascript, application/x-javascript',
                json: 'application/json',
                xml: 'application/xml, text/xml',
                html: 'text/html',
                text: 'text/plain'
            },
            // Whether the request is to another domain
            crossDomain: false,
            // Default timeout
            timeout: 0,
            // Whether data should be serialized to string
            processData: false,
            // Whether the browser should be allowed to cache GET responses
            cache: true,

            traditional : false,
            
            xhrFields : {
                withCredentials : false
            }
        };

        function mimeToDataType(mime) {
            if (mime) {
                mime = mime.split(';', 2)[0];
            }
            if (mime) {
                if (mime == htmlType) {
                    return "html";
                } else if (mime == jsonType) {
                    return "json";
                } else if (scriptTypeRE.test(mime)) {
                    return "script";
                } else if (xmlTypeRE.test(mime)) {
                    return "xml";
                }
            }
            return "text";
        }

        function appendQuery(url, query) {
            if (query == '') return url
            return (url + '&' + query).replace(/[&?]{1,2}/, '?')
        }

        // serialize payload and append it to the URL for GET requests
        function serializeData(options) {
            options.data = options.data || options.query;
            if (options.processData && options.data && type(options.data) != "string") {
                options.data = param(options.data, options.traditional);
            }
            if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
                if (type(options.data) != "string") {
                    options.data = param(options.data, options.traditional);
                }
                options.url = appendQuery(options.url, options.data);
                options.data = undefined;
            }
        }
        
        function serialize(params, obj, traditional, scope) {
            var t, array = isArray(obj),
                hash = isPlainObject(obj)
            each(obj, function(key, value) {
                t =type(value);
                if (scope) key = traditional ? scope :
                    scope + '[' + (hash || t == 'object' || t == 'array' ? key : '') + ']'
                // handle data in serializeArray() format
                if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
                else if (t == "array" || (!traditional && t == "object"))
                    serialize(params, value, traditional, key)
                else params.add(key, value)
            })
        }

        var param = function(obj, traditional) {
            var params = []
            params.add = function(key, value) {
                if (isFunction(value)) {
                  value = value();
                }
                if (value == null) {
                  value = "";
                }
                this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            };
            serialize(params, obj, traditional)
            return params.join('&').replace(/%20/g, '+')
        };

        var Xhr = Evented.inherit({
            klassName : "Xhr",

            _request  : function(args) {
                var _ = this._,
                    self = this,
                    options = mixin({},XhrDefaultOptions,_.options,args),
                    xhr = _.xhr = new XMLHttpRequest();

                serializeData(options)

                if (options.beforeSend) {
                    options.beforeSend.call(this, xhr, options);
                }                

                var dataType = options.dataType || options.handleAs,
                    mime = options.mimeType || options.accepts[dataType],
                    headers = options.headers,
                    xhrFields = options.xhrFields,
                    isFormData = options.data && options.data instanceof FormData,
                    basicAuthorizationToken = options.basicAuthorizationToken,
                    type = options.type,
                    url = options.url,
                    async = options.async,
                    user = options.user , 
                    password = options.password,
                    deferred = new Deferred(),
                    contentType = options.contentType || (isFormData ? false : 'application/x-www-form-urlencoded');

                if (xhrFields) {
                    for (name in xhrFields) {
                        xhr[name] = xhrFields[name];
                    }
                }

                if (mime && mime.indexOf(',') > -1) {
                    mime = mime.split(',', 2)[0];
                }
                if (mime && xhr.overrideMimeType) {
                    xhr.overrideMimeType(mime);
                }

                //if (dataType) {
                //    xhr.responseType = dataType;
                //}

                var finish = function() {
                    xhr.onloadend = noop;
                    xhr.onabort = noop;
                    xhr.onprogress = noop;
                    xhr.ontimeout = noop;
                    xhr = null;
                }
                var onloadend = function() {
                    var result, error = false
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && getAbsoluteUrl(url).startsWith('file:'))) {
                        dataType = dataType || mimeToDataType(options.mimeType || xhr.getResponseHeader('content-type'));

                        result = xhr.responseText;
                        try {
                            if (dataType == 'script') {
                                eval(result);
                            } else if (dataType == 'xml') {
                                result = xhr.responseXML;
                            } else if (dataType == 'json') {
                                result = blankRE.test(result) ? null : JSON.parse(result);
                            } else if (dataType == "blob") {
                                result = Blob([xhrObj.response]);
                            } else if (dataType == "arraybuffer") {
                                result = xhr.reponse;
                            }
                        } catch (e) { 
                            error = e;
                        }

                        if (error) {
                            deferred.reject(error,xhr.status,xhr);
                        } else {
                            deferred.resolve(result,xhr.status,xhr);
                        }
                    } else {
                        deferred.reject(new Error(xhr.statusText),xhr.status,xhr);
                    }
                    finish();
                };

                var onabort = function() {
                    if (deferred) {
                        deferred.reject(new Error("abort"),xhr.status,xhr);
                    }
                    finish();                 
                }
 
                var ontimeout = function() {
                    if (deferred) {
                        deferred.reject(new Error("timeout"),xhr.status,xhr);
                    }
                    finish();                 
                }

                var onprogress = function(evt) {
                    if (deferred) {
                        deferred.notify(evt,xhr.status,xhr);
                    }
                }

                xhr.onloadend = onloadend;
                xhr.onabort = onabort;
                xhr.ontimeout = ontimeout;
                xhr.onprogress = onprogress;

                xhr.open(type, url, async, user, password);
               
                if (headers) {
                    for ( var key in headers) {
                        var value = headers[key];
 
                        if(key.toLowerCase() === 'content-type'){
                            contentType = value;
                        } else {
                           xhr.setRequestHeader(key, value);
                        }
                    }
                }   

                if  (contentType && contentType !== false){
                    xhr.setRequestHeader('Content-Type', contentType);
                }

                if(!headers || !('X-Requested-With' in headers)){
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                }


                //If basicAuthorizationToken is defined set its value into "Authorization" header
                if (basicAuthorizationToken) {
                    xhr.setRequestHeader("Authorization", basicAuthorizationToken);
                }

                xhr.send(options.data ? options.data : null);

                return deferred.promise;

            },

            "abort": function() {
                var _ = this._,
                    xhr = _.xhr;

                if (xhr) {
                    xhr.abort();
                }    
            },


            "request": function(args) {
                return this._request(args);
            },

            get : function(args) {
                args = args || {};
                args.type = "GET";
                return this._request(args);
            },

            post : function(args) {
                args = args || {};
                args.type = "POST";
                return this._request(args);
            },

            patch : function(args) {
                args = args || {};
                args.type = "PATCH";
                return this._request(args);
            },

            put : function(args) {
                args = args || {};
                args.type = "PUT";
                return this._request(args);
            },

            del : function(args) {
                args = args || {};
                args.type = "DELETE";
                return this._request(args);
            },

            "init": function(options) {
                this._ = {
                    options : options || {}
                };
            }
        });

        ["request","get","post","put","del","patch"].forEach(function(name){
            Xhr[name] = function(url,args) {
                var xhr = new Xhr({"url" : url});
                return xhr[name](args);
            };
        });

        Xhr.defaultOptions = XhrDefaultOptions;
        Xhr.param = param;

        return Xhr;
    })();

	return http.Xhr = Xhr;	
});
define('skylark-langx/skylark',[
    "skylark-langx-ns"
], function(ns) {
	return ns;
});

define('skylark-langx/arrays',[
	"skylark-langx-arrays"
],function(arrays){
  return arrays;
});
define('skylark-langx/klass',[
    "skylark-langx-klass"
],function(klass){
    return klass;
});
define('skylark-langx/ArrayStore',[
    "./klass"
],function(klass){
    var SimpleQueryEngine = function(query, options){
        // summary:
        //      Simple query engine that matches using filter functions, named filter
        //      functions or objects by name-value on a query object hash
        //
        // description:
        //      The SimpleQueryEngine provides a way of getting a QueryResults through
        //      the use of a simple object hash as a filter.  The hash will be used to
        //      match properties on data objects with the corresponding value given. In
        //      other words, only exact matches will be returned.
        //
        //      This function can be used as a template for more complex query engines;
        //      for example, an engine can be created that accepts an object hash that
        //      contains filtering functions, or a string that gets evaluated, etc.
        //
        //      When creating a new dojo.store, simply set the store's queryEngine
        //      field as a reference to this function.
        //
        // query: Object
        //      An object hash with fields that may match fields of items in the store.
        //      Values in the hash will be compared by normal == operator, but regular expressions
        //      or any object that provides a test() method are also supported and can be
        //      used to match strings by more complex expressions
        //      (and then the regex's or object's test() method will be used to match values).
        //
        // options: dojo/store/api/Store.QueryOptions?
        //      An object that contains optional information such as sort, start, and count.
        //
        // returns: Function
        //      A function that caches the passed query under the field "matches".  See any
        //      of the "query" methods on dojo.stores.
        //
        // example:
        //      Define a store with a reference to this engine, and set up a query method.
        //
        //  |   var myStore = function(options){
        //  |       //  ...more properties here
        //  |       this.queryEngine = SimpleQueryEngine;
        //  |       //  define our query method
        //  |       this.query = function(query, options){
        //  |           return QueryResults(this.queryEngine(query, options)(this.data));
        //  |       };
        //  |   };

        // create our matching query function
        switch(typeof query){
            default:
                throw new Error("Can not query with a " + typeof query);
            case "object": case "undefined":
                var queryObject = query;
                query = function(object){
                    for(var key in queryObject){
                        var required = queryObject[key];
                        if(required && required.test){
                            // an object can provide a test method, which makes it work with regex
                            if(!required.test(object[key], object)){
                                return false;
                            }
                        }else if(required != object[key]){
                            return false;
                        }
                    }
                    return true;
                };
                break;
            case "string":
                // named query
                if(!this[query]){
                    throw new Error("No filter function " + query + " was found in store");
                }
                query = this[query];
                // fall through
            case "function":
                // fall through
        }
        
        function filter(arr, callback, thisObject){
            // summary:
            //      Returns a new Array with those items from arr that match the
            //      condition implemented by callback.
            // arr: Array
            //      the array to iterate over.
            // callback: Function|String
            //      a function that is invoked with three arguments (item,
            //      index, array). The return of this function is expected to
            //      be a boolean which determines whether the passed-in item
            //      will be included in the returned array.
            // thisObject: Object?
            //      may be used to scope the call to callback
            // returns: Array
            // description:
            //      This function corresponds to the JavaScript 1.6 Array.filter() method, with one difference: when
            //      run over sparse arrays, this implementation passes the "holes" in the sparse array to
            //      the callback function with a value of undefined. JavaScript 1.6's filter skips the holes in the sparse array.
            //      For more details, see:
            //      https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
            // example:
            //  | // returns [2, 3, 4]
            //  | array.filter([1, 2, 3, 4], function(item){ return item>1; });

            // TODO: do we need "Ctr" here like in map()?
            var i = 0, l = arr && arr.length || 0, out = [], value;
            if(l && typeof arr == "string") arr = arr.split("");
            if(typeof callback == "string") callback = cache[callback] || buildFn(callback);
            if(thisObject){
                for(; i < l; ++i){
                    value = arr[i];
                    if(callback.call(thisObject, value, i, arr)){
                        out.push(value);
                    }
                }
            }else{
                for(; i < l; ++i){
                    value = arr[i];
                    if(callback(value, i, arr)){
                        out.push(value);
                    }
                }
            }
            return out; // Array
        }

        function execute(array){
            // execute the whole query, first we filter
            var results = filter(array, query);
            // next we sort
            var sortSet = options && options.sort;
            if(sortSet){
                results.sort(typeof sortSet == "function" ? sortSet : function(a, b){
                    for(var sort, i=0; sort = sortSet[i]; i++){
                        var aValue = a[sort.attribute];
                        var bValue = b[sort.attribute];
                        // valueOf enables proper comparison of dates
                        aValue = aValue != null ? aValue.valueOf() : aValue;
                        bValue = bValue != null ? bValue.valueOf() : bValue;
                        if (aValue != bValue){
                            // modified by lwf 2016/07/09
                            //return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                            return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                        }
                    }
                    return 0;
                });
            }
            // now we paginate
            if(options && (options.start || options.count)){
                var total = results.length;
                results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
                results.total = total;
            }
            return results;
        }
        execute.matches = query;
        return execute;
    };

    var QueryResults = function(results){
        // summary:
        //      A function that wraps the results of a store query with additional
        //      methods.
        // description:
        //      QueryResults is a basic wrapper that allows for array-like iteration
        //      over any kind of returned data from a query.  While the simplest store
        //      will return a plain array of data, other stores may return deferreds or
        //      promises; this wrapper makes sure that *all* results can be treated
        //      the same.
        //
        //      Additional methods include `forEach`, `filter` and `map`.
        // results: Array|dojo/promise/Promise
        //      The result set as an array, or a promise for an array.
        // returns:
        //      An array-like object that can be used for iterating over.
        // example:
        //      Query a store and iterate over the results.
        //
        //  |   store.query({ prime: true }).forEach(function(item){
        //  |       //  do something
        //  |   });

        if(!results){
            return results;
        }

        var isPromise = !!results.then;
        // if it is a promise it may be frozen
        if(isPromise){
            results = Object.delegate(results);
        }
        function addIterativeMethod(method){
            // Always add the iterative methods so a QueryResults is
            // returned whether the environment is ES3 or ES5
            results[method] = function(){
                var args = arguments;
                var result = Deferred.when(results, function(results){
                    //Array.prototype.unshift.call(args, results);
                    return QueryResults(Array.prototype[method].apply(results, args));
                });
                // forEach should only return the result of when()
                // when we're wrapping a promise
                if(method !== "forEach" || isPromise){
                    return result;
                }
            };
        }

        addIterativeMethod("forEach");
        addIterativeMethod("filter");
        addIterativeMethod("map");
        if(results.total == null){
            results.total = Deferred.when(results, function(results){
                return results.length;
            });
        }
        return results; // Object
    };

    var ArrayStore = klass({
        "klassName": "ArrayStore",

        "queryEngine": SimpleQueryEngine,
        
        "idProperty": "id",


        get: function(id){
            // summary:
            //      Retrieves an object by its identity
            // id: Number
            //      The identity to use to lookup the object
            // returns: Object
            //      The object in the store that matches the given id.
            return this.data[this.index[id]];
        },

        getIdentity: function(object){
            return object[this.idProperty];
        },

        put: function(object, options){
            var data = this.data,
                index = this.index,
                idProperty = this.idProperty;
            var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
            if(id in index){
                // object exists
                if(options && options.overwrite === false){
                    throw new Error("Object already exists");
                }
                // replace the entry in data
                data[index[id]] = object;
            }else{
                // add the new object
                index[id] = data.push(object) - 1;
            }
            return id;
        },

        add: function(object, options){
            (options = options || {}).overwrite = false;
            // call put with overwrite being false
            return this.put(object, options);
        },

        remove: function(id){
            // summary:
            //      Deletes an object by its identity
            // id: Number
            //      The identity to use to delete the object
            // returns: Boolean
            //      Returns true if an object was removed, falsy (undefined) if no object matched the id
            var index = this.index;
            var data = this.data;
            if(id in index){
                data.splice(index[id], 1);
                // now we have to reindex
                this.setData(data);
                return true;
            }
        },
        query: function(query, options){
            // summary:
            //      Queries the store for objects.
            // query: Object
            //      The query to use for retrieving objects from the store.
            // options: dojo/store/api/Store.QueryOptions?
            //      The optional arguments to apply to the resultset.
            // returns: dojo/store/api/Store.QueryResults
            //      The results of the query, extended with iterative methods.
            //
            // example:
            //      Given the following store:
            //
            //  |   var store = new Memory({
            //  |       data: [
            //  |           {id: 1, name: "one", prime: false },
            //  |           {id: 2, name: "two", even: true, prime: true},
            //  |           {id: 3, name: "three", prime: true},
            //  |           {id: 4, name: "four", even: true, prime: false},
            //  |           {id: 5, name: "five", prime: true}
            //  |       ]
            //  |   });
            //
            //  ...find all items where "prime" is true:
            //
            //  |   var results = store.query({ prime: true });
            //
            //  ...or find all items where "even" is true:
            //
            //  |   var results = store.query({ even: true });
            return QueryResults(this.queryEngine(query, options)(this.data));
        },

        setData: function(data){
            // summary:
            //      Sets the given data as the source for this store, and indexes it
            // data: Object[]
            //      An array of objects to use as the source of data.
            if(data.items){
                // just for convenience with the data format IFRS expects
                this.idProperty = data.identifier || this.idProperty;
                data = this.data = data.items;
            }else{
                this.data = data;
            }
            this.index = {};
            for(var i = 0, l = data.length; i < l; i++){
                this.index[data[i][this.idProperty]] = i;
            }
        },

        init: function(options) {
            for(var i in options){
                this[i] = options[i];
            }
            this.setData(this.data || []);
        }

    });

	return ArrayStore;
});
define('skylark-langx-aspect/aspect',[
    "skylark-langx-ns"
],function(skylark){

  var undefined, nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments){
        var previous = dispatcher[type];
        var around = type == "around";
        var signal;
        if(around){
            var advised = advice(function(){
                return previous.advice(this, arguments);
            });
            signal = {
                remove: function(){
                    if(advised){
                        advised = dispatcher = advice = null;
                    }
                },
                advice: function(target, args){
                    return advised ?
                        advised.apply(target, args) :  // called the advised function
                        previous.advice(target, args); // cancelled, skip to next one
                }
            };
        }else{
            // create the remove handler
            signal = {
                remove: function(){
                    if(signal.advice){
                        var previous = signal.previous;
                        var next = signal.next;
                        if(!next && !previous){
                            delete dispatcher[type];
                        }else{
                            if(previous){
                                previous.next = next;
                            }else{
                                dispatcher[type] = next;
                            }
                            if(next){
                                next.previous = previous;
                            }
                        }

                        // remove the advice to signal that this signal has been removed
                        dispatcher = advice = signal.advice = null;
                    }
                },
                id: nextId++,
                advice: advice,
                receiveArguments: receiveArguments
            };
        }
        if(previous && !around){
            if(type == "after"){
                // add the listener to the end of the list
                // note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
                while(previous.next && (previous = previous.next)){}
                previous.next = signal;
                signal.previous = previous;
            }else if(type == "before"){
                // add to beginning
                dispatcher[type] = signal;
                signal.next = previous;
                previous.previous = signal;
            }
        }else{
            // around or first one just replaces
            dispatcher[type] = signal;
        }
        return signal;
    }
    function aspect(type){
        return function(target, methodName, advice, receiveArguments){
            var existing = target[methodName], dispatcher;
            if(!existing || existing.target != target){
                // no dispatcher in place
                target[methodName] = dispatcher = function(){
                    var executionId = nextId;
                    // before advice
                    var args = arguments;
                    var before = dispatcher.before;
                    while(before){
                        args = before.advice.apply(this, args) || args;
                        before = before.next;
                    }
                    // around advice
                    if(dispatcher.around){
                        var results = dispatcher.around.advice(this, args);
                    }
                    // after advice
                    var after = dispatcher.after;
                    while(after && after.id < executionId){
                        if(after.receiveArguments){
                            var newResults = after.advice.apply(this, args);
                            // change the return value only if a new value was returned
                            results = newResults === undefined ? results : newResults;
                        }else{
                            results = after.advice.call(this, results, args);
                        }
                        after = after.next;
                    }
                    return results;
                };
                if(existing){
                    dispatcher.around = {advice: function(target, args){
                        return existing.apply(target, args);
                    }};
                }
                dispatcher.target = target;
            }
            var results = advise((dispatcher || existing), type, advice, receiveArguments);
            advice = null;
            return results;
        };
    }

    return skylark.attach("langx.aspect",{
        after: aspect("after"),
 
        around: aspect("around"),
        
        before: aspect("before")
    });
});
define('skylark-langx-aspect/main',[
	"./aspect"
],function(aspect){
	return aspect;
});
define('skylark-langx-aspect', ['skylark-langx-aspect/main'], function (main) { return main; });

define('skylark-langx/aspect',[
    "skylark-langx-aspect"
],function(aspect){
  return aspect;
});
define('skylark-langx/async',[
    "skylark-langx-async"
],function(async){
    return async;
});
define('skylark-langx-datetimes/datetimes',[
    "skylark-langx-ns"
],function(skylark){
     function parseMilliSeconds(str) {

        var strs = str.split(' ');
        var number = parseInt(strs[0]);

        if (isNaN(number)){
            return 0;
        }

        var min = 60000 * 60;

        switch (strs[1].trim().replace(/\./g, '')) {
            case 'minutes':
            case 'minute':
            case 'min':
            case 'mm':
            case 'm':
                return 60000 * number;
            case 'hours':
            case 'hour':
            case 'HH':
            case 'hh':
            case 'h':
            case 'H':
                return min * number;
            case 'seconds':
            case 'second':
            case 'sec':
            case 'ss':
            case 's':
                return 1000 * number;
            case 'days':
            case 'day':
            case 'DD':
            case 'dd':
            case 'd':
                return (min * 24) * number;
            case 'months':
            case 'month':
            case 'MM':
            case 'M':
                return (min * 24 * 28) * number;
            case 'weeks':
            case 'week':
            case 'W':
            case 'w':
                return (min * 24 * 7) * number;
            case 'years':
            case 'year':
            case 'yyyy':
            case 'yy':
            case 'y':
                return (min * 24 * 365) * number;
            default:
                return 0;
        }
    };
	
	return skylark.attach("langx.datetimes",{
		parseMilliSeconds
	});
});
define('skylark-langx-datetimes/main',[
	"./datetimes"
],function(datetimes){
	return datetimes;
});
define('skylark-langx-datetimes', ['skylark-langx-datetimes/main'], function (main) { return main; });

define('skylark-langx/datetimes',[
    "skylark-langx-datetimes"
],function(datetimes){
    return datetimes;
});
define('skylark-langx/Deferred',[
    "skylark-langx-async/Deferred"
],function(Deferred){
    return Deferred;
});
define('skylark-langx-emitter/main',[
	"./Emitter",
	"./Evented"
],function(Emitter){
	return Emitter;
});
define('skylark-langx-emitter', ['skylark-langx-emitter/main'], function (main) { return main; });

define('skylark-langx/Emitter',[
    "skylark-langx-emitter"
],function(Evented){
    return Evented;
});
define('skylark-langx/Evented',[
    "skylark-langx-emitter"
],function(Evented){
    return Evented;
});
define('skylark-langx/funcs',[
    "skylark-langx-funcs"
],function(funcs){
    return funcs;
});
define('skylark-langx/hoster',[
	"skylark-langx-hoster"
],function(hoster){
	return hoster;
});
define('skylark-langx/numbers',[
	"skylark-langx-numbers"
],function(numbers){
	return numbers;
});
define('skylark-langx/objects',[
    "skylark-langx-objects"
],function(objects){
    return objects;
});
define('skylark-langx-strings/strings',[
    "skylark-langx-ns"
],function(skylark){
    // add default escape function for escaping HTML entities
    var escapeCharMap = Object.freeze({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;',
        '=': '&#x3D;',
    });
    function replaceChar(c) {
        return escapeCharMap[c];
    }
    var escapeChars = /[&<>"'`=]/g;


     /*
     * Converts camel case into dashes.
     * @param {String} str
     * @return {String}
     * @exapmle marginTop -> margin-top
     */
    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                (value == "false" ? false :
                    value == "null" ? null :
                    +value + "" == value ? +value :
                    /^[\[\{]/.test(value) ? JSON.parse(value) :
                    value) : value;
        } catch (e) {
            return value;
        }
    }

    function escapeHTML(str) {
        if (str == null) {
            return '';
        }
        if (!str) {
            return String(str);
        }

        return str.toString().replace(escapeChars, replaceChar);
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    }

    function trim(str) {
        return str == null ? "" : String.prototype.trim.call(str);
    }

    function substitute( /*String*/ template,
        /*Object|Array*/
        map,
        /*Function?*/
        transform,
        /*Object?*/
        thisObject) {
        // summary:
        //    Performs parameterized substitutions on a string. Throws an
        //    exception if any parameter is unmatched.
        // template:
        //    a string with expressions in the form `${key}` to be replaced or
        //    `${key:format}` which specifies a format function. keys are case-sensitive.
        // map:
        //    hash to search for substitutions
        // transform:
        //    a function to process all parameters before substitution takes


        thisObject = thisObject || window;
        transform = transform ?
            proxy(thisObject, transform) : function(v) {
                return v;
            };

        function getObject(key, map) {
            if (key.match(/\./)) {
                var retVal,
                    getValue = function(keys, obj) {
                        var _k = keys.pop();
                        if (_k) {
                            if (!obj[_k]) return null;
                            return getValue(keys, retVal = obj[_k]);
                        } else {
                            return retVal;
                        }
                    };
                return getValue(key.split(".").reverse(), map);
            } else {
                return map[key];
            }
        }

        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
            function(match, key, format) {
                var value = getObject(key, map);
                if (format) {
                    value = getObject(format, thisObject).call(thisObject, value, key);
                }
                return transform(value, key).toString();
            }); // String
    }

    var idCounter = 0;
    function uniqueId (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    }


    /**
     * https://github.com/cho45/micro-template.js
     * (c) cho45 http://cho45.github.com/mit-license
     */
    function template (id, data) {

        function include(name, args) {
            var stash = {};
            for (var key in template.context.stash) if (template.context.stash.hasOwnProperty(key)) {
                stash[key] = template.context.stash[key];
            }
            if (args) for (var key in args) if (args.hasOwnProperty(key)) {
                stash[key] = args[key];
            }
            var context = template.context;
            context.ret += template(name, stash);
            template.context = context;
        }

        function wrapper(name, fun) {
            var current = template.context.ret;
            template.context.ret = '';
            fun.apply(template.context);
            var content = template.context.ret;
            var orig_content = template.context.stash.content;
            template.context.stash.content = content;
            template.context.ret = current + template(name, template.context.stash);
            template.context.stash.content = orig_content;
        }

        var me = arguments.callee;
        if (!me.cache[id]) me.cache[id] = (function () {
            var name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = 'template(string)', id); // no warnings
            var line = 1, body = (
                "try { " +
                    (me.variable ?  "var " + me.variable + " = this.stash;" : "with (this.stash) { ") +
                        "this.ret += '"  +
                        string.
                            replace(/<%/g, '\x11').replace(/%>/g, '\x13'). // if you want other tag, just edit this line
                            replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27').
                            replace(/^\s*|\s*$/g, '').
                            replace(/\n|\r\n/g, function () { return "';\nthis.line = " + (++line) + "; this.ret += '\\n" }).
                            replace(/\x11=raw(.+?)\x13/g, "' + ($1) + '").
                            replace(/\x11=(.+?)\x13/g, "' + this.escapeHTML($1) + '").
                            replace(/\x11(.+?)\x13/g, "'; $1; this.ret += '") +
                    "'; " + (me.variable ? "" : "}") + "return this.ret;" +
                "} catch (e) { throw 'TemplateError: ' + e + ' (on " + name + "' + ' line ' + this.line + ')'; } " +
                "//@ sourceURL=" + name + "\n" // source map
            ).replace(/this\.ret \+= '';/g, '');
            var func = new Function(body);
            var map  = { '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', '\x22' : '&#x22;', '\x27' : '&#x27;' };
            var escapeHTML = function (string) { return (''+string).replace(/[&<>\'\"]/g, function (_) { return map[_] }) };
            return function (stash) { return func.call(me.context = { escapeHTML: escapeHTML, line: 1, ret : '', stash: stash }) };
        })();
        return data ? me.cache[id](data) : me.cache[id];
    }

    template.cache = {};
    

    template.get = function (id) {
        return document.getElementById(id).innerHTML;
    };

    function rtrim(str) {
        return str.replace(/\s+$/g, '');
    }

    // Slugify a string
    function slugify(str) {
        str = str.replace(/^\s+|\s+$/g, '');

        // Make the string lowercase
        str = str.toLowerCase();

        // Remove accents, swap ñ for n, etc
        var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
        var to   = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        // Remove invalid chars
        //str = str.replace(/[^a-z0-9 -]/g, '') 
        // Collapse whitespace and replace by -
        str = str.replace(/\s+/g, '-') 
        // Collapse dashes
        .replace(/-+/g, '-'); 

        return str;
    }    

    // return boolean if string 'true' or string 'false', or if a parsable string which is a number
    // also supports JSON object and/or arrays parsing
    function toType(str) {
        var type = typeof str;
        if (type !== 'string') {
            return str;
        }
        var nb = parseFloat(str);
        if (!isNaN(nb) && isFinite(str)) {
            return nb;
        }
        if (str === 'false') {
            return false;
        }
        if (str === 'true') {
            return true;
        }

        try {
            str = JSON.parse(str);
        } catch (e) {}

        return str;
    }

	return skylark.attach("langx.strings",{
        camelCase: function(str) {
            return str.replace(/-([\da-z])/g, function(a) {
                return a.toUpperCase().replace('-', '');
            });
        },

        dasherize: dasherize,

        deserializeValue: deserializeValue,

        escapeHTML : escapeHTML,

        generateUUID : generateUUID,

        lowerFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        rtrim : rtrim,

        serializeValue: function(value) {
            return JSON.stringify(value)
        },


        substitute: substitute,

        slugify : slugify,

        //template : template,

        trim: trim,

        uniqueId: uniqueId,

        upperFirst: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
	}) ; 

});
define('skylark-langx-strings/base64',[
	"./strings"
],function(strings) {

	// private property
	const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// private method for UTF-8 encoding
	function _utf8_encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}

	// private method for UTF-8 decoding
	function _utf8_decode(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

	// public method for encoding
	function encode(input, binary) {
		binary = (binary != null) ? binary : false;
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		if (!binary)
		{
			input = _utf8_encode(input);
		}

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	}

	// public method for decoding
	function decode(input, binary) {
		binary = (binary != null) ? binary : false;
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		if (!binary) {
			output = _utf8_decode(output);
		}

		return output;

	}


	return strings.base64 = {
		decode,
		encode
	};
	
});
define('skylark-langx-strings/main',[
	"./strings",
	"./base64"
],function(strings){
	return strings;
});
define('skylark-langx-strings', ['skylark-langx-strings/main'], function (main) { return main; });

define('skylark-langx/strings',[
    "skylark-langx-strings"
],function(strings){
    return strings;
});
define('skylark-langx/Stateful',[
	"./Evented",
  "./strings",
  "./objects"
],function(Evented,strings,objects){
    var isEqual = objects.isEqual,
        mixin = objects.mixin,
        result = objects.result,
        isEmptyObject = objects.isEmptyObject,
        clone = objects.clone,
        uniqueId = strings.uniqueId;

    var Stateful = Evented.inherit({
        _construct : function(attributes, options) {
            var attrs = attributes || {};
            options || (options = {});
            this.cid = uniqueId(this.cidPrefix);
            this.attributes = {};
            if (options.collection) this.collection = options.collection;
            if (options.parse) attrs = this.parse(attrs, options) || {};
            var defaults = result(this, 'defaults');
            attrs = mixin({}, defaults, attrs);
            this.set(attrs, options);
            this.changed = {};
        },

        // A hash of attributes whose current and previous value differ.
        changed: null,

        // The value returned during the last failed validation.
        validationError: null,

        // The default name for the JSON `id` attribute is `"id"`. MongoDB and
        // CouchDB users may want to set this to `"_id"`.
        idAttribute: 'id',

        // The prefix is used to create the client id which is used to identify models locally.
        // You may want to override this if you're experiencing name clashes with model ids.
        cidPrefix: 'c',


        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
          return clone(this.attributes);
        },


        // Get the value of an attribute.
        get: function(attr) {
          return this.attributes[attr];
        },

        // Returns `true` if the attribute contains a value that is not null
        // or undefined.
        has: function(attr) {
          return this.get(attr) != null;
        },

        // Set a hash of model attributes on the object, firing `"change"`. This is
        // the core primitive operation of a model, updating the data and notifying
        // anyone who needs to know about the change in state. The heart of the beast.
        set: function(key, val, options) {
          if (key == null) return this;

          // Handle both `"key", value` and `{key: value}` -style arguments.
          var attrs;
          if (typeof key === 'object') {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }

          options || (options = {});

          // Run validation.
          if (!this._validate(attrs, options)) return false;

          // Extract attributes and options.
          var unset      = options.unset;
          var silent     = options.silent;
          var changes    = [];
          var changing   = this._changing;
          this._changing = true;

          if (!changing) {
            this._previousAttributes = clone(this.attributes);
            this.changed = {};
          }

          var current = this.attributes;
          var changed = this.changed;
          var prev    = this._previousAttributes;

          // For each `set` attribute, update or delete the current value.
          for (var attr in attrs) {
            val = attrs[attr];
            if (!isEqual(current[attr], val)) changes.push(attr);
            if (!isEqual(prev[attr], val)) {
              changed[attr] = val;
            } else {
              delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
          }

          // Update the `id`.
          if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

          // Trigger all relevant attribute changes.
          if (!silent) {
            if (changes.length) this._pending = options;
            for (var i = 0; i < changes.length; i++) {
              this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
          }

          // You might be wondering why there's a `while` loop here. Changes can
          // be recursively nested within `"change"` events.
          if (changing) return this;
          if (!silent) {
            while (this._pending) {
              options = this._pending;
              this._pending = false;
              this.trigger('change', this, options);
            }
          }
          this._pending = false;
          this._changing = false;
          return this;
        },

        // Remove an attribute from the model, firing `"change"`. `unset` is a noop
        // if the attribute doesn't exist.
        unset: function(attr, options) {
          return this.set(attr, void 0, mixin({}, options, {unset: true}));
        },

        // Clear all attributes on the model, firing `"change"`.
        clear: function(options) {
          var attrs = {};
          for (var key in this.attributes) attrs[key] = void 0;
          return this.set(attrs, mixin({}, options, {unset: true}));
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
          if (attr == null) return !isEmptyObject(this.changed);
          return this.changed[attr] !== undefined;
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
          if (!diff) return this.hasChanged() ? clone(this.changed) : false;
          var old = this._changing ? this._previousAttributes : this.attributes;
          var changed = {};
          for (var attr in diff) {
            var val = diff[attr];
            if (isEqual(old[attr], val)) continue;
            changed[attr] = val;
          }
          return !isEmptyObject(changed) ? changed : false;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
          if (attr == null || !this._previousAttributes) return null;
          return this._previousAttributes[attr];
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
          return clone(this._previousAttributes);
        },

        // Create a new model with identical attributes to this one.
        clone: function() {
          return new this.constructor(this.attributes);
        },

        // A model is new if it has never been saved to the server, and lacks an id.
        isNew: function() {
          return !this.has(this.idAttribute);
        },

        // Check if the model is currently in a valid state.
        isValid: function(options) {
          return this._validate({}, mixin({}, options, {validate: true}));
        },

        // Run validation against the next complete set of model attributes,
        // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
        _validate: function(attrs, options) {
          if (!options.validate || !this.validate) return true;
          attrs = mixin({}, this.attributes, attrs);
          var error = this.validationError = this.validate(attrs, options) || null;
          if (!error) return true;
          this.trigger('invalid', this, error, mixin(options, {validationError: error}));
          return false;
        }
    });

	return Stateful;
});
define('skylark-langx-topic/topic',[
	"skylark-langx-ns",
	"skylark-langx-emitter/Evented"
],function(skylark,Evented){
	var hub = new Evented();

	return skylark.attach("langx.topic",{
	    publish: function(name, arg1,argn) {
	        var data = [].slice.call(arguments, 1);

	        return hub.trigger({
	            type : name,
	            data : data
	        });
	    },

        subscribe: function(name, listener,ctx) {
        	var handler = function(e){
                listener.apply(ctx,e.data);
            };
            hub.on(name, handler);
            return {
            	remove : function(){
            		hub.off(name,handler);
            	}
            }

        }

	});
});
define('skylark-langx-topic/main',[
	"./topic"
],function(topic){
	return topic;
});
define('skylark-langx-topic', ['skylark-langx-topic/main'], function (main) { return main; });

define('skylark-langx/topic',[
	"skylark-langx-topic"
],function(topic){
	return topic;
});
define('skylark-langx/types',[
    "skylark-langx-types"
],function(types){
    return types;
});
define('skylark-langx/langx',[
    "./skylark",
    "./arrays",
    "./ArrayStore",
    "./aspect",
    "./async",
    "./datetimes",
    "./Deferred",
    "./Emitter",
    "./Evented",
    "./funcs",
    "./hoster",
    "./klass",
    "./numbers",
    "./objects",
    "./Stateful",
    "./strings",
    "./topic",
    "./types"
], function(skylark,arrays,ArrayStore,aspect,async,datetimes,Deferred,Emitter,Evented,funcs,hoster,klass,numbers,objects,Stateful,strings,topic,types) {
    "use strict";
    var toString = {}.toString,
        concat = Array.prototype.concat,
        indexOf = Array.prototype.indexOf,
        slice = Array.prototype.slice,
        filter = Array.prototype.filter,
        mixin = objects.mixin,
        safeMixin = objects.safeMixin,
        isFunction = types.isFunction;


    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }

    function getQueryParams(url) {
        var url = url || window.location.href,
            segs = url.split("?"),
            params = {};

        if (segs.length > 1) {
            segs[1].split("&").forEach(function(queryParam) {
                var nv = queryParam.split('=');
                params[nv[0]] = nv[1];
            });
        }
        return params;
    }


    function toPixel(value) {
        // style values can be floats, client code may want
        // to round for integer pixels.
        return parseFloat(value) || 0;
    }


    var _uid = 1;

    function uid(obj) {
        return obj._uid || (obj._uid = _uid++);
    }

    function langx() {
        return langx;
    }

    mixin(langx, {
        createEvent : Emitter.createEvent,

        funcArg: funcArg,

        getQueryParams: getQueryParams,

        toPixel: toPixel,

        uid: uid,

        URL: typeof window !== "undefined" ? window.URL || window.webkitURL : null

    });


    mixin(langx, arrays,aspect,datetimes,funcs,numbers,objects,strings,types,{
        ArrayStore : ArrayStore,

        async : async,
        
        Deferred: Deferred,

        Emitter: Emitter,

        Evented: Evented,

        hoster : hoster,

        klass : klass,
       
        Stateful: Stateful,

        topic : topic
    });

    return skylark.langx = langx;
});
define('skylark-domx-browser/browser',[
    "skylark-langx/skylark",
    "skylark-langx/langx"
], function(skylark,langx) {
    "use strict";

    var browser = langx.hoster.browser;
 
    var checkedCssProperties = {
            "transitionproperty": "TransitionProperty",
        },
        transEndEventNames = {
          WebkitTransition : 'webkitTransitionEnd',
          MozTransition    : 'transitionend',
          OTransition      : 'oTransitionEnd otransitionend',
          transition       : 'transitionend'
        },
        transEndEventName = null;


    var css3PropPrefix = "",
        css3StylePrefix = "",
        css3EventPrefix = "",

        cssStyles = {},
        cssProps = {},

        vendorPrefix,
        vendorPrefixRE,
        vendorPrefixesRE = /^(Webkit|webkit|O|Moz|moz|ms)(.*)$/,

        document = window.document,
        testEl = document.createElement("div"),

        matchesSelector = testEl.webkitMatchesSelector ||
                          testEl.mozMatchesSelector ||
                          testEl.oMatchesSelector ||
                          testEl.matchesSelector,

        requestFullScreen = testEl.requestFullscreen || 
                            testEl.webkitRequestFullscreen || 
                            testEl.mozRequestFullScreen || 
                            testEl.msRequestFullscreen,

        exitFullScreen =  document.exitFullscreen ||
                          document.webkitCancelFullScreen ||
                          document.mozCancelFullScreen ||
                          document.msExitFullscreen,

        testStyle = testEl.style;

    for (var name in testStyle) {
        var matched = name.match(vendorPrefixRE || vendorPrefixesRE);
        if (matched) {
            if (!vendorPrefixRE) {
                vendorPrefix = matched[1];
                vendorPrefixRE = new RegExp("^(" + vendorPrefix + ")(.*)$");

                css3StylePrefix = vendorPrefix;
                css3PropPrefix = '-' + vendorPrefix.toLowerCase() + '-';
                css3EventPrefix = vendorPrefix.toLowerCase();
            }

            cssStyles[langx.lowerFirst(matched[2])] = name;
            var cssPropName = langx.dasherize(matched[2]);
            cssProps[cssPropName] = css3PropPrefix + cssPropName;

            if (transEndEventNames[name]) {
              transEndEventName = transEndEventNames[name];
            }
        }
    }

    if (!transEndEventName) {
        if (testStyle["transition"] !== undefined) {
            transEndEventName = transEndEventNames["transition"];
        }
    }

    function normalizeCssEvent(name) {
        return css3EventPrefix ? css3EventPrefix + name : name.toLowerCase();
    }

    function normalizeCssProperty(name) {
        return cssProps[name] || name;
    }

    function normalizeStyleProperty(name) {
        return cssStyles[name] || name;
    }

    langx.mixin(browser, {
        css3PropPrefix: css3PropPrefix,

        isIE : !!/msie/i.exec( window.navigator.userAgent ),

        normalizeStyleProperty: normalizeStyleProperty,

        normalizeCssProperty: normalizeCssProperty,

        normalizeCssEvent: normalizeCssEvent,

        matchesSelector: matchesSelector,

        requestFullScreen : requestFullScreen,

        exitFullscreen : requestFullScreen,

        location: function() {
            return window.location;
        },

        support : {

        }

    });

    if  (transEndEventName) {
        browser.support.transition = {
            end : transEndEventName
        };
    }

    testEl = null;

    return skylark.attach("domx.browser",browser);
});

define('skylark-domx-browser/main',[
	"./browser"
],function(browser){
	return browser;
});
define('skylark-domx-browser', ['skylark-domx-browser/main'], function (main) { return main; });

define('skylark-domx-noder/noder',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser"
], function(skylark, langx, browser) {
    var isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g),
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        div = document.createElement("div"),
        table = document.createElement('table'),
        tableBody = document.createElement('tbody'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': tableBody,
            'tbody': table,
            'thead': table,
            'tfoot': table,
            'td': tableRow,
            'th': tableRow,
            '*': div
        },
        rootNodeRE = /^(?:body|html)$/i,
        map = Array.prototype.map,
        slice = Array.prototype.slice;

    function ensureNodes(nodes, copyByClone) {
        if (!langx.isArrayLike(nodes)) {
            nodes = [nodes];
        }
        if (copyByClone) {
            nodes = map.call(nodes, function(node) {
                return node.cloneNode(true);
            });
        }
        return langx.flatten(nodes);
    }

    function nodeName(elm, chkName) {
        var name = elm.nodeName && elm.nodeName.toLowerCase();
        if (chkName !== undefined) {
            return name === chkName.toLowerCase();
        }
        return name;
    };


    function activeElement(doc) {
        doc = doc || document;
        var el;

        // Support: IE 9 only
        // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
        try {
            el = doc.activeElement;
        } catch ( error ) {
            el = doc.body;
        }

        // Support: IE 9 - 11 only
        // IE may return null instead of an element
        // Interestingly, this only seems to occur when NOT in an iframe
        if ( !el ) {
            el = doc.body;
        }

        // Support: IE 11 only
        // IE11 returns a seemingly empty object in some cases when accessing
        // document.activeElement from an <iframe>
        if ( !el.nodeName ) {
            el = doc.body;
        }

        return el;
    };

    function enhancePlaceContent(placing,node) {
        if (langx.isFunction(placing)) {
            return placing.apply(node,[]);
        }
        if (langx.isArrayLike(placing)) {
            var neddsFlattern;
            for (var i=0;i<placing.length;i++) {
                if (langx.isFunction(placing[i])) {
                    placing[i] = placing[i].apply(node,[]);
                    if (langx.isArrayLike(placing[i])) {
                        neddsFlattern = true;
                    }
                }
            }
            if (neddsFlattern) {
                placing = langx.flatten(placing);
            }
        }
        return placing;
    }
    function after(node, placing, copyByClone) {
        placing = enhancePlaceContent(placing,node);
        var refNode = node,
            parent = refNode.parentNode;
        if (parent) {
            var nodes = ensureNodes(placing, copyByClone),
                refNode = refNode.nextSibling;

            for (var i = 0; i < nodes.length; i++) {
                if (refNode) {
                    parent.insertBefore(nodes[i], refNode);
                } else {
                    parent.appendChild(nodes[i]);
                }
            }
        }
        return this;
    }

    function append(node, placing, copyByClone) {
        placing = enhancePlaceContent(placing,node);
        var parentNode = node,
            nodes = ensureNodes(placing, copyByClone);
        for (var i = 0; i < nodes.length; i++) {
            parentNode.appendChild(nodes[i]);
        }
        return this;
    }

    function before(node, placing, copyByClone) {
        placing = enhancePlaceContent(placing,node);
        var refNode = node,
            parent = refNode.parentNode;
        if (parent) {
            var nodes = ensureNodes(placing, copyByClone);
            for (var i = 0; i < nodes.length; i++) {
                parent.insertBefore(nodes[i], refNode);
            }
        }
        return this;
    }
    /*   
     * Get the children of the specified node, including text and comment nodes.
     * @param {HTMLElement} elm
     */
    function contents(elm) {
        if (nodeName(elm, "iframe")) {
            return elm.contentDocument;
        }
        return elm.childNodes;
    }

    /*   
     * Create a element and set attributes on it.
     * @param {HTMLElement} tag
     * @param {props} props
     * @param } parent
     */
    function createElement(tag, props, parent) {
        var node;

        if (/svg/i.test(tag)) {
            node = document.createElementNS("http://www.w3.org/2000/svg", tag)
        } else {
            node = document.createElement(tag);
        }

        if (props) {
            for (var name in props) {
                node.setAttribute(name, props[name]);
            }
        }
        if (parent) {
            append(parent, node);
        }
        return node;
    }

function removeSelfClosingTags(xml) {
    var split = xml.split("/>");
    var newXml = "";
    for (var i = 0; i < split.length - 1;i++) {
        var edsplit = split[i].split("<");
        newXml += split[i] + "></" + edsplit[edsplit.length - 1].split(" ")[0] + ">";
    }
    return newXml + split[split.length-1];
}

    /*   
     * Create a DocumentFragment from the HTML fragment.
     * @param {String} html
     */
    function createFragment(html) {
        // A special case optimization for a single tag
        html = langx.trim(html);
        if (singleTagRE.test(html)) {
            return [createElement(RegExp.$1)];
        }

        var name = fragmentRE.test(html) && RegExp.$1
        if (!(name in containers)) {
            name = "*"
        }
        var container = containers[name];
        container.innerHTML = removeSelfClosingTags("" + html);
        dom = slice.call(container.childNodes);

        dom.forEach(function(node) {
            container.removeChild(node);
        })

        return dom;
    }

    /*   
     * Create a deep copy of the set of matched elements.
     * @param {HTMLElement} node
     * @param {Boolean} deep
     */
    function clone(node, deep) {
        var self = this,
            clone;

        // TODO: Add feature detection here in the future
        if (!isIE || node.nodeType !== 1 || deep) {
            return node.cloneNode(deep);
        }

        // Make a HTML5 safe shallow copy
        if (!deep) {
            clone = document.createElement(node.nodeName);

            // Copy attribs
            each(self.getAttribs(node), function(attr) {
                self.setAttrib(clone, attr.nodeName, self.getAttrib(node, attr.nodeName));
            });

            return clone;
        }
    }

    /*   
     * Check to see if a dom node is a descendant of another dom node .
     * @param {String} node
     * @param {Node} child
     */
    function contains(node, child) {
        return isChildOf(child, node);
    }

    /*   
     * Create a new Text node.
     * @param {String} text
     * @param {Node} child
     */
    function createTextNode(text) {
        return document.createTextNode(text);
    }

    /*   
     * Get the current document object.
     */
    function doc() {
        return document;
    }

    /*   
     * Remove all child nodes of the set of matched elements from the DOM.
     * @param {Object} node
     */
    function empty(node) {
        while (node.hasChildNodes()) {
            var child = node.firstChild;
            node.removeChild(child);
        }
        return this;
    }

    var fulledEl = null;

    function fullScreen(el) {
        if (el === false) {
            browser.exitFullScreen.apply(document);
        } else if (el) {
            browser.requestFullScreen.apply(el);
            fulledEl = el;
        } else {
            return (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            )
        }
    }


    // Selectors
    function focusable( element, hasTabindex ) {
        var map, mapName, img, focusableIfVisible, fieldset,
            nodeName = element.nodeName.toLowerCase();

        if ( "area" === nodeName ) {
            map = element.parentNode;
            mapName = map.name;
            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            img = $( "img[usemap='#" + mapName + "']" );
            return img.length > 0 && img.is( ":visible" );
        }

        if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
            focusableIfVisible = !element.disabled;

            if ( focusableIfVisible ) {

                // Form controls within a disabled fieldset are disabled.
                // However, controls within the fieldset's legend do not get disabled.
                // Since controls generally aren't placed inside legends, we skip
                // this portion of the check.
                fieldset = $( element ).closest( "fieldset" )[ 0 ];
                if ( fieldset ) {
                    focusableIfVisible = !fieldset.disabled;
                }
            }
        } else if ( "a" === nodeName ) {
            focusableIfVisible = element.href || hasTabindex;
        } else {
            focusableIfVisible = hasTabindex;
        }

        return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
    };


   var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;
 
    /*   
     * Get the HTML contents of the first element in the set of matched elements.
     * @param {HTMLElement} node
     * @param {String} html
     */
    function html(node, html) {
        if (html === undefined) {
            return node.innerHTML;
        } else {
            this.empty(node);
            html = html || "";
            if (langx.isString(html)) {
                html = html.replace( rxhtmlTag, "<$1></$2>" );
            }
            if (langx.isString(html) || langx.isNumber(html)) {               
                node.innerHTML = html;
            } else if (langx.isArrayLike(html)) {
                for (var i = 0; i < html.length; i++) {
                    node.appendChild(html[i]);
                }
            } else {
                node.appendChild(html);
            }

            return this;
        }
    }


    /*   
     * Check to see if a dom node is a descendant of another dom node.
     * @param {Node} node
     * @param {Node} parent
     * @param {Node} directly
     */
    function isChildOf(node, parent, directly) {
        if (directly) {
            return node.parentNode === parent;
        }
        if (document.documentElement.contains) {
            return parent.contains(node);
        }
        while (node) {
            if (parent === node) {
                return true;
            }

            node = node.parentNode;
        }

        return false;
    }

    /*   
     * Check to see if a dom node is a document.
     * @param {Node} node
     */
    function isDocument(node) {
        return node != null && node.nodeType == node.DOCUMENT_NODE
    }

    /*   
     * Check to see if a dom node is in the document
     * @param {Node} node
     */
    function isInDocument(node) {
      return (node === document.body) ? true : document.body.contains(node);
    }        

    var blockNodes = ["div", "p", "ul", "ol", "li", "blockquote", "hr", "pre", "h1", "h2", "h3", "h4", "h5", "table"];

    function isBlockNode(node) {
        if (!node || node.nodeType === 3) {
          return false;
        }
        return new RegExp("^(" + (blockNodes.join('|')) + ")$").test(node.nodeName.toLowerCase());
    }

    function isActive (elem) {
            return elem === document.activeElement && (elem.type || elem.href);
    }

    /*   
     * Get the owner document object for the specified element.
     * @param {Node} elm
     */
    function ownerDoc(elm) {
        if (!elm) {
            return document;
        }

        if (elm.nodeType == 9) {
            return elm;
        }

        return elm.ownerDocument;
    }

    /*   
     *
     * @param {Node} elm
     */
    function ownerWindow(elm) {
        var doc = ownerDoc(elm);
        return doc.defaultView || doc.parentWindow;
    }

    /*   
     * insert one or more nodes as the first children of the specified node.
     * @param {Node} node
     * @param {Node or ArrayLike} placing
     * @param {Boolean Optional} copyByClone
     */
    function prepend(node, placing, copyByClone) {
        var parentNode = node,
            refNode = parentNode.firstChild,
            nodes = ensureNodes(placing, copyByClone);
        for (var i = 0; i < nodes.length; i++) {
            if (refNode) {
                parentNode.insertBefore(nodes[i], refNode);
            } else {
                parentNode.appendChild(nodes[i]);
            }
        }
        return this;
    }

    /*   
     *
     * @param {Node} elm
     */
    function offsetParent(elm) {
        var parent = elm.offsetParent || document.body;
        while (parent && !rootNodeRE.test(parent.nodeName) && document.defaultView.getComputedStyle(parent).position == "static") {
            parent = parent.offsetParent;
        }
        return parent;
    }

    /*   
     * Remove the set of matched elements from the DOM.
     * @param {Node} node
     */
    function remove(node) {
        if (node && node.parentNode) {
            try {
                node.parentNode.removeChild(node);
            } catch (e) {
                console.warn("The node is already removed", e);
            }
        }
        return this;
    }

    function removeChild(node,children) {
        if (!langx.isArrayLike(children)) {
            children = [children];
        }
        for (var i=0;i<children.length;i++) {
            node.removeChild(children[i]);
        }

        return this;
    }

    function scrollParent( elm, includeHidden ) {
        var position = document.defaultView.getComputedStyle(elm).position,
            excludeStaticParent = position === "absolute",
            overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
            scrollParent = this.parents().filter( function() {
                var parent = $( this );
                if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
                    return false;
                }
                return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
                    parent.css( "overflow-x" ) );
            } ).eq( 0 );

        return position === "fixed" || !scrollParent.length ?
            $( this[ 0 ].ownerDocument || document ) :
            scrollParent;
    };


    function reflow(elm) {
        if (el == null) {
          elm = document;
        }
        elm.offsetHeight;

        return this;      
    }

    /*   
     * Replace an old node with the specified node.
     * @param {Node} node
     * @param {Node} oldNode
     */
    function replace(node, oldNode) {
        oldNode.parentNode.replaceChild(node, oldNode);
        return this;
    }


    function selectable(elem, selectable) {
        if (elem === undefined || elem.style === undefined)
            return;
        elem.onselectstart = selectable ? function () {
            return false;
        } : function () {
        };
        elem.style.MozUserSelect = selectable ? 'auto' : 'none';
        elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
        elem.unselectable = selectable ? 'on' : 'off';
    }

    /*   
     * traverse the specified node and its descendants, perform the callback function on each
     * @param {Node} node
     * @param {Function} fn
     */
    function traverse(node, fn) {
        fn(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            traverse(node.childNodes[i], fn);
        }
        return this;
    }

    /*   
     *
     * @param {Node} node
     */
    function reverse(node) {
        var firstChild = node.firstChild;
        for (var i = node.children.length - 1; i > 0; i--) {
            if (i > 0) {
                var child = node.children[i];
                node.insertBefore(child, firstChild);
            }
        }
    }

    /*   
     * Wrap an HTML structure around each element in the set of matched elements.
     * @param {Node} node
     * @param {Node} wrapperNode
     */
    function wrapper(node, wrapperNode) {
        if (langx.isString(wrapperNode)) {
            wrapperNode = this.createFragment(wrapperNode).firstChild;
        }
        node.parentNode.insertBefore(wrapperNode, node);
        wrapperNode.appendChild(node);
    }

    /*   
     * Wrap an HTML structure around the content of each element in the set of matched
     * @param {Node} node
     * @param {Node} wrapperNode
     */
    function wrapperInner(node, wrapperNode) {
        var childNodes = slice.call(node.childNodes);
        node.appendChild(wrapperNode);
        for (var i = 0; i < childNodes.length; i++) {
            wrapperNode.appendChild(childNodes[i]);
        }
        return this;
    }

    /*   
     * Remove the parents of the set of matched elements from the DOM, leaving the matched
     * @param {Node} node
     */
    function unwrap(node) {
        var child, parent = node.parentNode;
        if (parent) {
            if (this.isDoc(parent.parentNode)) return;
            parent.parentNode.insertBefore(node, parent);
        }
    }

    function noder() {
        return noder;
    }

    langx.mixin(noder, {
        active  : activeElement,

        after: after,

        append: append,

        before: before,

        blur : function(el) {
            el.blur();
        },

        body: function() {
            return document.body;
        },

        clone: clone,

        contains: contains,

        contents: contents,

        createElement: createElement,

        createFragment: createFragment,

     
        createTextNode: createTextNode,

        doc: doc,

        empty: empty,

        fullScreen: fullScreen,

        focusable: focusable,

        html: html,

        isActive,

        isChildOf: isChildOf,

        isDocument: isDocument,

        isInDocument: isInDocument,

        isWindow: langx.isWindow,

        nodeName : nodeName,

        offsetParent: offsetParent,

        ownerDoc: ownerDoc,

        ownerWindow: ownerWindow,

        prepend: prepend,

        reflow: reflow,

        remove: remove,

        removeChild : removeChild,

        replace: replace,

        selectable,

        traverse: traverse,

        reverse: reverse,

        wrapper: wrapper,

        wrapperInner: wrapperInner,

        unwrap: unwrap
    });

    return skylark.attach("domx.noder" , noder);
});
define('skylark-domx-noder/main',[
	"./noder"
],function(noder){
	return noder;
});
define('skylark-domx-noder', ['skylark-domx-noder/main'], function (main) { return main; });

define('skylark-domx-finder/finder',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder"
], function(skylark, langx, browser, noder) {
    var local = {},
        filter = Array.prototype.filter,
        slice = Array.prototype.slice,
        nativeMatchesSelector = browser.matchesSelector;

    /*
    ---
    name: Slick.Parser
    description: Standalone CSS3 Selector parser
    provides: Slick.Parser
    ...
    */
    ;
    (function() {

        var parsed,
            separatorIndex,
            combinatorIndex,
            reversed,
            cache = {},
            reverseCache = {},
            reUnescape = /\\/g;

        var parse = function(expression, isReversed) {
            if (expression == null) return null;
            if (expression.Slick === true) return expression;
            expression = ('' + expression).replace(/^\s+|\s+$/g, '');
            reversed = !!isReversed;
            var currentCache = (reversed) ? reverseCache : cache;
            if (currentCache[expression]) return currentCache[expression];
            parsed = {
                Slick: true,
                expressions: [],
                raw: expression,
                reverse: function() {
                    return parse(this.raw, true);
                }
            };
            separatorIndex = -1;
            while (expression != (expression = expression.replace(regexp, parser)));
            parsed.length = parsed.expressions.length;
            return currentCache[parsed.raw] = (reversed) ? reverse(parsed) : parsed;
        };

        var reverseCombinator = function(combinator) {
            if (combinator === '!') return ' ';
            else if (combinator === ' ') return '!';
            else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
            else return '!' + combinator;
        };

        var reverse = function(expression) {
            var expressions = expression.expressions;
            for (var i = 0; i < expressions.length; i++) {
                var exp = expressions[i];
                var last = {
                    parts: [],
                    tag: '*',
                    combinator: reverseCombinator(exp[0].combinator)
                };

                for (var j = 0; j < exp.length; j++) {
                    var cexp = exp[j];
                    if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
                    cexp.combinator = cexp.reverseCombinator;
                    delete cexp.reverseCombinator;
                }

                exp.reverse().push(last);
            }
            return expression;
        };

        var escapeRegExp = (function() {
            // Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
            var from = /(?=[\-\[\]{}()*+?.\\\^$|,#\s])/g,
                to = '\\';
            return function(string) {
                return string.replace(from, to)
            }
        }())

        var regexp = new RegExp(
            "^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|(:+)(<unicode>+)(?:\\((?:(?:([\"'])([^\\13]*)\\13)|((?:\\([^)]+\\)|[^()]*)+))\\))?)"
            .replace(/<combinator>/, '[' + escapeRegExp(">+~`!@$%^&={}\\;</") + ']')
            .replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
            .replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
        );

        function parser(
            rawMatch,

            separator,
            combinator,
            combinatorChildren,

            tagName,
            id,
            className,

            attributeKey,
            attributeOperator,
            attributeQuote,
            attributeValue,

            pseudoMarker,
            pseudoClass,
            pseudoQuote,
            pseudoClassQuotedValue,
            pseudoClassValue
        ) {
            if (separator || separatorIndex === -1) {
                parsed.expressions[++separatorIndex] = [];
                combinatorIndex = -1;
                if (separator) return '';
            }

            if (combinator || combinatorChildren || combinatorIndex === -1) {
                combinator = combinator || ' ';
                var currentSeparator = parsed.expressions[separatorIndex];
                if (reversed && currentSeparator[combinatorIndex])
                    currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
                currentSeparator[++combinatorIndex] = {
                    combinator: combinator,
                    tag: '*'
                };
            }

            var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

            if (tagName) {
                currentParsed.tag = tagName.replace(reUnescape, '');

            } else if (id) {
                currentParsed.id = id.replace(reUnescape, '');

            } else if (className) {
                className = className.replace(reUnescape, '');

                if (!currentParsed.classList) currentParsed.classList = [];
                if (!currentParsed.classes) currentParsed.classes = [];
                currentParsed.classList.push(className);
                currentParsed.classes.push({
                    value: className,
                    regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
                });

            } else if (pseudoClass) {
                pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
                pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;

                if (!currentParsed.pseudos) currentParsed.pseudos = [];
                currentParsed.pseudos.push({
                    key: pseudoClass.replace(reUnescape, ''),
                    value: pseudoClassValue,
                    type: pseudoMarker.length == 1 ? 'class' : 'element'
                });

            } else if (attributeKey) {
                attributeKey = attributeKey.replace(reUnescape, '');
                attributeValue = (attributeValue || '').replace(reUnescape, '');

                var test, regexp;

                switch (attributeOperator) {
                    case '^=':
                        regexp = new RegExp('^' + escapeRegExp(attributeValue));
                        break;
                    case '$=':
                        regexp = new RegExp(escapeRegExp(attributeValue) + '$');
                        break;
                    case '~=':
                        regexp = new RegExp('(^|\\s)' + escapeRegExp(attributeValue) + '(\\s|$)');
                        break;
                    case '|=':
                        regexp = new RegExp('^' + escapeRegExp(attributeValue) + '(-|$)');
                        break;
                    case '=':
                        test = function(value) {
                            return attributeValue == value;
                        };
                        break;
                    case '*=':
                        test = function(value) {
                            return value && value.indexOf(attributeValue) > -1;
                        };
                        break;
                    case '!=':
                        test = function(value) {
                            return attributeValue != value;
                        };
                        break;
                    default:
                        test = function(value) {
                            return !!value;
                        };
                }

                if (attributeValue == '' && (/^[*$^]=$/).test(attributeOperator)) test = function() {
                    return false;
                };

                if (!test) test = function(value) {
                    return value && regexp.test(value);
                };

                if (!currentParsed.attributes) currentParsed.attributes = [];
                currentParsed.attributes.push({
                    key: attributeKey,
                    operator: attributeOperator,
                    value: attributeValue,
                    test: test
                });

            }

            return '';
        };

        // Slick NS

        var Slick = (this.Slick || {});

        Slick.parse = function(expression) {
            return parse(expression);
        };

        Slick.escapeRegExp = escapeRegExp;

        if (!this.Slick) this.Slick = Slick;

    }).apply(local);


    var simpleClassSelectorRE = /^\.([\w-]*)$/,
        simpleIdSelectorRE = /^#([\w-]*)$/,
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,
        slice = Array.prototype.slice;


    local.parseSelector = local.Slick.parse;


    var pseudos = local.pseudos = {
        // custom pseudos
        "button": function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === "button" || name === "button";
        },

        'checked': function(elm) {
            return !!elm.checked;
        },

        'contains': function(elm, idx, nodes, text) {
            if ($(this).text().indexOf(text) > -1) return this
        },

        'disabled': function(elm) {
            return !!elm.disabled;
        },

        'enabled': function(elm) {
            return !elm.disabled;
        },

        'eq': function(elm, idx, nodes, value) {
            return (idx == value);
        },

        'even': function(elm, idx, nodes, value) {
            return (idx % 2) === 0;
        },

        'focus': function(elm) {
            return document.activeElement === elm && (elm.href || elm.type || elm.tabindex);
        },

        'focusable': function( elm ) {
            return noder.focusable(elm, elm.tabindex != null );
        },

        'first': function(elm, idx) {
            return (idx === 0);
        },

        'gt': function(elm, idx, nodes, value) {
            return (idx > value);
        },

        'has': function(elm, idx, nodes, sel) {
            return find(elm, sel);
        },

        // Element/input types
        "header": function(elem) {
            return rheader.test(elem.nodeName);
        },

        'hidden': function(elm) {
            return !local.pseudos["visible"](elm);
        },

        "input": function(elem) {
            return rinputs.test(elem.nodeName);
        },

        'last': function(elm, idx, nodes) {
            return (idx === nodes.length - 1);
        },

        'lt': function(elm, idx, nodes, value) {
            return (idx < value);
        },

        'not': function(elm, idx, nodes, sel) {
            return !matches(elm, sel);
        },

        'odd': function(elm, idx, nodes, value) {
            return (idx % 2) === 1;
        },

        /*   
         * Get the parent of each element in the current set of matched elements.
         * @param {Object} elm
         */
        'parent': function(elm) {
            return !!elm.parentNode;
        },

        'selected': function(elm) {
            return !!elm.selected;
        },

        'tabbable': function(elm) {
            var tabIndex = elm.tabindex,
                hasTabindex = tabIndex != null;
            return ( !hasTabindex || tabIndex >= 0 ) && noder.focusable( element, hasTabindex );
        },

        'text': function(elm) {
            return elm.type === "text";
        },

        'visible': function(elm) {
            return elm.offsetWidth && elm.offsetWidth
        },
        'empty': function(elm) {
            return !elm.hasChildNodes();
        }
    };

    ["first", "eq", "last"].forEach(function(item) {
        pseudos[item].isArrayFilter = true;
    });



    pseudos["nth"] = pseudos["eq"];

    function createInputPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === type;
        };
    }

    function createButtonPseudo(type) {
        return function(elem) {
            var name = elem.nodeName.toLowerCase();
            return (name === "input" || name === "button") && elem.type === type;
        };
    }

    // Add button/input type pseudos
    for (i in {
        radio: true,
        checkbox: true,
        file: true,
        password: true,
        image: true
    }) {
        pseudos[i] = createInputPseudo(i);
    }
    for (i in {
        submit: true,
        reset: true
    }) {
        pseudos[i] = createButtonPseudo(i);
    }


    local.divide = function(cond) {
        var nativeSelector = "",
            customPseudos = [],
            tag,
            id,
            classes,
            attributes,
            pseudos;


        if (id = cond.id) {
            nativeSelector += ("#" + id);
        }
        if (classes = cond.classes) {
            for (var i = classes.length; i--;) {
                nativeSelector += ("." + classes[i].value);
            }
        }
        if (attributes = cond.attributes) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].operator) {
                    nativeSelector += ("[" + attributes[i].key + attributes[i].operator + JSON.stringify(attributes[i].value) + "]");
                } else {
                    nativeSelector += ("[" + attributes[i].key + "]");
                }
            }
        }
        if (pseudos = cond.pseudos) {
            for (i = pseudos.length; i--;) {
                part = pseudos[i];
                if (this.pseudos[part.key]) {
                    customPseudos.push(part);
                } else {
                    if (part.value !== undefined) {
                        nativeSelector += (":" + part.key + "(" + JSON.stringify(part))
                    }
                }
            }
        }

        if (tag = cond.tag) {
            if (tag !== "*") {
                nativeSelector = tag.toUpperCase() + nativeSelector;
            }
        }

        if (!nativeSelector) {
            nativeSelector = "*";
        }

        return {
            nativeSelector: nativeSelector,
            customPseudos: customPseudos
        }

    };

    local.check = function(node, cond, idx, nodes, arrayFilte) {
        var tag,
            id,
            classes,
            attributes,
            pseudos,

            i, part, cls, pseudo;

        if (!arrayFilte) {
            if (tag = cond.tag) {
                var nodeName = node.nodeName.toUpperCase();
                if (tag == '*') {
                    if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
                } else {
                    if (nodeName != (tag || "").toUpperCase()) return false;
                }
            }

            if (id = cond.id) {
                if (node.getAttribute('id') != id) {
                    return false;
                }
            }


            if (classes = cond.classes) {
                for (i = classes.length; i--;) {
                    cls = node.getAttribute('class');
                    if (!(cls && classes[i].regexp.test(cls))) return false;
                }
            }

            if (attributes = cond.attributes) {
                for (i = attributes.length; i--;) {
                    part = attributes[i];
                    if (part.operator ? !part.test(node.getAttribute(part.key)) : !node.hasAttribute(part.key)) return false;
                }
            }

        }
        if (pseudos = cond.pseudos) {
            for (i = pseudos.length; i--;) {
                part = pseudos[i];
                if (pseudo = this.pseudos[part.key]) {
                    if ((arrayFilte && pseudo.isArrayFilter) || (!arrayFilte && !pseudo.isArrayFilter)) {
                        if (!pseudo(node, idx, nodes, part.value)) {
                            return false;
                        }
                    }
                } else {
                    if (!arrayFilte && !nativeMatchesSelector.call(node, part.key)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    local.match = function(node, selector) {

        var parsed;

        if (langx.isString(selector)) {
            parsed = local.Slick.parse(selector);
        } else {
            parsed = selector;
        }

        if (!parsed) {
            return true;
        }

        // simple (single) selectors
        var expressions = parsed.expressions,
            simpleExpCounter = 0,
            i,
            currentExpression;
        for (i = 0;
            (currentExpression = expressions[i]); i++) {
            if (currentExpression.length == 1) {
                var exp = currentExpression[0];
                if (this.check(node, exp)) {
                    return true;
                }
                simpleExpCounter++;
            }
        }

        if (simpleExpCounter == parsed.length) {
            return false;
        }

        var nodes = this.query(document, parsed),
            item;
        for (i = 0; item = nodes[i++];) {
            if (item === node) {
                return true;
            }
        }
        return false;
    };


    local.filterSingle = function(nodes, exp) {
        var matchs = filter.call(nodes, function(node, idx) {
            return local.check(node, exp, idx, nodes, false);
        });

        matchs = filter.call(matchs, function(node, idx) {
            return local.check(node, exp, idx, matchs, true);
        });
        return matchs;
    };

    local.filter = function(nodes, selector) {
        var parsed;

        if (langx.isString(selector)) {
            parsed = local.Slick.parse(selector);
        } else {
            return local.filterSingle(nodes, selector);
        }

        // simple (single) selectors
        var expressions = parsed.expressions,
            i,
            currentExpression,
            ret = [];
        for (i = 0;
            (currentExpression = expressions[i]); i++) {
            if (currentExpression.length == 1) {
                var exp = currentExpression[0];

                var matchs = local.filterSingle(nodes, exp);

                ret = langx.uniq(ret.concat(matchs));
            } else {
                throw new Error("not supported selector:" + selector);
            }
        }

        return ret;

    };

    local.combine = function(elm, bit) {
        var op = bit.combinator,
            cond = bit,
            node1,
            nodes = [];

        switch (op) {
            case '>': // direct children
                nodes = children(elm, cond);
                break;
            case '+': // next sibling
                node1 = nextSibling(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '^': // first child
                node1 = firstChild(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '~': // next siblings
                nodes = nextSiblings(elm, cond);
                break;
            case '++': // next sibling and previous sibling
                var prev = previousSibling(elm, cond, true),
                    next = nextSibling(elm, cond, true);
                if (prev) {
                    nodes.push(prev);
                }
                if (next) {
                    nodes.push(next);
                }
                break;
            case '~~': // next siblings and previous siblings
                nodes = siblings(elm, cond);
                break;
            case '!': // all parent nodes up to document
                nodes = ancestors(elm, cond);
                break;
            case '!>': // direct parent (one level)
                node1 = parent(elm, cond);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '!+': // previous sibling
                nodes = previousSibling(elm, cond, true);
                break;
            case '!^': // last child
                node1 = lastChild(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '!~': // previous siblings
                nodes = previousSiblings(elm, cond);
                break;
            default:
                var divided = this.divide(bit);
                nodes = slice.call(elm.querySelectorAll(divided.nativeSelector));
                if (divided.customPseudos) {
                    for (var i = divided.customPseudos.length - 1; i >= 0; i--) {
                        nodes = filter.call(nodes, function(item, idx) {
                            return local.check(item, {
                                pseudos: [divided.customPseudos[i]]
                            }, idx, nodes, false)
                        });

                        nodes = filter.call(nodes, function(item, idx) {
                            return local.check(item, {
                                pseudos: [divided.customPseudos[i]]
                            }, idx, nodes, true)
                        });
                    }
                }
                break;

        }
        return nodes;
    }

    local.query = function(node, selector, single) {


        var parsed = this.Slick.parse(selector);

        var
            founds = [],
            currentExpression, currentBit,
            expressions = parsed.expressions;

        for (var i = 0;
            (currentExpression = expressions[i]); i++) {
            var currentItems = [node],
                found;
            for (var j = 0;
                (currentBit = currentExpression[j]); j++) {
                found = langx.map(currentItems, function(item, i) {
                    return local.combine(item, currentBit)
                });
                if (found) {
                    currentItems = found;
                }
            }
            if (found) {
                founds = founds.concat(found);
            }
        }

        return founds;
    }

    /*
     * Get the nearest ancestor of the specified element,optional matched by a selector.
     * @param {HTMLElement} node
     * @param {String Optional } selector
     * @param {Object} root
     */
    function ancestor(node, selector, root) {
        var rootIsSelector = root && langx.isString(root);
        while (node = node.parentNode) {
            if (matches(node, selector)) {
                return node;
            }
            if (root) {
                if (rootIsSelector) {
                    if (matches(node, root)) {
                        break;
                    }
                } else if (node == root) {
                    break;
                }
            }
        }
        return null;
    }

    /*
     * Get the ancestors of the specitied element , optionally filtered by a selector.
     * @param {HTMLElement} node
     * @param {String Optional } selector
     * @param {Object} root
     */
    function ancestors(node, selector, root) {
        var ret = [],
            rootIsSelector = root && langx.isString(root);
        while ((node = node.parentNode) && (node.nodeType !== 9)) {
            if (root) {
                if (rootIsSelector) {
                    if (matches(node, root)) {
                        break;
                    }
                } else if (langx.isArrayLike(root)) {
                    if (langx.inArray(node,root)>-1) {
                        break;
                    }
                } else if (node == root) {
                    break;
                }
            }
            if (!selector || matches(node, selector)) {
              ret.push(node); 
            }
        }

        //if (selector) {
        //    ret = local.filter(ret, selector);
        //}
        return ret;
    }


    /*
     * Returns a element by its ID.
     * @param {string} id
     */
    function byId(id, doc) {
        doc = doc || noder.doc();
        return doc.getElementById(id);
    }

    /*
     * Get the children of the specified element , optionally filtered by a selector.
     * @param {string} node
     * @param {String optionlly} selector
     */
    function children(node, selector) {
        var childNodes = node.childNodes,
            ret = [];
        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if (node.nodeType == 1) {
                ret.push(node);
            }
        }
        if (selector) {
            ret = local.filter(ret, selector);
        }
        return ret;
    }

    function closest(node, selector) {
        while (node && !(matches(node, selector))) {
            node = node.parentNode;
        }

        return node;
    }

    /*
     * Get the decendant of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function descendants(elm, selector) {
        // Selector
        try {
            return slice.call(elm.querySelectorAll(selector));
        } catch (matchError) {
            //console.log(matchError);
        }
        return local.query(elm, selector);
    }

    /*
     * Get the nearest decendent of the specified element,optional matched by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function descendant(elm, selector) {
        // Selector
        try {
            return elm.querySelector(selector);
        } catch (matchError) {
            //console.log(matchError);
        }
        var nodes = local.query(elm, selector);
        if (nodes.length > 0) {
            return nodes[0];
        } else {
            return null;
        }
    }

    /*
     * Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function find(elm, selector) {
        if (!selector) {
            selector = elm;
            elm = document.body;
        }
        if (matches(elm, selector)) {
            return elm;
        } else {
            return descendant(elm, selector);
        }
    }

    /*
     * Get the findAll of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function findAll(elm, selector) {
        if (!selector) {
            selector = elm;
            elm = document.body;
        }
        return descendants(elm, selector);
    }

    /*
     * Get the first child of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {String} first
     */
    function firstChild(elm, selector, first) {
        var childNodes = elm.childNodes,
            node = childNodes[0];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (first) {
                    break;
                }
            }
            node = node.nextSibling;
        }

        return null;
    }

    /*
     * Get the last child of the specified element , optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {String } last
     */
    function lastChild(elm, selector, last) {
        var childNodes = elm.childNodes,
            node = childNodes[childNodes.length - 1];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (last) {
                    break;
                }
            }
            node = node.previousSibling;
        }

        return null;
    }

    /*
     * Check the specified element against a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function matches(elm, selector) {
        if (!selector || !elm || elm.nodeType !== 1) {
            return false
        }

        if (langx.isString(selector)) {
            try {
                return nativeMatchesSelector.call(elm, selector.replace(/\[([^=]+)=\s*([^'"\]]+?)\s*\]/g, '[$1="$2"]'));
            } catch (matchError) {
                //console.log(matchError);
            }
            return local.match(elm, selector);
        } else if (langx.isArrayLike(selector)) {
            return langx.inArray(elm, selector) > -1;
        } else if (langx.isPlainObject(selector)) {
            return local.check(elm, selector);
        } else {
            return elm === selector;
        }

    }

    /*
     * Get the nearest next sibing of the specitied element , optional matched by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {Boolean Optional} adjacent
     */
    function nextSibling(elm, selector, adjacent) {
        var node = elm.nextSibling;
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (adjacent) {
                    break;
                }
            }
            node = node.nextSibling;
        }
        return null;
    }

    /*
     * Get the next siblings of the specified element , optional filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function nextSiblings(elm, selector) {
        var node = elm.nextSibling,
            ret = [];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.nextSibling;
        }
        return ret;
    }

    /*
     * Get the parent element of the specified element. if a selector is provided, it retrieves the parent element only if it matches that selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function parent(elm, selector) {
        var node = elm.parentNode;
        if (node && (!selector || matches(node, selector))) {
            return node;
        }

        return null;
    }

    /*
     * Get hte nearest previous sibling of the specified element ,optional matched by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     * @param {Boolean Optional } adjacent
     */
    function previousSibling(elm, selector, adjacent) {
        var node = elm.previousSibling;
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (adjacent) {
                    break;
                }
            }
            node = node.previousSibling;
        }
        return null;
    }

    /*
     * Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function previousSiblings(elm, selector) {
        var node = elm.previousSibling,
            ret = [];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.previousSibling;
        }
        return ret;
    }

    /*
     * Selects all sibling elements that follow after the “prev” element, have the same parent, and match the filtering “siblings” selector.
     * @param {HTMLElement} elm
     * @param {String optionlly} selector
     */
    function siblings(elm, selector) {
        var node = elm.parentNode.firstChild,
            ret = [];
        while (node) {
            if (node.nodeType == 1 && node !== elm) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.nextSibling;
        }
        return ret;
    }

    var finder = function() {
        return finder;
    };

    langx.mixin(finder, {

        ancestor: ancestor,

        ancestors: ancestors,

        byId: byId,

        children: children,

        closest: closest,

        descendant: descendant,

        descendants: descendants,

        find: find,

        findAll: findAll,

        firstChild: firstChild,

        lastChild: lastChild,

        matches: matches,

        nextSibling: nextSibling,

        nextSiblings: nextSiblings,

        parent: parent,

        previousSibling,

        previousSiblings,

        pseudos: local.pseudos,

        siblings: siblings
    });

    return skylark.attach("domx.finder", finder);
});
define('skylark-domx-finder/main',[
	"./finder"
],function(finder){

	return finder;
});
define('skylark-domx-finder', ['skylark-domx-finder/main'], function (main) { return main; });

define('skylark-domx-data/data',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-finder",
    "skylark-domx-noder"
], function(skylark, langx, finder,noder) {
    var map = Array.prototype.map,
        filter = Array.prototype.filter,
        camelCase = langx.camelCase,
        deserializeValue = langx.deserializeValue,

        capitalRE = /([A-Z])/g,
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        };

    // Strip and collapse whitespace according to HTML spec
    function stripAndCollapse( value ) {
      var tokens = value.match( /[^\x20\t\r\n\f]+/g ) || [];
      return tokens.join( " " );
    }


    var valHooks = {
      option: {
        get: function( elem ) {
          var val = elem.getAttribute( "value" );
          return val != null ?  val :  stripAndCollapse(text( elem ) );
        }
      },
      select: {
        get: function( elem ) {
          var value, option, i,
            options = elem.options,
            index = elem.selectedIndex,
            one = elem.type === "select-one",
            values = one ? null : [],
            max = one ? index + 1 : options.length;

          if ( index < 0 ) {
            i = max;

          } else {
            i = one ? index : 0;
          }

          // Loop through all the selected options
          for ( ; i < max; i++ ) {
            option = options[ i ];

            if ( option.selected &&

                // Don't return options that are disabled or in a disabled optgroup
                !option.disabled &&
                ( !option.parentNode.disabled ||
                  !noder.nodeName( option.parentNode, "optgroup" ) ) ) {

              // Get the specific value for the option
              value = val(option);

              // We don't need an array for one selects
              if ( one ) {
                return value;
              }

              // Multi-Selects return an array
              values.push( value );
            }
          }

          return values;
        },

        set: function( elem, value ) {
          var optionSet, option,
            options = elem.options,
            values = langx.makeArray( value ),
            i = options.length;

          while ( i-- ) {
            option = options[ i ];

            /* eslint-disable no-cond-assign */

            if ( option.selected =
              langx.inArray( valHooks.option.get( option ), values ) > -1
            ) {
              optionSet = true;
            }

            /* eslint-enable no-cond-assign */
          }

          // Force browsers to behave consistently when non-matching value is set
          if ( !optionSet ) {
            elem.selectedIndex = -1;
          }
          return values;
        }
      }
    };


    // Radios and checkboxes getter/setter
    langx.each( [ "radio", "checkbox" ], function() {
      valHooks[ this ] = {
        set: function( elem, value ) {
          if ( langx.isArray( value ) ) {
            return ( elem.checked = langx.inArray( val(elem), value ) > -1 );
          }
        }
      };
    });



    /*
     * Set property values
     * @param {Object} elm  
     * @param {String} name
     * @param {String} value
     */

    function setAttribute(elm, name, value) {
        if (value == null) {
            elm.removeAttribute(name);
        } else {
            elm.setAttribute(name, value);
        }
    }

    function aria(elm, name, value) {
        return this.attr(elm, "aria-" + name, value);
    }

    /*
     * Set property values
     * @param {Object} elm  
     * @param {String} name
     * @param {String} value
     */

    function attr(elm, name, value) {
        if (value === undefined) {
            if (typeof name === "object") {
                for (var attrName in name) {
                    attr(elm, attrName, name[attrName]);
                }
                return this;
            } else {
                return elm.getAttribute ? elm.getAttribute(name) : elm[name];
            }
        } else {
            elm.setAttribute ? elm.setAttribute(name, value) : elm[name] = value;
            return this;
        }
    }


    /*
     *  Read all "data-*" attributes from a node
     * @param {Object} elm  
     */

    function _attributeData(elm) {
        var store = {}
        langx.each(elm.attributes || [], function(i, attr) {
            if (attr.name.indexOf('data-') == 0) {
                store[camelCase(attr.name.replace('data-', ''))] = deserializeValue(attr.value);
            }
        })
        return store;
    }

    function _store(elm, confirm) {
        var store = elm["_$_store"];
        if (!store && confirm) {
            store = elm["_$_store"] = _attributeData(elm);
        }
        return store;
    }

    function _getData(elm, name) {
        if (name === undefined) {
            return _store(elm, true);
        } else {
            var store = _store(elm);
            if (store) {
                if (name in store) {
                    return store[name];
                }
                var camelName = camelCase(name);
                if (camelName in store) {
                    return store[camelName];
                }
            }
            var attrName = 'data-' + name.replace(capitalRE, "-$1").toLowerCase()
            return attr(elm, attrName);
        }

    }

    function _setData(elm, name, value) {
        var store = _store(elm, true);
        store[camelCase(name)] = value;
    }


    /*
     * xxx
     * @param {Object} elm  
     * @param {String} name
     * @param {String} value
     */
    function data(elm, name, value) {

        if (value === undefined) {
            if (typeof name === "object") {
                for (var dataAttrName in name) {
                    _setData(elm, dataAttrName, name[dataAttrName]);
                }
                return this;
            } else {
                return _getData(elm, name);
            }
        } else {
            _setData(elm, name, value);
            return this;
        }
    } 
    /*
     * Remove from the element all items that have not yet been run. 
     * @param {Object} elm  
     */

    function cleanData(elm) {
        if (elm["_$_store"]) {
            delete elm["_$_store"];
        }
    }

    /*
     * Remove a previously-stored piece of data. 
     * @param {Object} elm  
     * @param {Array} names
     */
    function removeData(elm, names) {
        if (names) {
            if (langx.isString(names)) {
                names = names.split(/\s+/);
            }
            var store = _store(elm, true);
            names.forEach(function(name) {
                delete store[name];
            });            
        } else {
            cleanData(elm);
        }
        return this;
    }

    /*
     * xxx 
     * @param {Object} elm  
     * @param {Array} names
     */
    function pluck(nodes, property) {
        return map.call(nodes, function(elm) {
            return elm[property];
        });
    }

    /*
     * Get or set the value of an property for the specified element.
     * @param {Object} elm  
     * @param {String} name
     * @param {String} value
     */
    function prop(elm, name, value) {
        name = propMap[name] || name;
        if (value === undefined) {
            return elm[name];
        } else {
            elm[name] = value;
            return this;
        }
    }

    /*
     * remove Attributes  
     * @param {Object} elm  
     * @param {String} name
     */
    function removeAttr(elm, name) {
        name.split(' ').forEach(function(attr) {
            setAttribute(elm, attr);
        });
        return this;
    }


    /*
     * Remove the value of a property for the first element in the set of matched elements or set one or more properties for every matched element.
     * @param {Object} elm  
     * @param {String} name
     */
    function removeProp(elm, name) {
        name.split(' ').forEach(function(prop) {
            delete elm[prop];
        });
        return this;
    }

    /*   
     * Get the combined text contents of each element in the set of matched elements, including their descendants, or set the text contents of the matched elements.  
     * @param {Object} elm  
     * @param {String} txt
     */
    function text(elm, txt) {
        if (txt === undefined) {
            return elm.textContent;
        } else {
            elm.textContent = txt == null ? '' : '' + txt;
            return this;
        }
    }

    /*   
     * Get the current value of the first element in the set of matched elements or set the value of every matched element.
     * @param {Object} elm  
     * @param {String} value
     */
    function val(elm, value) {
        var hooks = valHooks[ elm.type ] || valHooks[ elm.nodeName.toLowerCase() ];
        if (value === undefined) {
/*
            if (elm.multiple) {
                // select multiple values
                var selectedOptions = filter.call(finder.find(elm, "option"), (function(option) {
                    return option.selected;
                }));
                return pluck(selectedOptions, "value");
            } else {
                if (/input|textarea/i.test(elm.tagName)) {
                  return elm.value;
                }
                return text(elm);
            }
*/

          if ( hooks &&  "get" in hooks &&  ( ret = hooks.get( elm, "value" ) ) !== undefined ) {
            return ret;
          }

          ret = elm.value;

          // Handle most common string cases
          if ( typeof ret === "string" ) {
            return ret.replace( /\r/g, "" );
          }

          // Handle cases where value is null/undef or number
          return ret == null ? "" : ret;

        } else {
/*          
            if (/input|textarea/i.test(elm.tagName)) {
              elm.value = value;
            } else {
              text(elm,value);
            }
            return this;
*/
          // Treat null/undefined as ""; convert numbers to string
          if ( value == null ) {
            value = "";

          } else if ( typeof value === "number" ) {
            value += "";

          } else if ( langx.isArray( value ) ) {
            value = langx.map( value, function( value1 ) {
              return value1 == null ? "" : value1 + "";
            } );
          }

          // If set returns undefined, fall back to normal setting
          if ( !hooks || !( "set" in hooks ) || hooks.set( elm, value, "value" ) === undefined ) {
            elm.value = value;
          }
        }      
    }


    finder.pseudos.data = function( elem, i, match,dataName ) {
        return !!data( elem, dataName || match[3]);
    };
   

    function datax() {
        return datax;
    }

    langx.mixin(datax, {
        aria: aria,

        attr: attr,

        cleanData: cleanData,

        data: data,

        pluck: pluck,

        prop: prop,

        removeAttr: removeAttr,

        removeData: removeData,

        removeProp: removeProp,

        text: text,

        val: val,

        valHooks : valHooks
    });

    return skylark.attach("domx.data", datax);
});
define('skylark-domx-query/query',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-finder"
], function(skylark, langx, noder, finder) {
    var some = Array.prototype.some,
        push = Array.prototype.push,
        every = Array.prototype.every,
        concat = Array.prototype.concat,
        slice = Array.prototype.slice,
        map = Array.prototype.map,
        filter = Array.prototype.filter,
        forEach = Array.prototype.forEach,
        indexOf = Array.prototype.indexOf,
        sort = Array.prototype.sort,
        isQ;

    var rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

    var funcArg = langx.funcArg,
        isArrayLike = langx.isArrayLike,
        isString = langx.isString,
        uniq = langx.uniq,
        isFunction = langx.isFunction;

    var type = langx.type,
        isArray = langx.isArray,

        isWindow = langx.isWindow,

        isDocument = langx.isDocument,

        isObject = langx.isObject,

        isPlainObject = langx.isPlainObject,

        compact = langx.compact,

        flatten = langx.flatten,

        camelCase = langx.camelCase,

        dasherize = langx.dasherize,
        children = finder.children;

    function wrapper_node_operation(func, context, oldValueFunc) {
        return function(html) {
            var argType, nodes = langx.map(arguments, function(arg) {
                argType = type(arg)
                return argType == "function" || argType == "object" || argType == "array" || arg == null ?
                    arg : noder.createFragment(arg)
            });
            if (nodes.length < 1) {
                return this
            }
            this.each(function(idx) {
                func.apply(context, [this, nodes, idx > 0]);
            });
            return this;
        }
    }

    function wrapper_map(func, context) {
        return function() {
            var self = this,
                params = slice.call(arguments);
            var result = langx.map(self, function(elem, idx) {
                return func.apply(context, [elem].concat(params));
            });
            return query(uniq(result));
        }
    }

    function wrapper_selector(func, context, last) {
        return function(selector) {
            var self = this,
                params = slice.call(arguments);
            var result = this.map(function(idx, elem) {
                // if (elem.nodeType == 1) {
                if (elem.querySelector) {
                    return func.apply(context, last ? [elem] : [elem, selector]);
                } else {
                    return [];
                }
            });
            if (last && selector) {
                return result.filter(selector);
            } else {
                return result;
            }
        }
    }

    function wrapper_selector_until(func, context, last) {
        return function(util, selector) {
            var self = this,
                params = slice.call(arguments);
            //if (selector === undefined) { //TODO : needs confirm?
            //    selector = util;
            //    util = undefined;
            //}
            var result = this.map(function(idx, elem) {
                // if (elem.nodeType == 1) { // TODO
                //if (elem.querySelector) {
                    return func.apply(context, last ? [elem, util] : [elem, selector, util]);
                //} else {
                //    return [];
                //}
            });
            if (last && selector) {
                return result.filter(selector);
            } else {
                return result;
            }
        }
    }


    function wrapper_every_act(func, context) {
        return function() {
            var self = this,
                params = slice.call(arguments);
            this.each(function(idx,node) {
                func.apply(context, [this].concat(params));
            });
            return self;
        }
    }

    function wrapper_every_act_firstArgFunc(func, context, oldValueFunc) {
        return function(arg1) {
            var self = this,
                params = slice.call(arguments);
            forEach.call(self, function(elem, idx) {
                var newArg1 = funcArg(elem, arg1, idx, oldValueFunc(elem));
                func.apply(context, [elem, newArg1].concat(params.slice(1)));
            });
            return self;
        }
    }

    function wrapper_some_chk(func, context) {
        return function() {
            var self = this,
                params = slice.call(arguments);
            return some.call(self, function(elem) {
                return func.apply(context, [elem].concat(params));
            });
        }
    }

    function wrapper_name_value(func, context, oldValueFunc) {
        return function(name, value) {
            var self = this;

            if (langx.isPlainObject(name) || langx.isDefined(value)) {
                forEach.call(self, function(elem, idx) {
                    var newValue;
                    if (oldValueFunc) {
                        newValue = funcArg(elem, value, idx, oldValueFunc(elem, name));
                    } else {
                        newValue = value
                    }
                    func.apply(context, [elem,name,newValue]);
                });
                return self;
            } else {
                if (self[0]) {
                    return func.apply(context, [self[0], name]);
                }
            }

        }
    }

    function wrapper_value(func, context, oldValueFunc) {
        return function(value) {
            var self = this;

            if (langx.isDefined(value)) {
                forEach.call(self, function(elem, idx) {
                    var newValue;
                    if (oldValueFunc) {
                        newValue = funcArg(elem, value, idx, oldValueFunc(elem));
                    } else {
                        newValue = value
                    }
                    func.apply(context, [elem, newValue]);
                });
                return self;
            } else {
                if (self[0]) {
                    return func.apply(context, [self[0]]);
                }
            }

        }
    }

    var NodeList = langx.klass({
        klassName: "SkNodeList",
        init: function(selector, context) {
            var self = this,
                match, nodes, node, props;

            if (selector) {
                self.context = context = context || noder.doc();

                if (isString(selector)) {
                    // a html string or a css selector is expected
                    self.selector = selector;

                    if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                        match = [null, selector, null];
                    } else {
                        match = rquickExpr.exec(selector);
                    }

                    if (match) {
                        if (match[1]) {
                            // if selector is html
                            nodes = noder.createFragment(selector);

                            if (langx.isPlainObject(context)) {
                                props = context;
                            }

                        } else {
                            node = finder.byId(match[2], noder.ownerDoc(context));

                            if (node) {
                                // if selector is id
                                nodes = [node];
                            }

                        }
                    } else {
                        // if selector is css selector
                        if (langx.isString(context)) {
                            context = finder.find(context);
                        }

                        nodes = finder.descendants(context, selector);
                    }
                } else {
                    if (selector !== window && isArrayLike(selector)) {
                        // a dom node array is expected
                        nodes = selector;
                    } else {
                        // a dom node is expected
                        nodes = [selector];
                    }
                    //self.add(selector, false);
                }
            }


            if (nodes) {

                push.apply(self, nodes);

                if (props) {
                    for ( var name  in props ) {
                        // Properties of context are called as methods if possible
                        if ( langx.isFunction( this[ name ] ) ) {
                            this[ name ]( props[ name ] );
                        } else {
                            this.attr( name, props[ name ] );
                        }
                    }
                }
            }

            return self;
        }
    });

    var query = (function() {
        isQ = function(object) {
            return object instanceof NodeList;
        }
        init = function(selector, context) {
            return new NodeList(selector, context);
        }

        var $ = function(selector, context) {
            if (isFunction(selector)) {
                $.ready(function() {
                    selector($);
                });
                return rootQuery;
            } else if (isQ(selector)) {
                return selector;
            } else {
                if (context && isQ(context) && isString(selector)) {
                    return context.find(selector);
                }
                return init(selector, context);
            }
        },rootQuery = $(document);

        $.fn = NodeList.prototype;
        langx.mixin($.fn, {
            // `map` and `slice` in the jQuery API work differently
            // from their array counterparts
            length : 0,

            map: function(fn) {
                return $(uniq(langx.map(this, function(el, i) {
                    return fn.call(el, i, el)
                })));
            },

            slice: function() {
                return $(slice.apply(this, arguments))
            },

            forEach: function() {
                return forEach.apply(this,arguments);
            },

            get: function(idx) {
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
            },

            indexOf: function() {
                return indexOf.apply(this,arguments);
            },

            sort : function() {
                return sort.apply(this,arguments);
            },

            toArray: function() {
                return slice.call(this);
            },

            size: function() {
                return this.length
            },

            //remove: wrapper_every_act(noder.remove, noder),
            remove : function(selector) {
                if (selector) {
                    return this.find(selector).remove();
                }
                this.each(function(i,node){
                    noder.remove(node);
                });
                return this;
            },

            each: function(callback) {
                langx.each(this, callback);
                return this;
            },

            filter: function(selector) {
                if (isFunction(selector)) return this.not(this.not(selector))
                return $(filter.call(this, function(element) {
                    return finder.matches(element, selector)
                }))
            },

            add: function(selector, context) {
                return $(uniq(this.toArray().concat($(selector, context).toArray())));
            },

            is: function(selector) {
                if (this.length > 0) {
                    var self = this;
                    if (langx.isString(selector)) {
                        return some.call(self,function(elem) {
                            return finder.matches(elem, selector);
                        });
                    } else if (langx.isArrayLike(selector)) {
                       return some.call(self,function(elem) {
                            return langx.inArray(elem, selector) > -1;
                        });
                    } else if (langx.isHtmlNode(selector)) {
                       return some.call(self,function(elem) {
                            return elem ==  selector;
                        });
                    }
                }
                return false;
            },
            
            not: function(selector) {
                var nodes = []
                if (isFunction(selector) && selector.call !== undefined)
                    this.each(function(idx,node) {
                        if (!selector.call(this, idx,node)) nodes.push(this)
                    })
                else {
                    var excludes = typeof selector == 'string' ? this.filter(selector) :
                        (isArrayLike(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                    this.forEach(function(el) {
                        if (excludes.indexOf(el) < 0) nodes.push(el)
                    })
                }
                return $(nodes)
            },

            has: function(selector) {
                return this.filter(function() {
                    return isObject(selector) ?
                        noder.contains(this, selector) :
                        $(this).find(selector).size()
                })
            },

            eq: function(idx) {
                return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
            },

            first: function() {
                return this.eq(0);
            },

            last: function() {
                return this.eq(-1);
            },

            find: wrapper_selector(finder.descendants, finder),

            closest: wrapper_selector(finder.closest, finder),
            /*
                        closest: function(selector, context) {
                            var node = this[0],
                                collection = false
                            if (typeof selector == 'object') collection = $(selector)
                            while (node && !(collection ? collection.indexOf(node) >= 0 : finder.matches(node, selector)))
                                node = node !== context && !isDocument(node) && node.parentNode
                            return $(node)
                        },
            */


            parents: wrapper_selector(finder.ancestors, finder),

            parentsUntil: wrapper_selector_until(finder.ancestors, finder),


            parent: wrapper_selector(finder.parent, finder),

            children: wrapper_selector(finder.children, finder),

            contents: wrapper_map(noder.contents, noder),

            empty: wrapper_every_act(noder.empty, noder),

            html: wrapper_value(noder.html, noder),

            // `pluck` is borrowed from Prototype.js
            pluck: function(property) {
                return langx.map(this, function(el) {
                    return el[property]
                })
            },

            pushStack : function(elms) {
                var ret = $(elms);
                ret.prevObject = this;
                return ret;
            },
            
            replaceWith: function(newContent) {
                return this.before(newContent).remove();
            },

            wrap: function(html) {
                /*
                var func = isFunction(structure)
                if (this[0] && !func)
                    var dom = $(structure).get(0),
                        clone = dom.parentNode || this.length > 1

                return this.each(function(index,node) {
                    $(this).wrapAll(
                        func ? structure.call(this, index,node) :
                        clone ? dom.cloneNode(true) : dom
                    )
                })
                */
                var htmlIsFunction = typeof html === "function";

                return this.each( function( i ) {
                    $( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
                } );                
            },

            wrapAll: function(html) {
                /*
                if (this[0]) {
                    $(this[0]).before(wrappingElement = $(wrappingElement));
                    var children;
                    // drill down to the inmost element
                    while ((children = wrappingElement.children()).length) {
                        wrappingElement = children.first();
                    }
                    $(wrappingElement).append(this);
                }
                return this
                */
                var wrap;

                if ( this[ 0 ] ) {
                    if ( typeof html === "function" ) {
                        html = html.call( this[ 0 ] );
                    }

                    // The elements to wrap the target around
                    wrap = $( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

                    if ( this[ 0 ].parentNode ) {
                        wrap.insertBefore( this[ 0 ] );
                    }

                    wrap.map( function() {
                        var elem = this;

                        while ( elem.firstElementChild ) {
                            elem = elem.firstElementChild;
                        }

                        return elem;
                    } ).append( this );
                }

                return this;

            },

            wrapInner: function(html) {
                /*
                var func = isFunction(wrappingElement)
                return this.each(function(index,node) {
                    var self = $(this),
                        contents = self.contents(),
                        dom = func ? wrappingElement.call(this, index,node) : wrappingElement
                    contents.length ? contents.wrapAll(dom) : self.append(dom)
                })
                */
                if ( typeof html === "function" ) {
                    return this.each( function( i ) {
                        $( this ).wrapInner( html.call( this, i ) );
                    } );
                }

                return this.each( function() {
                    var self = $( this ),
                        contents = self.contents();

                    if ( contents.length ) {
                        contents.wrapAll( html );

                    } else {
                        self.append( html );
                    }
                } );

            },

            unwrap: function(selector) {
                /*
                if (this.parent().children().length === 0) {
                    // remove dom without text
                    this.parent(selector).not("body").each(function() {
                        $(this).replaceWith(document.createTextNode(this.childNodes[0].textContent));
                    });
                } else {
                    this.parent().each(function() {
                        $(this).replaceWith($(this).children())
                    });
                }
                return this
                */
                this.parent(selector).not("body").each( function() {
                    $(this).replaceWith(this.childNodes);
                });
                return this;

            },

            clone: function() {
                return this.map(function() {
                    return this.cloneNode(true)
                })
            },


            toggle: function(setting) {
                return this.each(function() {
                    var el = $(this);
                    (setting === undefined ? el.css("display") == "none" : setting) ? el.show(): el.hide()
                })
            },

            prev: function(selector) {
                return $(this.pluck('previousElementSibling')).filter(selector || '*')
            },

            prevAll: wrapper_selector(finder.previousSiblings, finder),

            next: function(selector) {
                return $(this.pluck('nextElementSibling')).filter(selector || '*')
            },

            nextAll: wrapper_selector(finder.nextSiblings, finder),

            siblings: wrapper_selector(finder.siblings, finder),

            index: function(elem) {
                if (elem) {
                    return this.indexOf($(elem)[0]);
                } else {
                    return this.parent().children().indexOf(this[0]);
                }
            }
        });

        // for now
        $.fn.detach = $.fn.remove;

        $.fn.hover = function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        };


        var traverseNode = noder.traverse;


        $.fn.after = wrapper_node_operation(noder.after, noder);

        $.fn.prepend = wrapper_node_operation(noder.prepend, noder);

        $.fn.before = wrapper_node_operation(noder.before, noder);

        $.fn.append = wrapper_node_operation(noder.append, noder);


        langx.each( {
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function( name, original ) {
            $.fn[ name ] = function( selector ) {
                var elems,
                    ret = [],
                    insert = $( selector ),
                    last = insert.length - 1,
                    i = 0;

                for ( ; i <= last; i++ ) {
                    elems = i === last ? this : this.clone( true );
                    $( insert[ i ] )[ original ]( elems );

                    // Support: Android <=4.0 only, PhantomJS 1 only
                    // .get() because push.apply(_, arraylike) throws on ancient WebKit
                    push.apply( ret, elems.get() );
                }

                return this.pushStack( ret );
            };
        } );

/*
        $.fn.insertAfter = function(html) {
            $(html).after(this);
            return this;
        };

        $.fn.insertBefore = function(html) {
            $(html).before(this);
            return this;
        };

        $.fn.appendTo = function(html) {
            $(html).append(this);
            return this;
        };

        $.fn.prependTo = function(html) {
            $(html).prepend(this);
            return this;
        };

        $.fn.replaceAll = function(selector) {
            $(selector).replaceWith(this);
            return this;
        };
*/
        return $;
    })();

    (function($) {
        $.fn.scrollParent = function( includeHidden ) {
            var position = this.css( "position" ),
                excludeStaticParent = position === "absolute",
                overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
                scrollParent = this.parents().filter( function() {
                    var parent = $( this );
                    if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
                        return false;
                    }
                    return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
                        parent.css( "overflow-x" ) );
                } ).eq( 0 );

            return position === "fixed" || !scrollParent.length ?
                $( this[ 0 ].ownerDocument || document ) :
                scrollParent;
        };

    })(query);


    (function($) {
        $.fn.end = function() {
            return this.prevObject || $()
        }

        $.fn.andSelf = function() {
            return this.add(this.prevObject || $())
        }

        $.fn.addBack = function(selector) {
            if (this.prevObject) {
                if (selector) {
                    return this.add(this.prevObject.filter(selector));
                } else {
                    return this.add(this.prevObject);
                }
            } else {
                return this;
            }
        }

        'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings,prev,prevAll,next,nextAll'.split(',').forEach(function(property) {
            var fn = $.fn[property]
            $.fn[property] = function() {
                var ret = fn.apply(this, arguments)
                ret.prevObject = this
                return ret
            }
        })
    })(query);


    (function($) {
        $.fn.query = $.fn.find;

        $.fn.place = function(refNode, position) {
            // summary:
            //      places elements of this node list relative to the first element matched
            //      by queryOrNode. Returns the original NodeList. See: `dojo/dom-construct.place`
            // queryOrNode:
            //      may be a string representing any valid CSS3 selector or a DOM node.
            //      In the selector case, only the first matching element will be used
            //      for relative positioning.
            // position:
            //      can be one of:
            //
            //      -   "last" (default)
            //      -   "first"
            //      -   "before"
            //      -   "after"
            //      -   "only"
            //      -   "replace"
            //
            //      or an offset in the childNodes
            if (langx.isString(refNode)) {
                refNode = finder.descendant(refNode);
            } else if (isQ(refNode)) {
                refNode = refNode[0];
            }
            return this.each(function(i, node) {
                switch (position) {
                    case "before":
                        noder.before(refNode, node);
                        break;
                    case "after":
                        noder.after(refNode, node);
                        break;
                    case "replace":
                        noder.replace(refNode, node);
                        break;
                    case "only":
                        noder.empty(refNode);
                        noder.append(refNode, node);
                        break;
                    case "first":
                        noder.prepend(refNode, node);
                        break;
                        // else fallthrough...
                    default: // aka: last
                        noder.append(refNode, node);
                }
            });
        };

        $.fn.addContent = function(content, position) {
            if (content.template) {
                content = langx.substitute(content.template, content);
            }
            return this.append(content);
        };



        $.fn.disableSelection = ( function() {
            var eventType = "onselectstart" in document.createElement( "div" ) ?
                "selectstart" :
                "mousedown";

            return function() {
                return this.on( eventType + ".ui-disableSelection", function( event ) {
                    event.preventDefault();
                } );
            };
        } )();

        $.fn.enableSelection = function() {
            return this.off( ".ui-disableSelection" );
        };

        $.fn.reflow = function() {
            return noder.flow(this[0]);
        };

        $.fn.isBlockNode = function() {
            return noder.isBlockNode(this[0]);
        };
       

    })(query);

    query.fn.plugin = function(name,options) {
        var args = slice.call( arguments, 1 ),
            self = this,
            returnValue = this;

        this.each(function(){
            returnValue = plugins.instantiate.apply(self,[this,name].concat(args));
        });
        return returnValue;
    };


    query.wraps = {
        wrapper_node_operation,
        wrapper_map,
        wrapper_value,
        wrapper_selector,
        wrapper_some_chk,
        wrapper_selector_until,
        wrapper_every_act_firstArgFunc,
        wrapper_every_act,
        wrapper_name_value

    };

    return skylark.attach("domx.query", query);

});
define('skylark-domx-query/main',[
	"./query"
],function(query){
	return query;
});
define('skylark-domx-query', ['skylark-domx-query/main'], function (main) { return main; });

define('skylark-domx-velm/velm',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query"
], function(skylark, langx, noder, finder, $) {
    var map = Array.prototype.map,
        slice = Array.prototype.slice;
    /*
     * VisualElement is a skylark class type wrapping a visule dom node,
     * provides a number of prototype methods and supports chain calls.
     */
    var VisualElement = langx.klass({
        klassName: "VisualElement",

        "_construct": function(node) {
            if (langx.isString(node)) {
                if (node.charAt(0) === "<") {
                    //html
                    node = noder.createFragment(node)[0];
                } else {
                    // id
                    node = document.getElementById(node);
                }
            }
            this._elm = node;
        }
    });

    VisualElement.prototype.$ = VisualElement.prototype.query = function(selector) {
        return $(selector,this._elm);
    };

    VisualElement.prototype.elm = function() {
        return this._elm;
    };

    /*
     * the VisualElement object wrapping document.body
     */
    var root = new VisualElement(document.body),
        velm = function(node) {
            if (node) {
                return new VisualElement(node);
            } else {
                return root;
            }
        };
    /*
     * Extend VisualElement prototype with wrapping the specified methods.
     * @param {ArrayLike} fn
     * @param {Object} context
     */
    function _delegator(fn, context) {
        return function() {
            var self = this,
                elem = self._elm,
                ret = fn.apply(context, [elem].concat(slice.call(arguments)));

            if (ret) {
                if (ret === context) {
                    return self;
                } else {
                    if (ret instanceof HTMLElement) {
                        ret = new VisualElement(ret);
                    } else if (langx.isArrayLike(ret)) {
                        ret = map.call(ret, function(el) {
                            if (el instanceof HTMLElement) {
                                return new VisualElement(el);
                            } else {
                                return el;
                            }
                        })
                    }
                }
            }
            return ret;
        };
    }

    langx.mixin(velm, {
        batch: function(nodes, action, args) {
            nodes.forEach(function(node) {
                var elm = (node instanceof VisualElement) ? node : velm(node);
                elm[action].apply(elm, args);
            });

            return this;
        },

        root: new VisualElement(document.body),

        VisualElement: VisualElement,

        partial: function(name, fn) {
            var props = {};

            props[name] = fn;

            VisualElement.partial(props);
        },

        delegate: function(names, context) {
            var props = {};

            names.forEach(function(name) {
                props[name] = _delegator(context[name], context);
            });

            VisualElement.partial(props);
        }
    });

    // from ./finder
    velm.delegate([
        "ancestor",
        "ancestors",
        "children",
        "descendant",
        "find",
        "findAll",
        "firstChild",
        "lastChild",
        "matches",
        "nextSibling",
        "nextSiblings",
        "parent",
        "previousSibling",
        "previousSiblings",
        "siblings"
    ], finder);

    /*
     * find a dom element matched by the specified selector.
     * @param {String} selector
     */
    velm.find = function(selector) {
        if (selector === "body") {
            return this.root;
        } else {
            return this.root.descendant(selector);
        }
    };


    // from ./noder
    velm.delegate([
        "after",
        "append",
        "before",
        "clone",
        "contains",
        "contents",
        "empty",
        "html",
        "isChildOf",
        "isDocument",
        "isInDocument",
        "isWindow",
        "ownerDoc",
        "prepend",
        "remove",
        "removeChild",
        "replace",
        "reverse",
        "throb",
        "traverse",
        "wrapper",
        "wrapperInner",
        "unwrap"
    ], noder);


    return skylark.attach("domx.velm", velm);
});
define('skylark-domx-velm/main',[
	"./velm"
],function(velm){
	return velm;
});
define('skylark-domx-velm', ['skylark-domx-velm/main'], function (main) { return main; });

define('skylark-domx-data/main',[
    "./data",
    "skylark-domx-velm",
    "skylark-domx-query"    
],function(data,velm,$){
    // from ./data
    velm.delegate([
        "attr",
        "data",
        "prop",
        "removeAttr",
        "removeData",
        "text",
        "val"
    ], data);

    $.fn.text = $.wraps.wrapper_value(data.text, data, data.text);

    $.fn.attr = $.wraps.wrapper_name_value(data.attr, data, data.attr);

    $.fn.removeAttr = $.wraps.wrapper_every_act(data.removeAttr, data);

    $.fn.prop = $.wraps.wrapper_name_value(data.prop, data, data.prop);

    $.fn.removeProp = $.wraps.wrapper_every_act(data.removeProp, data);

    $.fn.data = $.wraps.wrapper_name_value(data.data, data);

    $.fn.removeData = $.wraps.wrapper_every_act(data.removeData);

    $.fn.val = $.wraps.wrapper_value(data.val, data, data.val);


    return data;
});
define('skylark-domx-data', ['skylark-domx-data/main'], function (main) { return main; });

define('skylark-domx-eventer/eventer',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-finder",
    "skylark-domx-noder",
    "skylark-domx-data"
], function(skylark, langx, browser, finder, noder, datax) {
    var mixin = langx.mixin,
        each = langx.each,
        slice = Array.prototype.slice,
        uid = langx.uid,
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: "isDefaultPrevented",
            stopImmediatePropagation: "isImmediatePropagationStopped",
            stopPropagation: "isPropagationStopped"
        },
        readyRE = /complete|loaded|interactive/;

    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            if (!source) {
                source = event;
            }

            langx.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name];
                event[name] = function() {
                    this[predicate] = langx.returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                }
                event[predicate] = langx.returnFalse;
            });
        }
        return event;
    }

    function parse(event) {
        var segs = ("" + event).split(".");
        return {
            type: segs[0],
            ns: segs.slice(1).sort().join(" ")
        };
    }


    var NativeEventCtors = [
            window["CustomEvent"], // 0 default
            window["CompositionEvent"], // 1
            window["DragEvent"], // 2
            window["Event"], // 3
            window["FocusEvent"], // 4
            window["KeyboardEvent"], // 5
            window["MessageEvent"], // 6
            window["MouseEvent"], // 7
            window["MouseScrollEvent"], // 8
            window["MouseWheelEvent"], // 9
            window["MutationEvent"], // 10
            window["ProgressEvent"], // 11
            window["TextEvent"], // 12
            window["TouchEvent"], // 13
            window["UIEvent"], // 14
            window["WheelEvent"], // 15
            window["ClipboardEvent"] // 16
        ],
        NativeEvents = {
            "compositionstart": 1, // CompositionEvent
            "compositionend": 1, // CompositionEvent
            "compositionupdate": 1, // CompositionEvent

            "beforecopy": 16, // ClipboardEvent
            "beforecut": 16, // ClipboardEvent
            "beforepaste": 16, // ClipboardEvent
            "copy": 16, // ClipboardEvent
            "cut": 16, // ClipboardEvent
            "paste": 16, // ClipboardEvent

            "drag": 2, // DragEvent
            "dragend": 2, // DragEvent
            "dragenter": 2, // DragEvent
            "dragexit": 2, // DragEvent
            "dragleave": 2, // DragEvent
            "dragover": 2, // DragEvent
            "dragstart": 2, // DragEvent
            "drop": 2, // DragEvent

            "abort": 3, // Event
            "change": 3, // Event
            "error": 3, // Event
            "selectionchange": 3, // Event
            "submit": 3, // Event
            "reset": 3, // Event

            "focus": 4, // FocusEvent
            "blur": 4, // FocusEvent
            "focusin": 4, // FocusEvent
            "focusout": 4, // FocusEvent

            "keydown": 5, // KeyboardEvent
            "keypress": 5, // KeyboardEvent
            "keyup": 5, // KeyboardEvent

            "message": 6, // MessageEvent

            "click": 7, // MouseEvent
            "contextmenu": 7, // MouseEvent
            "dblclick": 7, // MouseEvent
            "mousedown": 7, // MouseEvent
            "mouseup": 7, // MouseEvent
            "mousemove": 7, // MouseEvent
            "mouseover": 7, // MouseEvent
            "mouseout": 7, // MouseEvent
            "mouseenter": 7, // MouseEvent
            "mouseleave": 7, // MouseEvent


            "textInput": 12, // TextEvent

            "touchstart": 13, // TouchEvent
            "touchmove": 13, // TouchEvent
            "touchend": 13, // TouchEvent

            "load": 14, // UIEvent
            "resize": 14, // UIEvent
            "select": 14, // UIEvent
            "scroll": 14, // UIEvent
            "unload": 14, // UIEvent,

            "wheel": 15 // WheelEvent
        };

    //create a custom dom event
    var createEvent = (function() {

        function getEventCtor(type) {
            var idx = NativeEvents[type];
            if (!idx) {
                idx = 0;
            }
            return NativeEventCtors[idx];
        }

        return function(type, props) {
            //create a custom dom event

            if (langx.isString(type)) {
                props = props || {};
            } else {
                props = type || {};
                type = props.type || "";
            }
            var parsed = parse(type);
            type = parsed.type;

            props = langx.mixin({
                bubbles: true,
                cancelable: true
            }, props);

            if (parsed.ns) {
                props.namespace = parsed.ns;
            }

            var ctor = getEventCtor(type),
                e = new ctor(type, props);

            langx.safeMixin(e, props);

            return compatible(e);
        };
    })();

    function createProxy(src, props) {
        var key,
            proxy = {
                originalEvent: src
            };
        for (key in src) {
            if (key !== "keyIdentifier" && !ignoreProperties.test(key) && src[key] !== undefined) {
                proxy[key] = src[key];
            }
        }
        if (props) {
            langx.mixin(proxy, props);
        }
        return compatible(proxy, src);
    }

    var
        specialEvents = {},
        focusinSupported = "onfocusin" in window,
        focus = { focus: "focusin", blur: "focusout" },
        hover = { mouseenter: "mouseover", mouseleave: "mouseout" },
        realEvent = function(type) {
            return hover[type] || (focusinSupported && focus[type]) || type;
        },
        handlers = {},
        EventBindings = langx.klass({
            init: function(target, event) {
                this._target = target;
                this._event = event;
                this._bindings = [];
            },

            add: function(fn, options) {
                var bindings = this._bindings,
                    binding = {
                        fn: fn,
                        options: langx.mixin({}, options)
                    };

                bindings.push(binding);

                var self = this;
                if (!self._listener) {
                    self._listener = function(domEvt) {
                        var elm = this,
                            e = createProxy(domEvt),
                            args = domEvt._args,
                            bindings = self._bindings,
                            ns = e.namespace;

                        if (langx.isDefined(args)) {
                            args = [e].concat(args);
                        } else {
                            args = [e];
                        }

                        langx.each(bindings, function(idx, binding) {
                            var match = elm;
                            if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
                                return false;
                            }
                            var fn = binding.fn,
                                options = binding.options || {},
                                selector = options.selector,
                                one = options.one,
                                data = options.data;

                            if (ns && ns != options.ns && options.ns.indexOf(ns) === -1) {
                                return;
                            }
                            if (selector) {
                                match = finder.closest(e.target, selector);
                                if (match && match !== elm) {
                                    langx.mixin(e, {
                                        currentTarget: match,
                                        liveFired: elm
                                    });
                                } else {
                                    return;
                                }
                            }

                            var originalEvent = self._event;
                            if (originalEvent in hover) {
                                var related = e.relatedTarget;
                                if (related && (related === match || noder.contains(match, related))) {
                                    return;
                                }
                            }

                            if (langx.isDefined(data)) {
                                e.data = data;
                            }

                            if (one) {
                                self.remove(fn, options);
                            }

                            var result = fn.apply(match, args);

                            if (result === false) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });;
                    };

                    var event = self._event;
                    /*
                                        if (event in hover) {
                                            var l = self._listener;
                                            self._listener = function(e) {
                                                var related = e.relatedTarget;
                                                if (!related || (related !== this && !noder.contains(this, related))) {
                                                    return l.apply(this, arguments);
                                                }
                                            }
                                        }
                    */

                    if (self._target.addEventListener) {
                        self._target.addEventListener(realEvent(event), self._listener, false);
                    } else {
                        console.warn("invalid eventer object", self._target);
                    }
                }

            },
            remove: function(fn, options) {
                options = langx.mixin({}, options);

                function matcherFor(ns) {
                    return new RegExp("(?:^| )" + ns.replace(" ", " .* ?") + "(?: |$)");
                }
                var matcher;
                if (options.ns) {
                    matcher = matcherFor(options.ns);
                }

                this._bindings = this._bindings.filter(function(binding) {
                    var removing = (!fn || fn === binding.fn) &&
                        (!matcher || matcher.test(binding.options.ns)) &&
                        (!options.selector || options.selector == binding.options.selector);

                    return !removing;
                });
                if (this._bindings.length == 0) {
                    if (this._target.removeEventListener) {
                        this._target.removeEventListener(realEvent(this._event), this._listener, false);
                    }
                    this._listener = null;
                }
            }
        }),
        EventsHandler = langx.klass({
            init: function(elm) {
                this._target = elm;
                this._handler = {};
            },

            // add a event listener
            // selector Optional
            register: function(event, callback, options) {
                // Seperate the event from the namespace
                var parsed = parse(event),
                    event = parsed.type,
                    specialEvent = specialEvents[event],
                    bindingEvent = specialEvent && (specialEvent.bindType || specialEvent.bindEventName);

                var events = this._handler;

                // Check if there is already a handler for this event
                if (events[event] === undefined) {
                    events[event] = new EventBindings(this._target, bindingEvent || event);
                }

                // Register the new callback function
                events[event].add(callback, langx.mixin({
                    ns: parsed.ns
                }, options)); // options:{selector:xxx}
            },

            // remove a event listener
            unregister: function(event, fn, options) {
                // Check for parameter validtiy
                var events = this._handler,
                    parsed = parse(event);
                event = parsed.type;

                if (event) {
                    var listener = events[event];

                    if (listener) {
                        listener.remove(fn, langx.mixin({
                            ns: parsed.ns
                        }, options));
                    }
                } else {
                    //remove all events
                    for (event in events) {
                        var listener = events[event];
                        listener.remove(fn, langx.mixin({
                            ns: parsed.ns
                        }, options));
                    }
                }
            }
        }),

        findHandler = function(elm) {
            var id = uid(elm),
                handler = handlers[id];
            if (!handler) {
                handler = handlers[id] = new EventsHandler(elm);
            }
            return handler;
        };

    /*   
     * Remove an event handler for one or more events from the specified element.
     * @param {HTMLElement} elm  
     * @param {String} events
     * @param {String　Optional } selector
     * @param {Function} callback
     */
    function off(elm, events, selector, callback) {
        var $this = this
        if (langx.isPlainObject(events)) {
            langx.each(events, function(type, fn) {
                off(elm, type, selector, fn);
            })
            return $this;
        }

        if (!langx.isString(selector) && !langx.isFunction(callback) && callback !== false) {
            callback = selector;
            selector = undefined;
        }

        if (callback === false) {
            callback = langx.returnFalse;
        }

        if (typeof events == "string") {
            if (events.indexOf(",") > -1) {
                events = events.split(",");
            } else {
                events = events.split(/\s/);
            }
        }

        var handler = findHandler(elm);

        if (events) events.forEach(function(event) {

            handler.unregister(event, callback, {
                selector: selector,
            });
        });
        return this;
    }

    /*   
     * Attach an event handler function for one or more events to the selected elements.
     * @param {HTMLElement} elm  
     * @param {String} events
     * @param {String　Optional} selector
     * @param {Anything Optional} data
     * @param {Function} callback
     * @param {Boolean　Optional} one
     */
    function on(elm, events, selector, data, callback, one) {

        var autoRemove, delegator;
        if (langx.isPlainObject(events)) {
            langx.each(events, function(type, fn) {
                on(elm, type, selector, data, fn, one);
            });
            return this;
        }

        if (!langx.isString(selector) && !langx.isFunction(callback)) {
            callback = data;
            data = selector;
            selector = undefined;
        }

        if (langx.isFunction(data)) {
            callback = data;
            data = undefined;
        }

        if (callback === false) {
            callback = langx.returnFalse;
        }

        if (typeof events == "string") {
            if (events.indexOf(",") > -1) {
                events = events.split(",");
            } else {
                events = events.split(/\s/);
            }
        }

        var handler = findHandler(elm);

        events.forEach(function(event) {
            if (event == "ready") {
                return ready(callback);
            }
            handler.register(event, callback, {
                data: data,
                selector: selector,
                one: !!one
            });
        });
        return this;
    }

    /*   
     * Attach a handler to an event for the elements. The handler is executed at most once per 
     * @param {HTMLElement} elm  
     * @param {String} event
     * @param {String　Optional} selector
     * @param {Anything Optional} data
     * @param {Function} callback
     */
    function one(elm, events, selector, data, callback) {
        on(elm, events, selector, data, callback, 1);

        return this;
    }

    /*   
     * Prevents propagation and clobbers the default action of the passed event. The same as calling event.preventDefault() and event.stopPropagation(). 
     * @param {String} event
     */
    function stop(event) {
        if (window.document.all) {
            event.keyCode = 0;
        }
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }
        return this;
    }
    /*   
     * Execute all handlers and behaviors attached to the matched elements for the given event  
     * @param {String} evented
     * @param {String} type
     * @param {Array or PlainObject } args
     */
    function trigger(evented, type, args) {
        var e;
        if (type instanceof Event) {
            e = type;
        } else {
            e = createEvent(type, args);
        }
        e._args = args;

        var fn = (evented.dispatchEvent || evented.trigger);
        if (fn) {
            fn.call(evented, e);
        } else {
            console.warn("The evented parameter is not a eventable object");
        }

        return this;
    }
    /*   
     * Specify a function to execute when the DOM is fully loaded.  
     * @param {Function} callback
     */
    function ready(callback) {
        // need to check if document.body exists for IE as that browser reports
        // document ready when it hasn't yet created the body elm
        if (readyRE.test(document.readyState) && document.body) {
            langx.defer(callback);
        } else {
            document.addEventListener('DOMContentLoaded', callback, false);
        }

        return this;
    }

    var keyCodeLookup = {
        "backspace": 8,
        "comma": 188,
        "delete": 46,
        "down": 40,
        "end": 35,
        "enter": 13,
        "escape": 27,
        "home": 36,
        "left": 37,
        "page_down": 34,
        "page_up": 33,
        "period": 190,
        "right": 39,
        "space": 32,
        "tab": 9,
        "up": 38
    };
    //example:
    //shortcuts(elm).add("CTRL+ALT+SHIFT+X",function(){console.log("test!")});
    function shortcuts(elm) {

        var registry = datax.data(elm, "shortcuts");
        if (!registry) {
            registry = {};
            datax.data(elm, "shortcuts", registry);
            var run = function(shortcut, event) {
                var n = event.metaKey || event.ctrlKey;
                if (shortcut.ctrl == n && shortcut.alt == event.altKey && shortcut.shift == event.shiftKey) {
                    if (event.keyCode == shortcut.keyCode || event.charCode && event.charCode == shortcut.charCode) {
                        event.preventDefault();
                        if ("keydown" == event.type) {
                            shortcut.fn(event);
                        }
                        return true;
                    }
                }
            };
            on(elm, "keyup keypress keydown", function(event) {
                if (!(/INPUT|TEXTAREA/.test(event.target.nodeName))) {
                    for (var key in registry) {
                        run(registry[key], event);
                    }
                }
            });

        }

        return {
            add: function(pattern, fn) {
                var shortcutKeys;
                if (pattern.indexOf(",") > -1) {
                    shortcutKeys = pattern.toLowerCase().split(",");
                } else {
                    shortcutKeys = pattern.toLowerCase().split(" ");
                }
                shortcutKeys.forEach(function(shortcutKey) {
                    var setting = {
                        fn: fn,
                        alt: false,
                        ctrl: false,
                        shift: false
                    };
                    shortcutKey.split("+").forEach(function(key) {
                        switch (key) {
                            case "alt":
                            case "ctrl":
                            case "shift":
                                setting[key] = true;
                                break;
                            default:
                                setting.charCode = key.charCodeAt(0);
                                setting.keyCode = keyCodeLookup[key] || key.toUpperCase().charCodeAt(0);
                        }
                    });
                    var regKey = (setting.ctrl ? "ctrl" : "") + "," + (setting.alt ? "alt" : "") + "," + (setting.shift ? "shift" : "") + "," + setting.keyCode;
                    registry[regKey] = setting;
                })
            }

        };

    }

    if (browser.support.transition) {
        specialEvents.transitionEnd = {
//          handle: function (e) {
//            if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
//          },
          bindType: browser.support.transition.end,
          delegateType: browser.support.transition.end
        }        
    }

    function eventer() {
        return eventer;
    }

    langx.mixin(eventer, {
        NativeEvents : NativeEvents,
        
        create: createEvent,

        keys: keyCodeLookup,

        off: off,

        on: on,

        one: one,

        proxy: createProxy,

        ready: ready,

        shortcuts: shortcuts,

        special: specialEvents,

        stop: stop,

        trigger: trigger

    });

    each(NativeEvents,function(name){
        eventer[name] = function(elm,selector,data,callback) {
            if (arguments.length>1) {
                return this.on(elm,name,selector,data,callback);
            } else {
                if (name == "focus") {
                    if (elm.focus) {
                        elm.focus();
                    }
                } else if (name == "blur") {
                    if (elm.blur) {
                        elm.blur();
                    }
                } else if (name == "click") {
                    if (elm.click) {
                        elm.click();
                    }
                } else {
                    this.trigger(elm,name);
                }

                return this;
            }
        };
    });

    return skylark.attach("domx.eventer",eventer);
});
define('skylark-domx-eventer/main',[
    "skylark-langx/langx",
    "./eventer",
    "skylark-domx-velm",
    "skylark-domx-query"        
],function(langx,eventer,velm,$){

    var delegateMethodNames = [
        "off",
        "on",
        "one",
        "trigger"
    ];

    langx.each(eventer.NativeEvents,function(name){
        delegateMethodNames.push(name);
    });

    // from ./eventer
    velm.delegate(delegateMethodNames, eventer);

    langx.each(delegateMethodNames,function(i,name){
        $.fn[name] = $.wraps.wrapper_every_act(eventer[name],eventer);
    });


    /*
    $.fn.on = $.wraps.wrapper_every_act(eventer.on, eventer);

    $.fn.off = $.wraps.wrapper_every_act(eventer.off, eventer);

    $.fn.trigger = $.wraps.wrapper_every_act(eventer.trigger, eventer);

    ('focusin focusout focus blur load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select keydown keypress keyup error transitionEnd').split(' ').forEach(function(event) {
        $.fn[event] = $.wraps.wrapper_every_act(eventer[event],eventer);
    });

    $.fn.one = function(event, selector, data, callback) {
        if (!langx.isString(selector) && !langx.isFunction(callback)) {
            callback = data;
            data = selector;
            selector = null;
        }

        if (langx.isFunction(data)) {
            callback = data;
            data = null;
        }

        return this.on(event, selector, data, callback, 1)
    }; 
    */

    $.ready = eventer.ready;

    return eventer;
});
define('skylark-domx-eventer', ['skylark-domx-eventer/main'], function (main) { return main; });

define('skylark-slax-runtime/slax',[
	"skylark-langx-ns",
	"skylark-langx-objects",
	"skylark-langx-hoster",
	"skylark-langx-async",
	"skylark-net-http/Xhr",
	"skylark-domx-eventer"
],function(skylark, objects, hoster, async, Xhr, eventer){

    var _config = {


    },
    _rootUrl = "",  //The root url of slax system
    _baseUrl = "";  //the base url of slax app



    var slax = {
        prepare : function(config) {
            var p,slaxRoot,slaxApp;
            if (!config) {
                config = hoster.global.slaxConfig;
            }
            if (!config) {
                var scripts = document.getElementsByTagName("script"),
                    i = 0,
                    script, slaxDir, src, match;
                while(i < scripts.length){
                    script = scripts[i++];
                    if((src = script.getAttribute("src")) && (match = src.match(/(((.*)\/)|^)skylark-slax-runtime([0-9A-Za-z\-]*)\.js(\W|$)/i))){
                        // sniff slaxDir and baseUrl
                        slaxDir = match[3] || "";

                        // sniff configuration on attribute in script element
                        if(src = script.getAttribute("data-slax-config") ){
                            config = eval("({ " + src + " })");
                        } else {
                            slaxRoot = script.getAttribute("data-slax-root");
                            if (slaxRoot == undefined) {
                                slaxRoot = slaxDir;
                            }
                            slaxApp = script.getAttribute("data-slax-app");
                        }
                        break;
                    }
                }
            }

            if (config) {
                objects.mixin(_config,config);
                p = async.Deferred.resolve()
            } else {
                var d = new async.Deferred(),
                    p = d.promise;
                Xhr.get(slaxRoot + "/slax-config.json").then(function(config){
                    if (slaxApp) {
                        var slaxAppPath;
                        for (var i=0; i<config.apps.length;i++) {
                            if (config.apps[i].name == slaxApp) {
                                slaxAppPath = slaxRoot + config.apps[i].dir;
                            } 
                        }
                        Xhr.get(slaxAppPath+"/spa.json").then(function(config){
                            objects.mixin(_config,config);
                            d.resolve();
                        });
                    } else {
                        objects.mixin(_config,config);
                        d.resolve();

                    }
                });

            }

            return p;
        },

        start : function() {
            var cfg = _config;

            //if (cfg.contextPath) {
            //  _cfg.baseUrl = cfg.contextPath;
            //}

             require.config(cfg.runtime);

           
            var initApp = function(spa, _cfg) {
                _cfg = _cfg || cfg;
  
                var app = spa(_cfg);

                hoster.global.go =  function(path, force) {
                    app.go(path, force);
                };

                app.prepare().then(function(){
                    app.run();
                });
            };
            if(cfg.spaModule) {
                require([cfg.spaModule], function(spa) {
                    if(spa._start) {
                        spa._start().then(function(_cfg){
                            initApp(spa, _cfg);
                        });
                    } else {
                        initApp(spa);
                    }
                });
            } else {
                initApp(skylark.spa);
            }
        }
    };

    define("slax",[],function(){
        return slax;
    });

    return skylark.attach("slax",slax);

});
define('skylark-storages-cache/cache',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("storages.cache",{});
});
define('skylark-storages-cache/cookie',[
    "skylark-langx/langx",
    "./cache"
], function(langx,cache) {
    function cookie() {
        return cookie;
    }

    langx.mixin(cookie, {
		get : function(name) {
		    if (!sKey || !this.has(name)) { return null; }
				return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"),"$1"));

		},

		has : function(name) {
			return (new RegExp("(?:^|;\\s*)" + escape(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
		},


		list : function() {
		    var values = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		    for (var i = 0; i < values.length; i++) { 
		    	values[i] = unescape(values[i]); 
		    }
		    return values;
		},

		remove : function(name,path) {
		    if (!name || !this.has(name)) { 
		    	return; 
		   	}
		    document.cookie = escape(name) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (path ? "; path=" + path : "");
		},

		set: function (name, value, expires, path, domain, secure) {
		    if (!name || /^(?:expires|max\-age|path|domain|secure)$/i.test(name)) { return; }

			var type = langx.type(expires);
			if (type === 'number') {
				var date = Date.now();
				date.setTime(date.getTime() + (expire * 24 * 60 * 60 * 1000));
				expires = date;
			} else if (type === 'string') {
				expires = new Date(Date.now() + langx.parseMilliSeconds(expires));
			}

		    document.cookie = escape(name) + "=" + escape(value) + (expires? "; domain=" + expires.toGMTString()  : "") + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (secure ? "; secure" : "");
		  }	
    });


    return cache.cookie = cookie;

});


define('skylark-storages-cache/LocalFileSystem',[
    "skylark-langx/langx",
    "./cache"
], function(langx,cache) {
	var Deferred = langx.Deferred,
		requestFileSystem =  window.requestFileSystem || window.webkitRequestFileSystem,
		resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL,
     	BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;


	function errorHandler(e) {
	  var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  return msg;
	}
	
	var LocalFileSystem = langx.Evented.inherit({
		_fs : null,
		_isPersisted : true,
		_cwd : null,

		init:	function (fs) {
			this._fs = fs;
			this._cwd = fs.root;
		},
			

		readfileAsArrayBuffer :  function (path,callback,errback) {
		    this._cwd.getFile(path, {}, function (fileEntry) {
		      fileEntry.file(function (file) {
		        var reader = new FileReader();
		        reader.onloadend = function () {
		          callback(null, this.result);
		        };
		        reader.readAsArrayBuffer(file);
		      }, errback);
		    }, errback);
		},

		readfileAsDataURL :  function (path,callback,errback) {
		    this._cwd.getFile(path, {}, function (fileEntry) {
		      fileEntry.file(function (file) {
		        var reader = new FileReader();
		        reader.onloadend = function () {
		          callback(null, this.result);
		        };
		        reader.readAsDataURL(file);
		      }, errback);
		    }, errback);
		},

		readfileAsText :  function (path,callback,errback) {
		    this._cwd.getFile(path, {}, function (fileEntry) {
		      fileEntry.file(function (file) {
		        var reader = new FileReader();
		        reader.onloadend = function () {
		          callback(null, this.result);
		        };
		        reader.readAsText(file);
		      }, errback);
		    }, errback);
		},

		writefile : function (path, contents, callback,errback) {
		    var self = this,
		    	folders = path.split('/');
		    folders = folders.slice(0, folders.length - 1);

		    this.mkdir(folders.join('/'),function(){
			    self._cwd.getFile(path, {create: true}, function (fileEntry) {
			      fileEntry.createWriter(function (fileWriter) {
			        var truncated = false;
			        fileWriter.onwriteend = function () {
			          if (!truncated) {
			            truncated = true;
			            this.truncate(this.position);
			            return;
			          }
			          callback && callback();
			        };
			        fileWriter.onerror = errback;
			        // TODO: find a way to write as binary too
			        var blob = contents;
			        if (!blob instanceof Blob) {
			        	blob = new Blob([contents], {type: 'text/plain'});
			        } 
			        fileWriter.write(blob);
			      }, errback);
			    }, errback);

		    });
		},

		rmfile : function (path, callback,errback) {
		    this._cwd.getFile(path, {}, function (fileEntry) {
		      fileEntry.remove(function () {
		        callback();
		      }, errback);
		    }, errback);
		},

		readdir : function (path, callback,errback) {
		    this._cwd.getDirectory(path, {}, function (dirEntry) {
		      var dirReader = dirEntry.createReader();
		      var entries = [];
		      readEntries();
		      function readEntries() {
		        dirReader.readEntries(function (results) {
		          if (!results.length) {
		            callback(null, entries);
		          }
		          else {
		            entries = entries.concat(
		            	Array.prototype.slice.call(results).map(
		            		function (entry) {
		              			return entry.name + (entry.isDirectory ? "/" : "");
		            		}
		            	)
		            );
		            readEntries();
		          }
		        }, errback);
		      }
		    }, errback);
		},

		mkdir : function (path, callback,errback) {
		    var folderParts = path.split('/');

		    var createDir = function(rootDir, folders) {
		      // Throw out './' or '/' and move on. Prevents: '/foo/.//bar'.
		      if (folders[0] == '.' || folders[0] == '') {
		        folders = folders.slice(1);
		      }

		      if (folders.length ==0) {
		      	callback(rootDir);
		      	return;
		      }
		      rootDir.getDirectory(folders[0], {create: true, exclusive: false},
		        function (dirEntry) {
		          if (dirEntry.isDirectory) { // TODO: check shouldn't be necessary.
		            // Recursively add the new subfolder if we have more to create and
		            // There was more than one folder to create.
		            if (folders.length && folderParts.length != 1) {
		              createDir(dirEntry, folders.slice(1));
		            } else {
		              // Return the last directory that was created.
		              if (callback) callback(dirEntry);
		            }
		          } else {
		            var e = new Error(path + ' is not a directory');
		            if (errback) {
		              errback(e);
		            } else {
		              throw e;
		            }
		          }
		        },
		        function(e) {
		            if (errback) {
		              errback(e);
		            } else {
		              throw e;
		            }
		        }
		      );
		    };

		    createDir(this._cwd, folderParts);

		},

		rmdir : function (path, callback,errback) {
		    this._cwd.getDirectory(path, {}, function (dirEntry) {
		      dirEntry.removeRecursively(function () {
		        callback();
		      }, errback);
		    }, errback);
		  },

		copy : function (src, dest, callback) {
		    // TODO: make sure works for cases where dest includes and excludes file name.
		    this._cwd.getFile(src, {}, function(fileEntry) {
		      cwd.getDirectory(dest, {}, function(dirEntry) {
		        fileEntry.copyTo(dirEntry, function () {
		          callback();
		        }, callback);
		      }, callback);
		    }, callback);
		},

		move : function(src, dest, callback) {
		    // TODO: handle more cases like file renames and moving/renaming directories
		    this._cwd.getFile(src, {}, function(fileEntry) {
		      cwd.getDirectory(dest, {}, function(dirEntry) {
		        fileEntry.moveTo(dirEntry, function () {
		          callback();
		        }, callback);
		      }, callback);
		    }, callback);
		},

		chdir : function (path, callback) {
		    this._cwd.getDirectory(path, {}, function (dirEntry) {
		      cwd = dirEntry;
		      if (fs.onchdir) {
		        fs.onchdir(cwd.fullPath);
		      }
		      callback();
		    }, callback);
		},

		importFromHost : function(files) {
		    // Duplicate each file the user selected to the app's fs.
		    var deferred = new Deferred();
		    for (var i = 0, file; file = files[i]; ++i) {
		        (function(f) {
			        cwd.getFile(file.name, {create: true, exclusive: true}, function(fileEntry) {
			          fileEntry.createWriter(function(fileWriter) {
			            fileWriter.write(f); // Note: write() can take a File or Blob object.
			          }, errorHandler);
			        }, errorHandler);
		     	})(file);
 	   	 	}
  		    return deferred.promise;
		  },

		  exportToHost : function() {

		  }
	
	});
	


    function localfs() {
        return localfs;
    }

    langx.mixin(LocalFileSystem, {
        isSupported : function() {
            return !!requestFileSystem;
        },
        request : function(size,isPersisted){
        	size = size || 1024 * 1024 * 10;
        	var typ = isPersisted ? PERSISTENT : TEMPORARY,
        		d = new Deferred();
            requestFileSystem(typ, size, function(_fs) {
                var fs = new LocalFileSystem(_fs,!!isPersisted);
                d.resolve(fs);
            }, function(e) {
            	d.reject(e);
            });

            return d.promise;
        }
    });
    
    cache.requestLocalFileSystem = LocalFileSystem.request;

	return cache.LocalFileSystem = LocalFileSystem;
});
define('skylark-storages-cache/localStorage',[
    "skylark-langx/langx",
    "./cache"
], function(langx,cache) {

    var storage  = null;

    try {
        storage = window["localStorage"];
    } catch (e){

    }

    function localStorage() {
        return localStorage;
    }

    langx.mixin(localStorage, {
        isSupported : function() {
            return !!storage;
        },

        set : function(key, val) {
            if (val === undefined) { 
                return this.remove(key) 
            }
            storage.setItem(key, langx.serializeValue(val));
            return val
        },

        get : function(key, defaultVal) {
            var val = langx.deserializeValue(storage.getItem(key))
            return (val === undefined ? defaultVal : val)
        },

        remove : function(key) { 
            storage.removeItem(key) 
        },

        clear : function() { 
            storage.clear() 
        },

        list : function() {
            var vaules = {}
            for (var i=0; i<storage.length; i++) {
                vaules[key] = storage.key(i)
            }

            return values;
        }
    });

    return  cache.localStorage = localStorage;

});


define('skylark-storages-cache/sessionStorage',[
    "skylark-langx/langx",
    "./cache"
], function(langx,cache) {

    var storage  = null;

    try {
        storage = window["sessiionStorage"];
    } catch (e){

    }

    function sessiionStorage() {
        return sessiionStorage;
    }

    langx.mixin(sessiionStorage, {
        isSupported : function() {
            return !!storage;
        },

        set : function(key, val) {
            if (val === undefined) { 
                return this.remove(key) 
            }
            storage.setItem(key, langx.serializeValue(val));
            return val
        },

        get : function(key, defaultVal) {
            var val = langx.deserializeValue(storage.getItem(key))
            return (val === undefined ? defaultVal : val)
        },

        remove : function(key) { 
            storage.removeItem(key) 
        },

        clear : function() { 
            storage.clear() 
        },

        list : function() {
            var vaules = {}
            for (var i=0; i<storage.length; i++) {
                vaules[key] = storage.key(i)
            }

            return values;
        }
    });

    return  cache.sessionStorage = sessionStorage;

});


define('skylark-storages-cache/main',[
	"./cache",
	"./cookie",
	"./LocalFileSystem",
	"./localStorage",
	"./sessionStorage"
],function(cache) {
	return cache;
});
define('skylark-storages-cache', ['skylark-storages-cache/main'], function (main) { return main; });

define('skylark-slax-runtime/cache',[
	"./slax",
	"skylark-storages-cache"
],function(slax,_cache){
	//local
	//page
	//session
	return slax.cache = {};
});
define('skylark-langx/main',[
    "./skylark",
    "./langx"
], function(skylark) {
    return skylark;
});

define('skylark-langx', ['skylark-langx/main'], function (main) { return main; });

define('skylark-domx/browser',[
    "skylark-domx-browser"
], function(browser) {
    "use strict";

    return browser;
});

define('skylark-domx-css/css',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-noder"
], function(skylark, langx, noder) {
    "use strict";

    var head = document.getElementsByTagName("head")[0],
        count = 0,
        sheetsByUrl = {},
        sheetsById = {},
        defaultSheetId = _createStyleSheet(),
        defaultSheet = sheetsById[defaultSheetId],
        rulesPropName = ("cssRules" in defaultSheet) ? "cssRules" : "rules",
        insertRuleFunc,
        deleteRuleFunc = defaultSheet.deleteRule || defaultSheet.removeRule;

    if (defaultSheet.insertRule) {
        var _insertRule = defaultSheet.insertRule;
        insertRuleFunc = function(selector, css, index) {
            _insertRule.call(this, selector + "{" + css + "}", index);
        };
    } else {
        insertRuleFunc = defaultSheet.addRule;
    }

    function normalizeSelector(selectorText) {
        var selector = [],
            last, len;
        last = defaultSheet[rulesPropName].length;
        insertRuleFunc.call(defaultSheet, selectorText, ';');
        len = defaultSheet[rulesPropName].length;
        for (var i = len - 1; i >= last; i--) {
            selector.push(_sheet[_rules][i].selectorText);
            deleteRuleFunc.call(defaultSheet, i);
        }
        return selector.reverse().join(', ');
    }

    /*
     * create a stylesheet element.
     * @param {Boolean} external
     * @param {Object} options
     * @param {String} [options.media = null]
     */
    function _createStyleSheet(external,options ) {
        var node,
            props = {
                type : "text/css"
            },
            id = (count++);

        options = options || {};
        if (options.media) {
            props.media = options.media;
        }

        if (external) {
            node = noder.create("link",langx.mixin(props,{
                rel  : "stylesheet",
                async : false
            }));
        } else {
            node = noder.createElement("style",props);
        }

        noder.append(head,node);
        sheetsById[id] = {
            id : id,
            node :node
        };

        return id;
    }

    function createStyleSheet(css,options) {
        if (!options) {
            options = {};
        }
        var sheetId = _createStyleSheet(false,options);
        if (css) {
            addSheetRules(sheetId,css);
        }

        return sheetId;
    }

    function loadStyleSheet(url, options,loadedCallback, errorCallback) {
        if (langx.isFunction(options)) {
            errorCallback = loadedCallback;
            loadedCallback = options;
            options = {};
        }
        var sheet = sheetsByUrl[url];
        if (!sheet) {
            var sheetId = _createStyleSheet(true,options);

            sheet = sheetsByUrl[url] = sheetsById[sheetId];
            langx.mixin(sheet,{
                state: 0, //0:unload,1:loaded,-1:loaderror
                url : url,
                deferred : new langx.Deferred()
            });

            var node = sheet.node;

            startTime = new Date().getTime();

            node.onload = function() {
                sheet.state = 1;
                sheet.deferred.resolve(sheet.id);
            },
            node.onerror = function(e) {
                sheet.state = -1;
                sheet.deferred.reject(e);
            };

            node.href = sheet.url;
        }
        if (loadedCallback || errorCallback) {
            sheet.deferred.promise.then(loadedCallback,errorCallback);
        }
        return sheet.id;
    }

    function deleteSheetRule(sheetId, rule) {
        var sheet = sheetsById[sheetId];
        if (langx.isNumber(rule)) {
            deleteRuleFunc.call(sheet, rule);
        } else {
            langx.each(sheet[rulesPropName], function(i, _rule) {
                if (rule === _rule) {
                    deleteRuleFunc.call(sheet, i);
                    return false;
                }
            });
        }
        return this;
    }

    function deleteRule(rule) {
        deleteSheetRule(defaultSheetId, rule);
        return this;
    }

    function removeStyleSheet(sheetId) {
        if (sheetId === defaultSheetId) {
            throw new Error("The default stylesheet can not be deleted");
        }
        var sheet = sheetsById[sheetId];
        delete sheetsById[sheetId];

        noder.remove(sheet.node);
        return this;
    }

    /*
     * insert a rule to the default stylesheet.
     * @param {String} selector
     * @param {String} css
     * @param {Number} index 
     */
    function insertRule(selector, css, index) {
        return this.insertSheetRule(defaultSheetId, selector, css, index);
    }

    /*
     * Add rules to the default stylesheet.
     * @param {Object} rules
     */
    function addRules(rules) {
        return this.addRules(defaultSheetId,rules);
    }

    /*
     * insert a rule to the stylesheet specified by sheetId.
     * @param {Number} sheetId  
     * @param {String} selector
     * @param {String} css
     * @param {Number} index 
     */
    function insertSheetRule(sheetId, selector, css, index) {
        if (!selector || !css) {
            return -1;
        }

        var sheet = sheetsById[sheetId];
        index = index || sheet[rulesPropName].length;

        return insertRuleFunc.call(sheet, selector, css, index);
    }

    /*
     * Add  rules to stylesheet.
     * @param {Number} sheetId  
     * @param {Object|String} rules
     * @return this
     * @example insertSheetRules(sheetId,{
     * 
     * });
     */
    function addSheetRules(sheetId,rules) {
        var sheet = sheetsById[sheetId],
            css;
        if (langx.isString(rules)) {
            css = rules;
        } else {
            css = toString(rules);
        }

        noder.append(sheet.node,noder.createTextNode(css));
        
        return this;
    }

    function isAtRule(str) {
        return str.startsWith("@");
    }

    function toString(json){
        var adjust = function(parentName,name,depth) {
            if (parentName) {
                if (isAtRule(parentName)) {
                    depth += 1;
                } else {
                    name =  parentName + " " + name;
                }                
            }
            return {
                name : name,
                depth : depth
            }
        };

        var strNode = function (name, values, depth) {
            var str = "",
                atFlg = isAtRule(name);


            if (isAtRule(name)) {
                // at rule
                if (langx.isString(values)) {
                    // an at rule without block
                    // ex: (1) @charset 'utf8';
                    str = css.SPACE.repeat(depth) + name.trim() + " \"" + values.trim() + " \";\n";
                } else {
                    // an at rule with block, ex :
                    //  @media 'screen' {
                    //  }
                    str += css.SPACE.repeat(depth) + name.trim() + " {\n";
                    str += strNode("",values,depth+1);
                    str += css.SPACE.repeat(depth) + " }\n";
                }
            } else {
                // a selector or a property
                if (langx.isString(values)) {
                    // a css property 
                    // ex : (1) font-color : red;
                    str = css.SPACE.repeat(depth) + name.trim() ;
                    if (atFlg) {
                        str = str +  " \"" + values.trim() + " \";\n";
                    } else {
                        str = str + ': ' + values.trim() + ";\n";
                    }

                } else {
                    // a selector rule 
                    // ex : (1) .class1 : {
                    //            font-color : red;
                    //          }
                    if (langx.isArray(values)) {
                        // array for ordering
                        for (var n =0; n<values.length; n ++) {
                           str +=  strNode(name,values[n],depth);
                        }
                    } else {
                        // plain object

                        if (name) {
                            str += css.SPACE.repeat(depth) + name.trim() + " {\n";

                            for (var n in values) {
                                var value =values[n];
                                if (langx.isString(value)) {
                                    // css property
                                    str += strNode(n,value,depth+1)
                                }
                            }

                            str += css.SPACE.repeat(depth) + "}\n";
                        }

                        for (var n in values) {
                            var value =values[n];
                            if (!langx.isString(value)) {
                                var adjusted = adjust(name,n,depth);
                                str +=  strNode(adjusted.name,value,adjusted.depth);
                            } 
                        }

                    }
                }
            }   

            return str;
        };


        return strNode("",json,0);
    }
 

    function css() {
        return css;
    }

    langx.mixin(css, {
        SPACE : "\t",

        addRules : addRules,

        addSheetRules : addSheetRules,

        createStyleSheet: createStyleSheet,

        deleteSheetRule : deleteSheetRule,

        deleteRule : deleteRule,

        insertRule : insertRule,

        insertSheetRule : insertSheetRule,

        loadStyleSheet : loadStyleSheet,

        removeStyleSheet : removeStyleSheet,

        toString : toString
    });

    return skylark.attach("domx.css", css);
});

define('skylark-domx-css/main',[
	"./css"
],function(css){
	return css;
});
define('skylark-domx-css', ['skylark-domx-css/main'], function (main) { return main; });

define('skylark-domx/css',[
    "skylark-domx-css"
], function( css) {
    "use strict";

     return css;
});

define('skylark-domx/data',[
    "skylark-domx-data"
], function( data) {
 
    return data;
});
define('skylark-domx/eventer',[
    "skylark-domx-eventer"
], function( eventer) {
 
    return eventer;
});
define('skylark-domx/finder',[
    "skylark-domx-finder"
], function( finder) {

    return finder;
});
define('skylark-domx-styler/styler',[
    "skylark-langx/skylark",
    "skylark-langx/langx"
], function(skylark, langx) {
    var every = Array.prototype.every,
        forEach = Array.prototype.forEach,
        camelCase = langx.camelCase,
        dasherize = langx.dasherize;

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    var cssNumber = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        classReCache = {

        };

    function classRE(name) {
        return name in classReCache ?
            classReCache[name] : (classReCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    // access className property while respecting SVGAnimatedString
    /*
     * Adds the specified class(es) to each element in the set of matched elements.
     * @param {HTMLElement} node
     * @param {String} value
     */
    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    function disabled(elm, value ) {
        if (arguments.length < 2) {
            return !!this.dom.disabled;
        }

        elm.disabled = value;

        return this;
    }

    var elementDisplay = {};

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getStyles(element).getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }
    /*
     * Display the matched elements.
     * @param {HTMLElement} elm
     */
    function show(elm) {
        styler.css(elm, "display", "");
        if (styler.css(elm, "display") == "none") {
            styler.css(elm, "display", defaultDisplay(elm.nodeName));
        }
        return this;
    }

    function isInvisible(elm) {
        return styler.css(elm, "display") == "none" || styler.css(elm, "opacity") == 0;
    }

    /*
     * Hide the matched elements.
     * @param {HTMLElement} elm
     */
    function hide(elm) {
        styler.css(elm, "display", "none");
        return this;
    }

    /*
     * Adds the specified class(es) to each element in the set of matched elements.
     * @param {HTMLElement} elm
     * @param {String} name
     */
    function addClass(elm, name) {
        if (!name) return this
        var cls = className(elm),
            names;
        if (langx.isString(name)) {
            names = name.split(/\s+/g);
        } else {
            names = name;
        }
        names.forEach(function(klass) {
            var re = classRE(klass);
            if (!cls.match(re)) {
                cls += (cls ? " " : "") + klass;
            }
        });

        className(elm, cls);

        return this;
    }

    function getStyles( elem ) {

        // Support: IE <=11 only, Firefox <=30 (#15098, #14150)
        // IE throws on elements created in popups
        // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
        var view = elem.ownerDocument.defaultView;

        if ( !view || !view.opener ) {
            view = window;
        }

        return view.getComputedStyle( elem);
    }


    /*
     * Get the value of a computed style property for the first element in the set of matched elements or set one or more CSS properties for every matched element.
     * @param {HTMLElement} elm
     * @param {String} property
     * @param {Any} value
     */
    function css(elm, property, value) {
        if (arguments.length < 3) {
            var computedStyle,
                computedStyle = getStyles(elm)
            if (langx.isString(property)) {
                return elm.style[camelCase(property)] || computedStyle.getPropertyValue(dasherize(property))
            } else if (langx.isArrayLike(property)) {
                var props = {}
                forEach.call(property, function(prop) {
                    props[prop] = (elm.style[camelCase(prop)] || computedStyle.getPropertyValue(dasherize(prop)))
                })
                return props
            }
        }

        var css = '';
        if (typeof(property) == 'string') {
            if (!value && value !== 0) {
                elm.style.removeProperty(dasherize(property));
            } else {
                css = dasherize(property) + ":" + maybeAddPx(property, value)
            }
        } else {
            for (key in property) {
                if (property[key] === undefined) {
                    continue;
                }
                if (!property[key] && property[key] !== 0) {
                    elm.style.removeProperty(dasherize(key));
                } else {
                    css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                }
            }
        }

        elm.style.cssText += ';' + css;
        return this;
    }

    /*
     * Determine whether any of the matched elements are assigned the given class.
     * @param {HTMLElement} elm
     * @param {String} name
     */
    function hasClass(elm, name) {
        var re = classRE(name);
        return elm.className && elm.className.match(re);
    }

    /*
     * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
     * @param {HTMLElement} elm
     * @param {String} name
     */
    function removeClass(elm, name) {
        if (name) {
            var cls = className(elm),
                names;

            if (langx.isString(name)) {
                names = name.split(/\s+/g);
            } else {
                names = name;
            }

            names.forEach(function(klass) {
                var re = classRE(klass);
                if (cls.match(re)) {
                    cls = cls.replace(re, " ");
                }
            });

            className(elm, cls.trim());
        } else {
            className(elm, "");
        }

        return this;
    }

    /*
     * Add or remove one or more classes from the specified element.
     * @param {HTMLElement} elm
     * @param {String} name
     * @param {} when
     */
    function toggleClass(elm, name, when) {
        var self = this;
        name.split(/\s+/g).forEach(function(klass) {
            if (when === undefined) {
                when = !self.hasClass(elm, klass);
            }
            if (when) {
                self.addClass(elm, klass);
            } else {
                self.removeClass(elm, klass)
            }
        });

        return self;
    }

    var styler = function() {
        return styler;
    };

    langx.mixin(styler, {
        autocssfix: false,
        cssHooks: {

        },

        addClass: addClass,
        className: className,
        css: css,
        disabled : disabled,        
        hasClass: hasClass,
        hide: hide,
        isInvisible: isInvisible,
        removeClass: removeClass,
        show: show,
        toggleClass: toggleClass
    });

    return skylark.attach("domx.styler", styler);
});
define('skylark-domx-styler/main',[
	"./styler",
	"skylark-domx-velm",
	"skylark-domx-query"	
],function(styler,velm,$){
	
    // from ./styler
    velm.delegate([
        "addClass",
        "className",
        "css",
        "hasClass",
        "hide",
        "isInvisible",
        "removeClass",
        "show",
        "toggleClass"
    ], styler);

    // properties

    var properties = [ 'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border', 'borderLeft',
    'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'display', 'overflow', 'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'color',
    'background', 'backgroundColor', 'opacity', 'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex' ];

    properties.forEach( function ( property ) {

        var method = property;

        velm.VisualElement.prototype[method ] = function (value) {

            this.css( property, value );

            return this;

        };

    });


    $.fn.style = $.wraps.wrapper_name_value(styler.css, styler);

    $.fn.css = $.wraps.wrapper_name_value(styler.css, styler);

    //hasClass(name)
    $.fn.hasClass = $.wraps.wrapper_some_chk(styler.hasClass, styler);

    //addClass(name)
    $.fn.addClass = $.wraps.wrapper_every_act_firstArgFunc(styler.addClass, styler, styler.className);

    //removeClass(name)
    $.fn.removeClass = $.wraps.wrapper_every_act_firstArgFunc(styler.removeClass, styler, styler.className);

    //toogleClass(name,when)
    $.fn.toggleClass = $.wraps.wrapper_every_act_firstArgFunc(styler.toggleClass, styler, styler.className);

    $.fn.replaceClass = function(newClass, oldClass) {
        this.removeClass(oldClass);
        this.addClass(newClass);
        return this;
    };

    $.fn.replaceClass = function(newClass, oldClass) {
        this.removeClass(oldClass);
        this.addClass(newClass);
        return this;
    };
        
	return styler;
});
define('skylark-domx-styler', ['skylark-domx-styler/main'], function (main) { return main; });

define('skylark-domx-geom/geom',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-styler"
], function(skylark, langx, noder, styler) {
    var rootNodeRE = /^(?:body|html)$/i,
        px = langx.toPixel,
        offsetParent = noder.offsetParent,
        cachedScrollbarWidth;

    function scrollbarWidth() {
        if (cachedScrollbarWidth !== undefined) {
            return cachedScrollbarWidth;
        }
        var w1, w2,
            div = noder.createFragment("<div style=" +
                "'display:block;position:absolute;width:200px;height:200px;overflow:hidden;'>" +
                "<div style='height:300px;width:auto;'></div></div>")[0],
            innerDiv = div.childNodes[0];

        noder.append(document.body, div);

        w1 = innerDiv.offsetWidth;

        styler.css(div, "overflow", "scroll");

        w2 = innerDiv.offsetWidth;

        if (w1 === w2) {
            w2 = div[0].clientWidth;
        }

        noder.remove(div);

        return (cachedScrollbarWidth = w1 - w2);
    }
    /*
     * Get the widths of each border of the specified element.
     * @param {HTMLElement} elm
     */
    function borderExtents(elm) {
        if (noder.isWindow(elm)) {
            return {
                left : 0,
                top : 0,
                right : 0,
                bottom : 0
            }
        }        var s = getComputedStyle(elm);
        return {
            left: px(s.borderLeftWidth, elm),
            top: px(s.borderTopWidth, elm),
            right: px(s.borderRightWidth, elm),
            bottom: px(s.borderBottomWidth, elm)
        }
    }

    //viewport coordinate
    /*
     * Get or set the viewport position of the specified element border box.
     * @param {HTMLElement} elm
     * @param {PlainObject} coords
     */
    function boundingPosition(elm, coords) {
        if (coords === undefined) {
            return rootNodeRE.test(elm.nodeName) ? { top: 0, left: 0 } : elm.getBoundingClientRect();
        } else {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                parentOffset = boundingPosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            relativePosition(elm, {
                top: coords.top - parentOffset.top - mex.top - pbex.top,
                left: coords.left - parentOffset.left - mex.left - pbex.left
            });
            return this;
        }
    }

    /*
     * Get or set the viewport rect of the specified element border box.
     * @param {HTMLElement} elm
     * @param {PlainObject} coords
     */
    function boundingRect(elm, coords) {
        if (coords === undefined) {
            return elm.getBoundingClientRect()
        } else {
            boundingPosition(elm, coords);
            size(elm, coords);
            return this;
        }
    }

    /*
     * Get or set the height of the specified element client box.
     * @param {HTMLElement} elm
     * @param {Number} value
     */
    function clientHeight(elm, value) {
        if (value == undefined) {
            return clientSize(elm).height;
        } else {
            return clientSize(elm, {
                height: value
            });
        }
    }

    /*
     * Get or set the size of the specified element client box.
     * @param {HTMLElement} elm
     * @param {PlainObject} dimension
     */
    function clientSize(elm, dimension) {
        if (dimension == undefined) {
            return {
                width: elm.clientWidth,
                height: elm.clientHeight
            }
        } else {
            var isBorderBox = (styler.css(elm, "box-sizing") === "border-box"),
                props = {
                    width: dimension.width,
                    height: dimension.height
                };
            if (!isBorderBox) {
                var pex = paddingExtents(elm);

                if (props.width !== undefined) {
                    props.width = props.width - pex.left - pex.right;
                }

                if (props.height !== undefined) {
                    props.height = props.height - pex.top - pex.bottom;
                }
            } else {
                var bex = borderExtents(elm);

                if (props.width !== undefined) {
                    props.width = props.width + bex.left + bex.right;
                }

                if (props.height !== undefined) {
                    props.height = props.height + bex.top + bex.bottom;
                }

            }
            styler.css(elm, props);
            return this;
        }
        return {
            width: elm.clientWidth,
            height: elm.clientHeight
        };
    }

    /*
     * Get or set the width of the specified element client box.
     * @param {HTMLElement} elm
     * @param {PlainObject} dimension
     */
    function clientWidth(elm, value) {
        if (value == undefined) {
            return clientSize(elm).width;
        } else {
            clientSize(elm, {
                width: value
            });
            return this;
        }
    }

    /*
     * Get the rect of the specified element content box.
     * @param {HTMLElement} elm
     */
    function contentRect(elm) {
        var cs = clientSize(elm),
            pex = paddingExtents(elm);


        //// On Opera, offsetLeft includes the parent's border
        //if(has("opera")){
        //    pe.l += be.l;
        //    pe.t += be.t;
        //}
        return {
            left: pex.left,
            top: pex.top,
            width: cs.width - pex.left - pex.right,
            height: cs.height - pex.top - pex.bottom
        };
    }


    function fullCover(elem, hor, vert) {
        let vertical = vert;
        let horizontal = hor;
        if (langx.isUndefined(horizontal)) {
            horizontal = true;
        }
        if (langx.isUndefined(vertical)) {
            vertical = true;
        }
        elem.style.position = 'absolute';
        if (horizontal) {
            elem.style.left = 0;
            elem.style.right = 0;
        }
        if (vertical) {
            elem.style.top = 0;
            elem.style.bottom = 0;
        }
    }

    /*
     * Get the document size.
     * @param {HTMLDocument} doc
     */
    function getDocumentSize(doc) {
        var documentElement = doc.documentElement,
            body = doc.body,
            max = Math.max,
            scrollWidth = max(documentElement.scrollWidth, body.scrollWidth),
            clientWidth = max(documentElement.clientWidth, body.clientWidth),
            offsetWidth = max(documentElement.offsetWidth, body.offsetWidth),
            scrollHeight = max(documentElement.scrollHeight, body.scrollHeight),
            clientHeight = max(documentElement.clientHeight, body.clientHeight),
            offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);

        return {
            width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
            height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
        };
    }

    /*
     * Get the document size.
     * @param {HTMLElement} elm
     * @param {Number} value
     */
    function height(elm, value) {
        if (value == undefined) {
            return size(elm).height;
        } else {
            size(elm, {
                height: value
            });
            return this;
        }
    }

    /*
     * Get the widths of each margin of the specified element.
     * @param {HTMLElement} elm
     */
    function marginExtents(elm) {
        if (noder.isWindow(elm)) {
            return {
                left : 0,
                top : 0,
                right : 0,
                bottom : 0
            }
        }
        var s = getComputedStyle(elm);
        return {
            left: px(s.marginLeft),
            top: px(s.marginTop),
            right: px(s.marginRight),
            bottom: px(s.marginBottom),
        }
    }


    function marginRect(elm) {
        var obj = relativeRect(elm),
            me = marginExtents(elm);

        return {
            left: obj.left,
            top: obj.top,
            width: obj.width + me.left + me.right,
            height: obj.height + me.top + me.bottom
        };
    }


    function marginSize(elm) {
        var obj = size(elm),
            me = marginExtents(elm);

        return {
            width: obj.width + me.left + me.right,
            height: obj.height + me.top + me.bottom
        };
    }

    /*
     * Get the widths of each padding of the specified element.
     * @param {HTMLElement} elm
     */
    function paddingExtents(elm) {
        if (noder.isWindow(elm)) {
            return {
                left : 0,
                top : 0,
                right : 0,
                bottom : 0
            }
        }
        var s = getComputedStyle(elm);
        return {
            left: px(s.paddingLeft),
            top: px(s.paddingTop),
            right: px(s.paddingRight),
            bottom: px(s.paddingBottom),
        }
    }

    /*
     * Get or set the document position of the specified element border box.
     * @param {HTMLElement} elm
     * @param {PlainObject} coords
     */
    //coordinate to the document
    function pagePosition(elm, coords) {
        if (coords === undefined) {
            var obj = elm.getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset
            }
        } else {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                parentOffset = pagePosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            relativePosition(elm, {
                top: coords.top - parentOffset.top - mex.top - pbex.top,
                left: coords.left - parentOffset.left - mex.left - pbex.left
            });
            return this;
        }
    }

    /*
     * Get or set the document rect of the specified element border box.
     * @param {HTMLElement} elm
     * @param {PlainObject} coords
     */
    function pageRect(elm, coords) {
        if (coords === undefined) {
            var obj = elm.getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        } else {
            pagePosition(elm, coords);
            size(elm, coords);
            return this;
        }
    }

    /*
     * Get or set the position of the specified element border box , relative to parent element.
     * @param {HTMLElement} elm
     * @param {PlainObject} coords
     */
    // coordinate relative to it's parent
    function relativePosition(elm, coords) {
        if (coords == undefined) {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                offset = boundingPosition(elm),
                parentOffset = boundingPosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - pbex.top, // - mex.top,
                left: offset.left - parentOffset.left - pbex.left, // - mex.left
            }
        } else {
            var props = {
                top: coords.top,
                left: coords.left
            }

            if (styler.css(elm, "position") == "static") {
                props['position'] = "relative";
            }
            styler.css(elm, props);
            return this;
        }
    }

    /*
     * Get or set the rect of the specified element border box , relatived to parent element.
     * @param {HTMLElement} elm
     * @param {PlainObject} coords
     */
    function relativeRect(elm, coords) {
        if (coords === undefined) {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                offset = boundingRect(elm),
                parentOffset = boundingPosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - pbex.top, // - mex.top,
                left: offset.left - parentOffset.left - pbex.left, // - mex.left,
                width: offset.width,
                height: offset.height
            }
        } else {
            relativePosition(elm, coords);
            size(elm, coords);
            return this;
        }
    }
    /*
     * Scroll the specified element into view.
     * @param {HTMLElement} elm
     * @param {} align
     */
    function scrollIntoView(elm, align) {
        function getOffset(elm, rootElm) {
            var x, y, parent = elm;

            x = y = 0;
            while (parent && parent != rootElm && parent.nodeType) {
                x += parent.offsetLeft || 0;
                y += parent.offsetTop || 0;
                parent = parent.offsetParent;
            }

            return { x: x, y: y };
        }

        var parentElm = elm.parentNode;
        var x, y, width, height, parentWidth, parentHeight;
        var pos = getOffset(elm, parentElm);

        x = pos.x;
        y = pos.y;
        width = elm.offsetWidth;
        height = elm.offsetHeight;
        parentWidth = parentElm.clientWidth;
        parentHeight = parentElm.clientHeight;

        if (align == "end") {
            x -= parentWidth - width;
            y -= parentHeight - height;
        } else if (align == "center") {
            x -= (parentWidth / 2) - (width / 2);
            y -= (parentHeight / 2) - (height / 2);
        }

        parentElm.scrollLeft = x;
        parentElm.scrollTop = y;

        return this;
    }
    /*
     * Get or set the current horizontal position of the scroll bar for the specified element.
     * @param {HTMLElement} elm
     * @param {Number} value
     */
    function scrollLeft(elm, value) {
        if (elm.nodeType === 9) {
            elm = elm.defaultView;
        }
        var hasScrollLeft = "scrollLeft" in elm;
        if (value === undefined) {
            return hasScrollLeft ? elm.scrollLeft : elm.pageXOffset
        } else {
            if (hasScrollLeft) {
                elm.scrollLeft = value;
            } else {
                elm.scrollTo(value, elm.scrollY);
            }
            return this;
        }
    }
    /*
     * Get or the current vertical position of the scroll bar for the specified element.
     * @param {HTMLElement} elm
     * @param {Number} value
     */
    function scrollTop(elm, value) {
        if (elm.nodeType === 9) {
            elm = elm.defaultView;
        }
        var hasScrollTop = "scrollTop" in elm;

        if (value === undefined) {
            return hasScrollTop ? elm.scrollTop : elm.pageYOffset
        } else {
            if (hasScrollTop) {
                elm.scrollTop = value;
            } else {
                elm.scrollTo(elm.scrollX, value);
            }
            return this;
        }
    }
    /*
     * Get or set the size of the specified element border box.
     * @param {HTMLElement} elm
     * @param {PlainObject}dimension
     */
    function size(elm, dimension) {
        if (dimension == undefined) {
            if (langx.isWindow(elm)) {
                return {
                    width: elm.innerWidth,
                    height: elm.innerHeight
                }

            } else if (langx.isDocument(elm)) {
                return getDocumentSize(document);
            } else {
                return {
                    width: elm.offsetWidth,
                    height: elm.offsetHeight
                }
            }
        } else {
            var isBorderBox = (styler.css(elm, "box-sizing") === "border-box"),
                props = {
                    width: dimension.width,
                    height: dimension.height
                };
            if (!isBorderBox) {
                var pex = paddingExtents(elm),
                    bex = borderExtents(elm);

                if (props.width !== undefined && props.width !== "" && props.width !== null) {
                    props.width = props.width - pex.left - pex.right - bex.left - bex.right;
                }

                if (props.height !== undefined && props.height !== "" && props.height !== null) {
                    props.height = props.height - pex.top - pex.bottom - bex.top - bex.bottom;
                }
            }
            styler.css(elm, props);
            return this;
        }
    }
    /*
     * Get or set the size of the specified element border box.
     * @param {HTMLElement} elm
     * @param {Number} value
     */
    function width(elm, value) {
        if (value == undefined) {
            return size(elm).width;
        } else {
            size(elm, {
                width: value
            });
            return this;
        }
    }

    function geom() {
        return geom;
    }

    langx.mixin(geom, {
        borderExtents: borderExtents,
        //viewport coordinate
        boundingPosition: boundingPosition,

        boundingRect: boundingRect,

        clientHeight: clientHeight,

        clientSize: clientSize,

        clientWidth: clientWidth,

        contentRect: contentRect,

        fullCover,

        getDocumentSize: getDocumentSize,

        height: height,

        marginExtents: marginExtents,

        marginRect: marginRect,

        marginSize: marginSize,

        offsetParent: offsetParent,

        paddingExtents: paddingExtents,

        //coordinate to the document
        pagePosition: pagePosition,

        pageRect: pageRect,

        // coordinate relative to it's parent
        relativePosition: relativePosition,

        relativeRect: relativeRect,

        scrollbarWidth: scrollbarWidth,

        scrollIntoView: scrollIntoView,

        scrollLeft: scrollLeft,

        scrollTop: scrollTop,

        size: size,

        width: width
    });

    ( function() {
        var max = Math.max,
            abs = Math.abs,
            rhorizontal = /left|center|right/,
            rvertical = /top|center|bottom/,
            roffset = /[\+\-]\d+(\.[\d]+)?%?/,
            rposition = /^\w+/,
            rpercent = /%$/;

        function getOffsets( offsets, width, height ) {
            return [
                parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
                parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
            ];
        }

        function parseCss( element, property ) {
            return parseInt( styler.css( element, property ), 10 ) || 0;
        }

        function getDimensions( raw ) {
            if ( raw.nodeType === 9 ) {
                return {
                    size: size(raw),
                    offset: { top: 0, left: 0 }
                };
            }
            if ( noder.isWindow( raw ) ) {
                return {
                    size: size(raw),
                    offset: { 
                        top: scrollTop(raw), 
                        left: scrollLeft(raw) 
                    }
                };
            }
            if ( raw.preventDefault ) {
                return {
                    size : {
                        width: 0,
                        height: 0
                    },
                    offset: { 
                        top: raw.pageY, 
                        left: raw.pageX 
                    }
                };
            }
            return {
                size: size(raw),
                offset: pagePosition(raw)
            };
        }

        function getScrollInfo( within ) {
            var overflowX = within.isWindow || within.isDocument ? "" :
                    styler.css(within.element,"overflow-x" ),
                overflowY = within.isWindow || within.isDocument ? "" :
                    styler.css(within.element,"overflow-y" ),
                hasOverflowX = overflowX === "scroll" ||
                    ( overflowX === "auto" && within.width < scrollWidth(within.element) ),
                hasOverflowY = overflowY === "scroll" ||
                    ( overflowY === "auto" && within.height < scrollHeight(within.element));
            return {
                width: hasOverflowY ? scrollbarWidth() : 0,
                height: hasOverflowX ? scrollbarWidth() : 0
            };
        }

        function getWithinInfo( element ) {
            var withinElement = element || window,
                isWindow = noder.isWindow( withinElement),
                isDocument = !!withinElement && withinElement.nodeType === 9,
                hasOffset = !isWindow && !isDocument,
                msize = marginSize(withinElement);
            return {
                element: withinElement,
                isWindow: isWindow,
                isDocument: isDocument,
                offset: hasOffset ? pagePosition(element) : { left: 0, top: 0 },
                scrollLeft: scrollLeft(withinElement),
                scrollTop: scrollTop(withinElement),
                width: msize.width,
                height: msize.height
            };
        }

        function posit(elm,options ) {
            // Make a copy, we don't want to modify arguments
            options = langx.extend( {}, options );

            var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
                target = options.of,
                within = getWithinInfo( options.within ),
                scrollInfo = getScrollInfo( within ),
                collision = ( options.collision || "flip" ).split( " " ),
                offsets = {};

            dimensions = getDimensions( target );
            if ( target.preventDefault ) {

                // Force left top to allow flipping
                options.at = "left top";
            }
            targetWidth = dimensions.size.width;
            targetHeight = dimensions.size.height;
            targetOffset = dimensions.offset;

            // Clone to reuse original targetOffset later
            basePosition = langx.extend( {}, targetOffset );

            // Force my and at to have valid horizontal and vertical positions
            // if a value is missing or invalid, it will be converted to center
            langx.each( [ "my", "at" ], function() {
                var pos = ( options[ this ] || "" ).split( " " ),
                    horizontalOffset,
                    verticalOffset;

                if ( pos.length === 1 ) {
                    pos = rhorizontal.test( pos[ 0 ] ) ?
                        pos.concat( [ "center" ] ) :
                        rvertical.test( pos[ 0 ] ) ?
                            [ "center" ].concat( pos ) :
                            [ "center", "center" ];
                }
                pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
                pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

                // Calculate offsets
                horizontalOffset = roffset.exec( pos[ 0 ] );
                verticalOffset = roffset.exec( pos[ 1 ] );
                offsets[ this ] = [
                    horizontalOffset ? horizontalOffset[ 0 ] : 0,
                    verticalOffset ? verticalOffset[ 0 ] : 0
                ];

                // Reduce to just the positions without the offsets
                options[ this ] = [
                    rposition.exec( pos[ 0 ] )[ 0 ],
                    rposition.exec( pos[ 1 ] )[ 0 ]
                ];
            } );

            // Normalize collision option
            if ( collision.length === 1 ) {
                collision[ 1 ] = collision[ 0 ];
            }

            if ( options.at[ 0 ] === "right" ) {
                basePosition.left += targetWidth;
            } else if ( options.at[ 0 ] === "center" ) {
                basePosition.left += targetWidth / 2;
            }

            if ( options.at[ 1 ] === "bottom" ) {
                basePosition.top += targetHeight;
            } else if ( options.at[ 1 ] === "center" ) {
                basePosition.top += targetHeight / 2;
            }

            atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
            basePosition.left += atOffset[ 0 ];
            basePosition.top += atOffset[ 1 ];

            return ( function(elem) {
                var collisionPosition, using,
                    msize = marginSize(elem),
                    elemWidth = msize.width,
                    elemHeight = msize.height,
                    marginLeft = parseCss( elem, "marginLeft" ),
                    marginTop = parseCss( elem, "marginTop" ),
                    collisionWidth = elemWidth + marginLeft + parseCss( elem, "marginRight" ) +
                        scrollInfo.width,
                    collisionHeight = elemHeight + marginTop + parseCss( elem, "marginBottom" ) +
                        scrollInfo.height,
                    position = langx.extend( {}, basePosition ),
                    myOffset = getOffsets( offsets.my, msize.width, msize.height);

                if ( options.my[ 0 ] === "right" ) {
                    position.left -= elemWidth;
                } else if ( options.my[ 0 ] === "center" ) {
                    position.left -= elemWidth / 2;
                }

                if ( options.my[ 1 ] === "bottom" ) {
                    position.top -= elemHeight;
                } else if ( options.my[ 1 ] === "center" ) {
                    position.top -= elemHeight / 2;
                }

                position.left += myOffset[ 0 ];
                position.top += myOffset[ 1 ];

                collisionPosition = {
                    marginLeft: marginLeft,
                    marginTop: marginTop
                };

                langx.each( [ "left", "top" ], function( i, dir ) {
                    if ( positions[ collision[ i ] ] ) {
                        positions[ collision[ i ] ][ dir ]( position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            collisionPosition: collisionPosition,
                            collisionWidth: collisionWidth,
                            collisionHeight: collisionHeight,
                            offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
                            my: options.my,
                            at: options.at,
                            within: within,
                            elem: elem
                        } );
                    }
                } );

                if ( options.using ) {

                    // Adds feedback as second argument to using callback, if present
                    using = function( props ) {
                        var left = targetOffset.left - position.left,
                            right = left + targetWidth - elemWidth,
                            top = targetOffset.top - position.top,
                            bottom = top + targetHeight - elemHeight,
                            feedback = {
                                target: {
                                    element: target,
                                    left: targetOffset.left,
                                    top: targetOffset.top,
                                    width: targetWidth,
                                    height: targetHeight
                                },
                                element: {
                                    element: elem,
                                    left: position.left,
                                    top: position.top,
                                    width: elemWidth,
                                    height: elemHeight
                                },
                                horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                                vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                            };
                        if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
                            feedback.horizontal = "center";
                        }
                        if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
                            feedback.vertical = "middle";
                        }
                        if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
                            feedback.important = "horizontal";
                        } else {
                            feedback.important = "vertical";
                        }
                        options.using.call( this, props, feedback );
                    };
                }

                pagePosition(elem, langx.extend( position, { using: using } ));
            })(elm);
        }

        var positions = {
            fit: {
                left: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                        outerWidth = within.width,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = withinOffset - collisionPosLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                        newOverRight;

                    // Element is wider than within
                    if ( data.collisionWidth > outerWidth ) {

                        // Element is initially over the left side of within
                        if ( overLeft > 0 && overRight <= 0 ) {
                            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
                                withinOffset;
                            position.left += overLeft - newOverRight;

                        // Element is initially over right side of within
                        } else if ( overRight > 0 && overLeft <= 0 ) {
                            position.left = withinOffset;

                        // Element is initially over both left and right sides of within
                        } else {
                            if ( overLeft > overRight ) {
                                position.left = withinOffset + outerWidth - data.collisionWidth;
                            } else {
                                position.left = withinOffset;
                            }
                        }

                    // Too far left -> align with left edge
                    } else if ( overLeft > 0 ) {
                        position.left += overLeft;

                    // Too far right -> align with right edge
                    } else if ( overRight > 0 ) {
                        position.left -= overRight;

                    // Adjust based on position and margin
                    } else {
                        position.left = max( position.left - collisionPosLeft, position.left );
                    }
                },
                top: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                        outerHeight = data.within.height,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = withinOffset - collisionPosTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                        newOverBottom;

                    // Element is taller than within
                    if ( data.collisionHeight > outerHeight ) {

                        // Element is initially over the top of within
                        if ( overTop > 0 && overBottom <= 0 ) {
                            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
                                withinOffset;
                            position.top += overTop - newOverBottom;

                        // Element is initially over bottom of within
                        } else if ( overBottom > 0 && overTop <= 0 ) {
                            position.top = withinOffset;

                        // Element is initially over both top and bottom of within
                        } else {
                            if ( overTop > overBottom ) {
                                position.top = withinOffset + outerHeight - data.collisionHeight;
                            } else {
                                position.top = withinOffset;
                            }
                        }

                    // Too far up -> align with top
                    } else if ( overTop > 0 ) {
                        position.top += overTop;

                    // Too far down -> align with bottom edge
                    } else if ( overBottom > 0 ) {
                        position.top -= overBottom;

                    // Adjust based on position and margin
                    } else {
                        position.top = max( position.top - collisionPosTop, position.top );
                    }
                }
            },
            flip: {
                left: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.offset.left + within.scrollLeft,
                        outerWidth = within.width,
                        offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = collisionPosLeft - offsetLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                        myOffset = data.my[ 0 ] === "left" ?
                            -data.elemWidth :
                            data.my[ 0 ] === "right" ?
                                data.elemWidth :
                                0,
                        atOffset = data.at[ 0 ] === "left" ?
                            data.targetWidth :
                            data.at[ 0 ] === "right" ?
                                -data.targetWidth :
                                0,
                        offset = -2 * data.offset[ 0 ],
                        newOverRight,
                        newOverLeft;

                    if ( overLeft < 0 ) {
                        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
                            outerWidth - withinOffset;
                        if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
                            position.left += myOffset + atOffset + offset;
                        }
                    } else if ( overRight > 0 ) {
                        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
                            atOffset + offset - offsetLeft;
                        if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
                            position.left += myOffset + atOffset + offset;
                        }
                    }
                },
                top: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.offset.top + within.scrollTop,
                        outerHeight = within.height,
                        offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = collisionPosTop - offsetTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                        top = data.my[ 1 ] === "top",
                        myOffset = top ?
                            -data.elemHeight :
                            data.my[ 1 ] === "bottom" ?
                                data.elemHeight :
                                0,
                        atOffset = data.at[ 1 ] === "top" ?
                            data.targetHeight :
                            data.at[ 1 ] === "bottom" ?
                                -data.targetHeight :
                                0,
                        offset = -2 * data.offset[ 1 ],
                        newOverTop,
                        newOverBottom;
                    if ( overTop < 0 ) {
                        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
                            outerHeight - withinOffset;
                        if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
                            position.top += myOffset + atOffset + offset;
                        }
                    } else if ( overBottom > 0 ) {
                        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
                            offset - offsetTop;
                        if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
                            position.top += myOffset + atOffset + offset;
                        }
                    }
                }
            },
            flipfit: {
                left: function() {
                    positions.flip.left.apply( this, arguments );
                    positions.fit.left.apply( this, arguments );
                },
                top: function() {
                    positions.flip.top.apply( this, arguments );
                    positions.fit.top.apply( this, arguments );
                }
            }
        };

        geom.posit = posit;
    })();

    return skylark.attach("domx.geom", geom);
});
define('skylark-domx-geom/main',[
    "skylark-langx/langx",
    "./geom",
    "skylark-domx-velm",
    "skylark-domx-query"        
],function(langx,geom,velm,$){
   // from ./geom
    velm.delegate([
        "borderExtents",
        "boundingPosition",
        "boundingRect",
        "clientHeight",
        "clientSize",
        "clientWidth",
        "contentRect",
        "height",
        "marginExtents",
        "offsetParent",
        "paddingExtents",
        "pagePosition",
        "pageRect",
        "relativePosition",
        "relativeRect",
        "scrollIntoView",
        "scrollLeft",
        "scrollTop",
        "size",
        "width"
    ], geom);

    $.fn.offset = $.wraps.wrapper_value(geom.pagePosition, geom, geom.pagePosition);

    $.fn.scrollTop = $.wraps.wrapper_value(geom.scrollTop, geom);

    $.fn.scrollLeft = $.wraps.wrapper_value(geom.scrollLeft, geom);

    $.fn.position =  function(options) {
        if (!this.length) {
            return this;
        }

        if (options) {
            if (options.of && options.of.length) {
                options = langx.clone(options);
                options.of = options.of[0];
            }
            return this.each( function() {
                geom.posit(this,options);
            });
        } else {
            var elem = this[0];

            return geom.relativePosition(elem);

        }             
    };

    $.fn.offsetParent = $.wraps.wrapper_map(geom.offsetParent, geom);


    $.fn.size = $.wraps.wrapper_value(geom.size, geom);

    $.fn.width = $.wraps.wrapper_value(geom.width, geom, geom.width);

    $.fn.height = $.wraps.wrapper_value(geom.height, geom, geom.height);

    $.fn.clientSize = $.wraps.wrapper_value(geom.clientSize, geom.clientSize);
    
    ['width', 'height'].forEach(function(dimension) {
        var offset, Dimension = dimension.replace(/./, function(m) {
            return m[0].toUpperCase()
        });

        $.fn['outer' + Dimension] = function(margin, value) {
            if (arguments.length) {
                if (typeof margin !== 'boolean') {
                    value = margin;
                    margin = false;
                }
            } else {
                margin = false;
                value = undefined;
            }

            if (value === undefined) {
                var el = this[0];
                if (!el) {
                    return undefined;
                }
                var cb = geom.size(el);
                if (margin) {
                    var me = geom.marginExtents(el);
                    cb.width = cb.width + me.left + me.right;
                    cb.height = cb.height + me.top + me.bottom;
                }
                return dimension === "width" ? cb.width : cb.height;
            } else {
                return this.each(function(idx, el) {
                    var mb = {};
                    var me = geom.marginExtents(el);
                    if (dimension === "width") {
                        mb.width = value;
                        if (margin) {
                            mb.width = mb.width - me.left - me.right
                        }
                    } else {
                        mb.height = value;
                        if (margin) {
                            mb.height = mb.height - me.top - me.bottom;
                        }
                    }
                    geom.size(el, mb);
                })

            }
        };
    })

    $.fn.innerWidth = $.wraps.wrapper_value(geom.clientWidth, geom, geom.clientWidth);

    $.fn.innerHeight = $.wraps.wrapper_value(geom.clientHeight, geom, geom.clientHeight);

    return geom;
});
define('skylark-domx-geom', ['skylark-domx-geom/main'], function (main) { return main; });

define('skylark-domx-fx/fx',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-styler",
    "skylark-domx-eventer"
], function(skylark, langx, browser, noder, geom, styler, eventer) {
    var animationName,
        animationDuration,
        animationTiming,
        animationDelay,
        transitionProperty,
        transitionDuration,
        transitionTiming,
        transitionDelay,

        animationEnd = browser.normalizeCssEvent('AnimationEnd'),
        transitionEnd = browser.normalizeCssEvent('TransitionEnd'),

        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        transform = browser.css3PropPrefix + "transform",
        cssReset = {};


    cssReset[animationName = browser.normalizeCssProperty("animation-name")] =
        cssReset[animationDuration = browser.normalizeCssProperty("animation-duration")] =
        cssReset[animationDelay = browser.normalizeCssProperty("animation-delay")] =
        cssReset[animationTiming = browser.normalizeCssProperty("animation-timing-function")] = "";

    cssReset[transitionProperty = browser.normalizeCssProperty("transition-property")] =
        cssReset[transitionDuration = browser.normalizeCssProperty("transition-duration")] =
        cssReset[transitionDelay = browser.normalizeCssProperty("transition-delay")] =
        cssReset[transitionTiming = browser.normalizeCssProperty("transition-timing-function")] = "";



    /*   
     * Perform a custom animation of a set of CSS properties.
     * @param {Object} elm  
     * @param {Number or String} properties
     * @param {String} ease
     * @param {Number or String} duration
     * @param {Function} callback
     * @param {Number or String} delay
     */
    function animate(elm, properties, duration, ease, callback, delay) {
        var key,
            cssValues = {},
            cssProperties = [],
            transforms = "",
            that = this,
            endEvent,
            wrappedCallback,
            fired = false,
            hasScrollTop = false,
            resetClipAuto = false;

        if (langx.isPlainObject(duration)) {
            ease = duration.easing;
            callback = duration.complete;
            delay = duration.delay;
            duration = duration.duration;
        }

        if (langx.isString(duration)) {
            duration = fx.speeds[duration];
        }
        if (duration === undefined) {
            duration = fx.speeds.normal;
        }
        duration = duration / 1000;
        if (fx.off) {
            duration = 0;
        }

        if (langx.isFunction(ease)) {
            callback = ease;
            eace = "swing";
        } else {
            ease = ease || "swing";
        }

        if (delay) {
            delay = delay / 1000;
        } else {
            delay = 0;
        }

        if (langx.isString(properties)) {
            // keyframe animation
            cssValues[animationName] = properties;
            cssValues[animationDuration] = duration + "s";
            cssValues[animationTiming] = ease;
            endEvent = animationEnd;
        } else {
            // CSS transitions
            for (key in properties) {
                var v = properties[key];
                if (supportedTransforms.test(key)) {
                    transforms += key + "(" + v + ") ";
                } else {
                    if (key === "scrollTop") {
                        hasScrollTop = true;
                    }
                    if (key == "clip" && langx.isPlainObject(v)) {
                        cssValues[key] = "rect(" + v.top+"px,"+ v.right +"px,"+ v.bottom +"px,"+ v.left+"px)";
                        if (styler.css(elm,"clip") == "auto") {
                            var size = geom.size(elm);
                            styler.css(elm,"clip","rect("+"0px,"+ size.width +"px,"+ size.height +"px,"+"0px)");  
                            resetClipAuto = true;
                        }

                    } else {
                        cssValues[key] = v;
                    }
                    cssProperties.push(langx.dasherize(key));
                }
            }
            endEvent = transitionEnd;
        }

        if (transforms) {
            cssValues[transform] = transforms;
            cssProperties.push(transform);
        }

        if (duration > 0 && langx.isPlainObject(properties)) {
            cssValues[transitionProperty] = cssProperties.join(", ");
            cssValues[transitionDuration] = duration + "s";
            cssValues[transitionDelay] = delay + "s";
            cssValues[transitionTiming] = ease;
        }

        wrappedCallback = function(event) {
            fired = true;
            if (event) {
                if (event.target !== event.currentTarget) {
                    return // makes sure the event didn't bubble from "below"
                }
                eventer.off(event.target, endEvent, wrappedCallback)
            } else {
                eventer.off(elm, animationEnd, wrappedCallback) // triggered by setTimeout
            }
            styler.css(elm, cssReset);
            if (resetClipAuto) {
 //               styler.css(elm,"clip","auto");
            }
            callback && callback.call(this);
        };

        if (duration > 0) {
            eventer.on(elm, endEvent, wrappedCallback);
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired
            langx.debounce(function() {
                if (fired) {
                    return;
                }
                wrappedCallback.call(that);
            }, ((duration + delay) * 1000) + 25)();
        }

        // trigger page reflow so new elements can animate
        elm.clientLeft;

        styler.css(elm, cssValues);

        if (duration <= 0) {
            langx.debounce(function() {
                if (fired) {
                    return;
                }
                wrappedCallback.call(that);
            }, 0)();
        }

        if (hasScrollTop) {
            scrollToTop(elm, properties["scrollTop"], duration, callback);
        }

        return this;
    }

    /*   
     * Display an element.
     * @param {Object} elm  
     * @param {String} speed
     * @param {Function} callback
     */
    function show(elm, speed, callback) {
        styler.show(elm);
        if (speed) {
            if (!callback && langx.isFunction(speed)) {
                callback = speed;
                speed = "normal";
            }
            styler.css(elm, "opacity", 0)
            animate(elm, { opacity: 1, scale: "1,1" }, speed, callback);
        }
        return this;
    }


    /*   
     * Hide an element.
     * @param {Object} elm  
     * @param {String} speed
     * @param {Function} callback
     */
    function hide(elm, speed, callback) {
        if (speed) {
            if (!callback && langx.isFunction(speed)) {
                callback = speed;
                speed = "normal";
            }
            animate(elm, { opacity: 0, scale: "0,0" }, speed, function() {
                styler.hide(elm);
                if (callback) {
                    callback.call(elm);
                }
            });
        } else {
            styler.hide(elm);
        }
        return this;
    }

    /*   
     * Set the vertical position of the scroll bar for an element.
     * @param {Object} elm  
     * @param {Number or String} pos
     * @param {Number or String} speed
     * @param {Function} callback
     */
    function scrollToTop(elm, pos, speed, callback) {
        var scrollFrom = parseInt(elm.scrollTop),
            i = 0,
            runEvery = 5, // run every 5ms
            freq = speed * 1000 / runEvery,
            scrollTo = parseInt(pos);

        var interval = setInterval(function() {
            i++;

            if (i <= freq) elm.scrollTop = (scrollTo - scrollFrom) / freq * i + scrollFrom;

            if (i >= freq + 1) {
                clearInterval(interval);
                if (callback) langx.debounce(callback, 1000)();
            }
        }, runEvery);
    }

    /*   
     * Display or hide an element.
     * @param {Object} elm  
     * @param {Number or String} speed
     * @param {Function} callback
     */
    function toggle(elm, speed, callback) {
        if (styler.isInvisible(elm)) {
            show(elm, speed, callback);
        } else {
            hide(elm, speed, callback);
        }
        return this;
    }

    /*   
     * Adjust the opacity of an element.
     * @param {Object} elm  
     * @param {Number or String} speed
     * @param {Number or String} opacity
     * @param {String} easing
     * @param {Function} callback
     */
    function fadeTo(elm, speed, opacity, easing, callback) {
        animate(elm, { opacity: opacity }, speed, easing, callback);
        return this;
    }


    /*   
     * Display an element by fading them to opaque.
     * @param {Object} elm  
     * @param {Number or String} speed
     * @param {String} easing
     * @param {Function} callback
     */
    function fadeIn(elm, speed, easing, callback) {
        var target = styler.css(elm, "opacity");
        if (target > 0) {
            styler.css(elm, "opacity", 0);
        } else {
            target = 1;
        }
        styler.show(elm);

        fadeTo(elm, speed, target, easing, callback);

        return this;
    }

    /*   
     * Hide an element by fading them to transparent.
     * @param {Object} elm  
     * @param {Number or String} speed
     * @param {String} easing
     * @param {Function} callback
     */
    function fadeOut(elm, speed, easing, callback) {
        var _elm = elm,
            complete,
            opacity = styler.css(elm,"opacity"),
            options = {};

        if (langx.isPlainObject(speed)) {
            options.easing = speed.easing;
            options.duration = speed.duration;
            complete = speed.complete;
        } else {
            options.duration = speed;
            if (callback) {
                complete = callback;
                options.easing = easing;
            } else {
                complete = easing;
            }
        }
        options.complete = function() {
            styler.css(elm,"opacity",opacity);
            styler.hide(elm);
            if (complete) {
                complete.call(elm);
            }
        }

        fadeTo(elm, options, 0);

        return this;
    }

    /*   
     * Display or hide an element by animating its opacity.
     * @param {Object} elm  
     * @param {Number or String} speed
     * @param {String} ceasing
     * @param {Function} callback
     */
    function fadeToggle(elm, speed, ceasing, allback) {
        if (styler.isInvisible(elm)) {
            fadeIn(elm, speed, easing, callback);
        } else {
            fadeOut(elm, speed, easing, callback);
        }
        return this;
    }

    /*   
     * Display an element with a sliding motion.
     * @param {Object} elm  
     * @param {Number or String} duration
     * @param {Function} callback
     */
    function slideDown(elm, duration, callback) {

        // get the element position to restore it then
        var position = styler.css(elm, 'position');

        // show element if it is hidden
        show(elm);

        // place it so it displays as usually but hidden
        styler.css(elm, {
            position: 'absolute',
            visibility: 'hidden'
        });

        // get naturally height, margin, padding
        var marginTop = styler.css(elm, 'margin-top');
        var marginBottom = styler.css(elm, 'margin-bottom');
        var paddingTop = styler.css(elm, 'padding-top');
        var paddingBottom = styler.css(elm, 'padding-bottom');
        var height = styler.css(elm, 'height');

        // set initial css for animation
        styler.css(elm, {
            position: position,
            visibility: 'visible',
            overflow: 'hidden',
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0
        });

        // animate to gotten height, margin and padding
        animate(elm, {
            height: height,
            marginTop: marginTop,
            marginBottom: marginBottom,
            paddingTop: paddingTop,
            paddingBottom: paddingBottom
        }, {
            duration: duration,
            complete: function() {
                if (callback) {
                    callback.apply(elm);
                }
            }
        });

        return this;
    }

    /*   
     * Hide an element with a sliding motion.
     * @param {Object} elm  
     * @param {Number or String} duration
     * @param {Function} callback
     */
    function slideUp(elm, duration, callback) {
        // active the function only if the element is visible
        if (geom.height(elm) > 0) {

            // get the element position to restore it then
            var position = styler.css(elm, 'position');

            // get the element height, margin and padding to restore them then
            var height = styler.css(elm, 'height');
            var marginTop = styler.css(elm, 'margin-top');
            var marginBottom = styler.css(elm, 'margin-bottom');
            var paddingTop = styler.css(elm, 'padding-top');
            var paddingBottom = styler.css(elm, 'padding-bottom');

            // set initial css for animation
            styler.css(elm, {
                visibility: 'visible',
                overflow: 'hidden',
                height: height,
                marginTop: marginTop,
                marginBottom: marginBottom,
                paddingTop: paddingTop,
                paddingBottom: paddingBottom
            });

            // animate element height, margin and padding to zero
            animate(elm, {
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0
            }, {
                // callback : restore the element position, height, margin and padding to original values
                duration: duration,
                queue: false,
                complete: function() {
                    hide(elm);
                    styler.css(elm, {
                        visibility: 'visible',
                        overflow: 'hidden',
                        height: height,
                        marginTop: marginTop,
                        marginBottom: marginBottom,
                        paddingTop: paddingTop,
                        paddingBottom: paddingBottom
                    });
                    if (callback) {
                        callback.apply(elm);
                    }
                }
            });
        }
        return this;
    }


    /*   
     * Display or hide an element with a sliding motion.
     * @param {Object} elm  
     * @param {Number or String} duration
     * @param {Function} callback
     */
    function slideToggle(elm, duration, callback) {

        // if the element is hidden, slideDown !
        if (geom.height(elm) == 0) {
            slideDown(elm, duration, callback);
        }
        // if the element is visible, slideUp !
        else {
            slideUp(elm, duration, callback);
        }
        return this;
    }

    function emulateTransitionEnd(elm,duration) {
        var called = false;
        eventer.one(elm,'transitionEnd', function () { 
            called = true;
        })
        var callback = function () { 
            if (!called) {
                eventer.trigger(elm,browser.support.transition.end) 
            }
        };
        setTimeout(callback, duration);
        
        return this;
    } 

    /*   
     *
     * @param {Node} elm
     * @param {Node} params
     */
    function overlay(elm, params) {
        var overlayDiv = noder.createElement("div", params);
        styler.css(overlayDiv, {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0x7FFFFFFF,
            opacity: 0.7
        });
        elm.appendChild(overlayDiv);
        return overlayDiv;

    }
    
    /*   
     * Replace an old node with the specified node.
     * @param {HTMLElement} elm
     * @param {Node} params
     */
    function throb(elm, params) {
        params = params || {};
        var self = this,
            text = params.text,
            style = params.style,
            time = params.time,
            callback = params.callback,
            timer,

            throbber = noder.createElement("div", {
                "class": params.className || "throbber"
            }),
            _overlay = overlay(throbber, {
                "class": 'overlay fade'
            }),
            throb = noder.createElement("div", {
                "class": "throb"
            }),
            textNode = noder.createTextNode(text || ""),
            remove = function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (throbber) {
                    noder.remove(throbber);
                    throbber = null;
                }
            },
            update = function(params) {
                if (params && params.text && throbber) {
                    textNode.nodeValue = params.text;
                }
            };
        if (params.style) {
            styler.css(throbber,params.style);
        }
        throb.appendChild(textNode);
        throbber.appendChild(throb);
        elm.appendChild(throbber);
        var end = function() {
            remove();
            if (callback) callback();
        };
        if (time) {
            timer = setTimeout(end, time);
        }

        return {
            remove: remove,
            update: update
        };
    }

    function fx() {
        return fx;
    }

    langx.mixin(fx, {
        off: false,

        speeds: {
            normal: 400,
            fast: 200,
            slow: 600
        },

        animate,
        emulateTransitionEnd,
        fadeIn,
        fadeOut,
        fadeTo,
        fadeToggle,
        hide,
        scrollToTop,

        slideDown,
        slideToggle,
        slideUp,
        show,
        throb,
        toggle
    });

    return skylark.attach("domx.fx", fx);
});
define('skylark-domx-fx/main',[
	"./fx",
	"skylark-domx-velm",
	"skylark-domx-query"	
],function(fx,velm,$){
    // from ./fx
    velm.delegate([
        "animate",
        "emulateTransitionEnd",
        "fadeIn",
        "fadeOut",
        "fadeTo",
        "fadeToggle",
        "hide",
        "scrollToTop",
        "slideDown",
        "slideToggle",
        "slideUp",
        "show",
        "toggle"
    ], fx);

    $.fn.hide =  $.wraps.wrapper_every_act(fx.hide, fx);

    $.fn.animate = $.wraps.wrapper_every_act(fx.animate, fx);
    $.fn.emulateTransitionEnd = $.wraps.wrapper_every_act(fx.emulateTransitionEnd, fx);

    $.fn.show = $.wraps.wrapper_every_act(fx.show, fx);
    $.fn.hide = $.wraps.wrapper_every_act(fx.hide, fx);
    $.fn.toogle = $.wraps.wrapper_every_act(fx.toogle, fx);
    $.fn.fadeTo = $.wraps.wrapper_every_act(fx.fadeTo, fx);
    $.fn.fadeIn = $.wraps.wrapper_every_act(fx.fadeIn, fx);
    $.fn.fadeOut = $.wraps.wrapper_every_act(fx.fadeOut, fx);
    $.fn.fadeToggle = $.wraps.wrapper_every_act(fx.fadeToggle, fx);

    $.fn.slideDown = $.wraps.wrapper_every_act(fx.slideDown, fx);
    $.fn.slideToggle = $.wraps.wrapper_every_act(fx.slideToggle, fx);
    $.fn.slideUp = $.wraps.wrapper_every_act(fx.slideUp, fx);

	return fx;
});
define('skylark-domx-fx', ['skylark-domx-fx/main'], function (main) { return main; });

define('skylark-domx/fx',[
    "skylark-domx-fx"
], function( fx) {
    return fx;
});
define('skylark-domx/geom',[
    "skylark-domx-geom"
], function( geom) {

    return geom;
});
define('skylark-domx-transforms/transforms',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-data",
    "skylark-domx-styler"
], function(skylark,langx,browser,datax,styler) {
  var css3Transform = browser.normalizeCssProperty("transform");

  function getMatrix(radian, x, y) {
    var Cos = Math.cos(radian), Sin = Math.sin(radian);
    return {
      M11: Cos * x, 
      M12: -Sin * y,
      M21: Sin * x, 
      M22: Cos * y
    };
  }

  function getZoom(scale, zoom) {
      return scale > 0 && scale > -zoom ? zoom :
        scale < 0 && scale < zoom ? -zoom : 0;
  }

    function change(el,d) {
      var matrix = getMatrix(d.radian, d.y, d.x);
      styler.css(el,css3Transform, "matrix("
        + matrix.M11.toFixed(16) + "," + matrix.M21.toFixed(16) + ","
        + matrix.M12.toFixed(16) + "," + matrix.M22.toFixed(16) + ", 0, 0)"
      );      
  }

  function transformData(el,d) {
    if (d) {
      datax.data(el,"transform",d);
    } else {
      d = datax.data(el,"transform") || {};
      d.radian = d.radian || 0;
      d.x = d.x || 1;
      d.y = d.y || 1;
      d.zoom = d.zoom || 1;
      return d;     
    }
  }

  var calcs = {
    //Vertical flip
    vertical : function (d) {
        d.radian = Math.PI - d.radian; 
        d.y *= -1;
    },

   //Horizontal flip
    horizontal : function (d) {
        d.radian = Math.PI - d.radian; 
        d.x *= -1;
    },

    //Rotate according to angle
    rotate : function (d,degress) {
        d.radian = degress * Math.PI / 180;; 
    },

    //Turn left 90 degrees
    left : function (d) {
        d.radian -= Math.PI / 2; 
    },

    //Turn right 90 degrees
    right : function (d) {
        d.radian += Math.PI / 2; 
    },
 
    //zoom
    scale: function (d,zoom) {
        var hZoom = getZoom(d.y, zoom), vZoom = getZoom(d.x, zoom);
        if (hZoom && vZoom) {
          d.y += hZoom; 
          d.x += vZoom;
        }
    }, 

    //zoom in
    zoomin: function (d) { 
      calcs.scale(d,0.1); 
    },
    
    //zoom out
    zoomout: function (d) { 
      calcs.scale(d,-0.1); 
    }

  };
  
  
  function _createApiMethod(calcFunc) {
    return function() {
      var args = langx.makeArray(arguments),
        el = args.shift(),
          d = transformData(el);
        args.unshift(d);
        calcFunc.apply(this,args)
        change(el,d);
        transformData(el,d);
    }
  }
  
  function transforms() {
    return transforms;
  }

  ["vertical","horizontal","rotate","left","right","scale","zoom","zoomin","zoomout"].forEach(function(name){
    transforms[name] = _createApiMethod(calcs[name]);
  });

  langx.mixin(transforms, {
    reset : function(el) {
      var d = {
        x : 1,
        y : 1,
        radian : 0,
      }
      change(el,d);
      transformData(el,d);
    }
  });


  return skylark.attach("domx.transforms", transforms);
});

define('skylark-domx-transforms/main',[
	"./transforms"
],function(transforms){
	return transforms;
});
define('skylark-domx-transforms', ['skylark-domx-transforms/main'], function (main) { return main; });

define('skylark-domx-images/images',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-styler",
    "skylark-domx-data",
    "skylark-domx-transforms",
    "skylark-domx-query"
], function(skylark,langx,eventer,noder,finder,geom,styler,datax,transforms,$) {

  function watch(imgs) {
    if (!langx.isArray(imgs)) {
      imgs = [imgs];
    }
    var totalCount = imgs.length,
        progressedCount = 0,
        successedCount = 0,
        faileredCount = 0,
        d = new langx.Deferred();


    function complete() {

      d.resolve({
        "total" : totalCount,
        "successed" : successedCount,
        "failered" : faileredCount,
        "imgs" : imgs 
      });
    }

    function progress(img,isLoaded) {

      progressedCount++;
      if (isLoaded) {
        successedCount ++ ; 
      } else {
        faileredCount ++ ;
      }

      // progress event
      d.progress({
        "img" : img,
        "isLoaded" : isLoaded,
        "progressed" : progressedCount,
        "total" : totalCount,
        "imgs" : imgs 
      });

      // check if completed
      if ( progressedCount == totalCount ) {
        complete();
      }
    }

    function check() {
      if (!imgs.length ) {
        complete();
        return;
      }

      imgs.forEach(function(img) {
        if (isCompleted(img)) {
          progress(img,isLoaded(img));
        } else {
          eventer.on(img,{
            "load" : function() {
              progress(img,true);
            },

            "error" : function() {
              progress(img,false);
            }
          });      
        }
      });
    }

    langx.defer(check);

    d.promise.totalCount = totalCount;
    return d.promise;
  }


  function isCompleted(img) {
     return img.complete && img.naturalWidth !== undefined;
  }

  function isLoaded(img) {
    return img.complete && img.naturalWidth !== 0;
  }

  function loaded(elm,options) {
    var imgs = [];

    options = options || {};

    function addBackgroundImage (elm1) {

      var reURL = /url\((['"])?(.*?)\1\)/gi;
      var matches = reURL.exec( styler.css(elm1,"background-image"));
      var url = matches && matches[2];
      if ( url ) {
        var img = new Image();
        img.src = url;
        imgs.push(img);
      }
    }

    // filter siblings
    if ( elm.nodeName == 'IMG' ) {
      imgs.push( elm );
    } else {
      // find children
      var childImgs = finder.findAll(elm,'img');
      // concat childElems to filterFound array
      for ( var i=0; i < childImgs.length; i++ ) {
        imgs.push(childImgs[i]);
      }

      // get background image on element
      if ( options.background === true ) {
        addBackgroundImage(elm);
      } else  if ( typeof options.background == 'string' ) {
        var children = finder.findAll(elm, options.background );
        for ( i=0; i < children.length; i++ ) {
          addBackgroundImage( children[i] );
        }
      }
    }

    return watch(imgs);
  }

  function preload(urls,options) {
      if (langx.isString(urls)) {
        urls = [urls];
      }
      var images = [];

      urls.forEach(function(url){
        var img = new Image();
        img.src = url;
        images.push(img);
      });

      return watch(images);
  }


  $.fn.imagesLoaded = function( options ) {
    return loaded(this,options);
  };


  function viewer(el,options) {
    var img ,
        style = {},
        clientSize = geom.clientSize(el),
        loadedCallback = options.loaded,
        faileredCallback = options.failered;

    function onload() {
        styler.css(img,{//居中
          top: (clientSize.height - img.offsetHeight) / 2 + "px",
          left: (clientSize.width - img.offsetWidth) / 2 + "px"
        });

        transforms.reset(img);

        styler.css(img,{
          visibility: "visible"
        });

        if (loadedCallback) {
          loadedCallback();
        }
    }

    function onerror() {

    }
    function _init() {
      style = styler.css(el,["position","overflow"]);
      if (style.position != "relative" && style.position != "absolute") { 
        styler.css(el,"position", "relative" );
      }
      styler.css(el,"overflow", "hidden" );

      img = new Image();

      styler.css(img,{
        position: "absolute",
        border: 0, padding: 0, margin: 0, width: "auto", height: "auto",
        visibility: "hidden"
      });

      img.onload = onload;
      img.onerror = onerror;

      noder.append(el,img);

      if (options.url) {
        _load(options.url);
      }
    }

    function _load(url) {
        img.style.visibility = "hidden";
        img.src = url;
    }

    function _dispose() {
        noder.remove(img);
        styler.css(el,style);
        img = img.onload = img.onerror = null;
    }

    _init();

    var ret =  {
      load : _load,
      dispose : _dispose
    };

    ["vertical","horizontal","rotate","left","right","scale","zoom","zoomin","zoomout","reset"].forEach(
      function(name){
        ret[name] = function() {
          var args = langx.makeArray(arguments);
          args.unshift(img);
          transforms[name].apply(null,args);
        }
      }
    );

    return ret;
  }

  $.fn.imagesViewer = function( options ) {
    return viewer(this,options);
  };

  function images() {
    return images;
  }

  images.transform = function (el,options) {
  };

  ["vertical","horizontal","rotate","left","right","scale","zoom","zoomin","zoomout","reset"].forEach(
    function(name){
      images.transform[name] = transforms[name];
    }
  );


  langx.mixin(images, {
    isCompleted : isCompleted,

    isLoaded : isLoaded,

    loaded : loaded,

    preload : preload,

    viewer : viewer
  });

  return skylark.attach("domx.images" , images);
});

define('skylark-domx-images/main',[
	"./images"
],function(images){
	return images;
});
define('skylark-domx-images', ['skylark-domx-images/main'], function (main) { return main; });

define('skylark-domx/images',[
    "skylark-domx-images"
], function(images) {
  return images;
});

define('skylark-domx/noder',[
    "skylark-domx-noder"
], function( noder) {

    return noder;
});
define('skylark-domx-plugins/plugins',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-data",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-geom",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-query",
    "skylark-domx-velm"
], function(skylark, langx, noder, datax, eventer, finder, geom, styler, fx, $, elmx) {
    "use strict";

    var slice = Array.prototype.slice,
        concat = Array.prototype.concat,
        pluginKlasses = {},
        shortcuts = {};

    /*
     * Create or get or destory a plugin instance assocated with the element.
     */
    function instantiate(elm,pluginName,options) {
        var pair = pluginName.split(":"),
            instanceDataName = pair[1];
        pluginName = pair[0];

        if (!instanceDataName) {
            instanceDataName = pluginName;
        }

        var pluginInstance = datax.data( elm, instanceDataName );

        if (options === "instance") {
            return pluginInstance;
        } else if (options === "destroy") {
            if (!pluginInstance) {
                throw new Error ("The plugin instance is not existed");
            }
            pluginInstance.destroy();
            datax.removeData( elm, pluginName);
            pluginInstance = undefined;
        } else {
            if (!pluginInstance) {
                if (options !== undefined && typeof options !== "object") {
                    throw new Error ("The options must be a plain object");
                }
                var pluginKlass = pluginKlasses[pluginName]; 
                pluginInstance = new pluginKlass(elm,options);
                datax.data( elm, instanceDataName,pluginInstance );
            } else if (options) {
                pluginInstance.reset(options);
            }
        }

        return pluginInstance;
    }


    function shortcutter(pluginName,extfn) {
       /*
        * Create or get or destory a plugin instance assocated with the element,
        * and also you can execute the plugin method directory;
        */
        return function (elm,options) {
            var  plugin = instantiate(elm, pluginName,"instance");
            if ( options === "instance" ) {
              return plugin || null;
            }

            if (!plugin) {
                plugin = instantiate(elm, pluginName,typeof options == 'object' && options || {});
                if (typeof options != "string") {
                  return this;
                }
            } 
            if (options) {
                var args = slice.call(arguments,1); //2
                if (extfn) {
                    return extfn.apply(plugin,args);
                } else {
                    if (typeof options == 'string') {
                        var methodName = options;

                        if ( !plugin ) {
                            throw new Error( "cannot call methods on " + pluginName +
                                " prior to initialization; " +
                                "attempted to call method '" + methodName + "'" );
                        }

                        if ( !langx.isFunction( plugin[ methodName ] ) || methodName.charAt( 0 ) === "_" ) {
                            throw new Error( "no such method '" + methodName + "' for " + pluginName +
                                " plugin instance" );
                        }

                        var ret = plugin[methodName].apply(plugin,args);
                        if (ret == plugin) {
                          ret = undefined;
                        }

                        return ret;
                    }                
                }                
            }

        }

    }

    /*
     * Register a plugin type
     */
    function register( pluginKlass,shortcutName,instanceDataName,extfn) {
        var pluginName = pluginKlass.prototype.pluginName;
        
        pluginKlasses[pluginName] = pluginKlass;

        if (shortcutName) {
            if (instanceDataName && langx.isFunction(instanceDataName)) {
                extfn = instanceDataName;
                instanceDataName = null;
            } 
            if (instanceDataName) {
                pluginName = pluginName + ":" + instanceDataName;
            }

            var shortcut = shortcuts[shortcutName] = shortcutter(pluginName,extfn);
                
            $.fn[shortcutName] = function(options) {
                var returnValue = this;

                if ( !this.length && options === "instance" ) {
                  returnValue = undefined;
                } else {
                  var args = slice.call(arguments);
                  this.each(function () {
                    var args2 = slice.call(args);
                    args2.unshift(this);
                    var  ret  = shortcut.apply(undefined,args2);
                    if (ret !== undefined) {
                        returnValue = ret;
                    }
                  });
                }

                return returnValue;
            };

            elmx.partial(shortcutName,function(options) {
                var  ret  = shortcut(this._elm,options);
                if (ret === undefined) {
                    ret = this;
                }
                return ret;
            });

        }
    }

 
    var Plugin =   langx.Evented.inherit({
        klassName: "Plugin",

        _construct : function(elm,options) {
           this._elm = elm;
           this._initOptions(options);
        },

        _initOptions : function(options) {
          var ctor = this.constructor,
              cache = ctor.cache = ctor.cache || {},
              defaults = cache.defaults;
          if (!defaults) {
            var  ctors = [];
            do {
              ctors.unshift(ctor);
              if (ctor === Plugin) {
                break;
              }
              ctor = ctor.superclass;
            } while (ctor);

            defaults = cache.defaults = {};
            for (var i=0;i<ctors.length;i++) {
              ctor = ctors[i];
              if (ctor.prototype.hasOwnProperty("options")) {
                langx.mixin(defaults,ctor.prototype.options,true);
              }
              if (ctor.hasOwnProperty("options")) {
                langx.mixin(defaults,ctor.options,true);
              }
            }
          }
          Object.defineProperty(this,"options",{
            value :langx.mixin({},defaults,options,true)
          });

          //return this.options = langx.mixin({},defaults,options);
          return this.options;
        },


        destroy: function() {
            var that = this;

            this._destroy();
            // We can probably remove the unbind calls in 2.0
            // all event bindings should go through this._on()
            datax.removeData(this._elm,this.pluginName );
        },

        _destroy: langx.noop,

        _delay: function( handler, delay ) {
            function handlerProxy() {
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }
            var instance = this;
            return setTimeout( handlerProxy, delay || 0 );
        },

        option: function( key, value ) {
            var options = key;
            var parts;
            var curOption;
            var i;

            if ( arguments.length === 0 ) {

                // Don't return a reference to the internal hash
                return langx.mixin( {}, this.options );
            }

            if ( typeof key === "string" ) {

                // Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
                options = {};
                parts = key.split( "." );
                key = parts.shift();
                if ( parts.length ) {
                    curOption = options[ key ] = langx.mixin( {}, this.options[ key ] );
                    for ( i = 0; i < parts.length - 1; i++ ) {
                        curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                        curOption = curOption[ parts[ i ] ];
                    }
                    key = parts.pop();
                    if ( arguments.length === 1 ) {
                        return curOption[ key ] === undefined ? null : curOption[ key ];
                    }
                    curOption[ key ] = value;
                } else {
                    if ( arguments.length === 1 ) {
                        return this.options[ key ] === undefined ? null : this.options[ key ];
                    }
                    options[ key ] = value;
                }
            }

            this._setOptions( options );

            return this;
        },

        _setOptions: function( options ) {
            var key;

            for ( key in options ) {
                this._setOption( key, options[ key ] );
            }

            return this;
        },

        _setOption: function( key, value ) {

            this.options[ key ] = value;

            return this;
        },

        getUID : function (prefix) {
            prefix = prefix || "plugin";
            do prefix += ~~(Math.random() * 1000000)
            while (document.getElementById(prefix))
            return prefix;
        },

        elm : function() {
            return this._elm;
        }

    });

    $.fn.plugin = function(name,options) {
        var args = slice.call( arguments, 1 ),
            self = this,
            returnValue = this;

        this.each(function(){
            returnValue = instantiate.apply(self,[this,name].concat(args));
        });
        return returnValue;
    };

    elmx.partial("plugin",function(name,options) {
        var args = slice.call( arguments, 1 );
        return instantiate.apply(this,[this.domNode,name].concat(args));
    }); 


    function plugins() {
        return plugins;
    }
     
    langx.mixin(plugins, {
        instantiate,
        Plugin,
        register,
        shortcuts
    });

    return  skylark.attach("domx.plugins",plugins);
});
define('skylark-domx-plugins/main',[
	"./plugins"
],function(plugins){
	return plugins;
});
define('skylark-domx-plugins', ['skylark-domx-plugins/main'], function (main) { return main; });

define('skylark-domx/plugins',[
    "skylark-domx-plugins"
], function( plugins) {
    "use strict";
    return plugins;
});
define('skylark-domx/styler',[
    "skylark-domx-styler"
], function( styler) {

    return styler;
});
define('skylark-domx/query',[
    "skylark-domx-query",
    "./data",
    "./eventer",
    "./fx",
    "./geom",
    "./styler"
], function( query) {

    return query;

});
define('skylark-domx-scripter/scripter',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-noder",
    "skylark-domx-finder"
], function(skylark, langx, noder, finder) {

    var head = document.getElementsByTagName('head')[0],
        scriptsByUrl = {},
        scriptElementsById = {},
        count = 0;

    var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );

    function scripter() {
        return scripter;
    }


    var preservedScriptAttributes = {
        type: true,
        src: true,
        nonce: true,
        noModule: true
    };

    function evaluate(code,node, doc ) {
        doc = doc || document;

        var i, val,
            script = doc.createElement("script");

        script.text = code;
        if ( node ) {
            for ( i in preservedScriptAttributes ) {

                // Support: Firefox 64+, Edge 18+
                // Some browsers don't support the "nonce" property on scripts.
                // On the other hand, just using `getAttribute` is not enough as
                // the `nonce` attribute is reset to an empty string whenever it
                // becomes browsing-context connected.
                // See https://github.com/whatwg/html/issues/2369
                // See https://html.spec.whatwg.org/#nonce-attributes
                // The `node.getAttribute` check was added for the sake of
                // `jQuery.globalEval` so that it can fake a nonce-containing node
                // via an object.
                val = node[ i ] || node.getAttribute && node.getAttribute( i );
                if ( val ) {
                    script.setAttribute( i, val );
                }
            }
        }
        doc.head.appendChild( script ).parentNode.removeChild( script );

        return this;
    }

    langx.mixin(scripter, {
        /*
         * Load a script from a url into the document.
         * @param {} url
         * @param {} loadedCallback
         * @param {} errorCallback
         */
        loadJavaScript: function(url, loadedCallback, errorCallback) {
            var script = scriptsByUrl[url];
            if (!script) {
                script = scriptsByUrl[url] = {
                    state: 0, //0:unload,1:loaded,-1:loaderror
                    loadedCallbacks: [],
                    errorCallbacks: []
                }
            }

            script.loadedCallbacks.push(loadedCallback);
            script.errorCallbacks.push(errorCallback);

            if (script.state === 1) {
                script.node.onload();
            } else if (script.state === -1) {
                script.node.onerror();
            } else {
                var node = script.node = document.createElement("script"),
                    id = script.id = (count++);

                node.type = "text/javascript";
                node.async = false;
                node.defer = false;
                startTime = new Date().getTime();
                head.appendChild(node);

                node.onload = function() {
                        script.state = 1;

                        var callbacks = script.loadedCallbacks,
                            i = callbacks.length;

                        while (i--) {
                            callbacks[i]();
                        }
                        script.loadedCallbacks = [];
                        script.errorCallbacks = [];
                    },
                    node.onerror = function() {
                        script.state = -1;
                        var callbacks = script.errorCallbacks,
                            i = callbacks.length;

                        while (i--) {
                            callbacks[i]();
                        }
                        script.loadedCallbacks = [];
                        script.errorCallbacks = [];
                    };
                node.src = url;

                scriptElementsById[id] = node;
            }
            return script.id;
        },
        /*
         * Remove the specified script from the document.
         * @param {Number} id
         */
        deleteJavaScript: function(id) {
            var node = scriptElementsById[id];
            if (node) {
                var url = node.src;
                noder.remove(node);
                delete scriptElementsById[id];
                delete scriptsByUrl[url];
            }
        },

        evaluate : evaluate,

        html : function(node,value) {

            var result = noder.html(node,value);

            if (value !== undefined) {
                var scripts = node.querySelectorAll('script');

                for (var i =0; i<scripts.length; i++) {
                    var node1 = scripts[i];
                    if (rscriptType.test( node1.type || "" ) ) {
                      evaluate(node1.textContent,node1);
                    }
                }       
                return this;         
            } else {
                return result;
            }



        }
    });

    return skylark.attach("domx.scripter", scripter);
});
define('skylark-domx-scripter/main',[
	"./scripter",
	"skylark-domx-query"
],function(scripter,$){

    $.fn.html = $.wraps.wrapper_value(scripter.html, scripter, scripter.html);

	return scripter;
});
define('skylark-domx-scripter', ['skylark-domx-scripter/main'], function (main) { return main; });

define('skylark-domx/scripter',[
    "skylark-domx-scripter"
], function( scripter) {

    return scripter;
});
define('skylark-domx/transforms',[
    "skylark-domx-transforms"
], function(transforms) {
  return transforms;
});

define('skylark-domx/velm',[
    "skylark-domx-velm",
    "./data",
    "./eventer",
    "./fx",
    "./geom",
    "./styler"
], function( velm) {
     return velm;
});
define('skylark-domx/main',[
    "./browser",
    "./css",
    "./data",
    "./eventer",
    "./finder",
    "./fx",
    "./geom",
    "./images",
    "./noder",
    "./plugins",
    "./query",
    "./scripter",
    "./styler",
    "./transforms",
    "./velm"
], function(browser,css,data,eventer,finder,fx,geom,images,noder,plugins,query,scripter,styler,transforms,velm) {
    return {
        browser,
        css,
        data,
        eventer,
        finder,
        geom,
        images,
        noder,
        plugins,
        query,
        scripter,
        styler,
        transforms,
        velm
    };
})
;
define('skylark-domx', ['skylark-domx/main'], function (main) { return main; });

define('skylark-domx-files/files',[
    "skylark-langx/skylark"
], function(skylark) {

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }


    var files = function() {
        return files;
    };

    return skylark.attach("domx.files", files);
});
define('skylark-io-diskfs/diskfs',[
    "skylark-langx/skylark"
], function(skylark) {

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }


    var diskfs = function() {
        return diskfs;
    };

    return skylark.attach("storages.diskfs", diskfs);
});
 define('skylark-io-diskfs/webentry',[
    "skylark-langx/arrays",
    "skylark-langx/Deferred",
    "./diskfs"
],function(arrays,Deferred, diskfs){
    var concat = Array.prototype.concat;
    var webentry = (function() {
        function one(entry, path) {
            var d = new Deferred(),
                onError = function(e) {
                    d.reject(e);
                };

            path = path || '';
            if (entry.isFile) {
                entry.file(function(file) {
                    file.relativePath = path;
                    d.resolve(file);
                }, onError);
            } else if (entry.isDirectory) {
                var dirReader = entry.createReader();
                dirReader.readEntries(function(entries) {
                    all(
                        entries,
                        path + entry.name + '/'
                    ).then(function(files) {
                        d.resolve(files);
                    }).catch(onError);
                }, onError);
            } else {
                // Return an empy list for file system items
                // other than files or directories:
                d.resolve([]);
            }
            return d.promise;
        }

        function all(entries, path) {
            return Deferred.all(
                arrays.map(entries, function(entry) {
                    return one(entry, path);
                })
            ).then(function() {
                return concat.apply([], arguments);
            });
        }

        return {
            one: one,
            all: all
        };
    })();

    return diskfs.webentry = webentry;
});
  define('skylark-domx-files/dropzone',[
    "skylark-langx/arrays",
    "skylark-langx/Deferred",
    "skylark-domx-styler",
    "skylark-domx-eventer",
    "./files",
    "skylark-io-diskfs/webentry"
],function(arrays,Deferred, styler, eventer, files, webentry){  /*
     * Make the specified element to could accept HTML5 file drag and drop.
     * @param {HTMLElement} elm
     * @param {PlainObject} params
     */
    function dropzone(elm, params) {
        params = params || {};
        var hoverClass = params.hoverClass || "dropzone",
            droppedCallback = params.dropped;

        var enterdCount = 0;
        eventer.on(elm, "dragenter", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                eventer.stop(e);
                enterdCount++;
                styler.addClass(elm, hoverClass)
            }
        });

        eventer.on(elm, "dragover", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                eventer.stop(e);
            }
        });

        eventer.on(elm, "dragleave", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                enterdCount--
                if (enterdCount == 0) {
                    styler.removeClass(elm, hoverClass);
                }
            }
        });

        eventer.on(elm, "drop", function(e) {
            if (e.dataTransfer && e.dataTransfer.types.indexOf("Files") > -1) {
                styler.removeClass(elm, hoverClass)
                eventer.stop(e);
                if (droppedCallback) {
                    var items = e.dataTransfer.items;
                    if (items && items.length && (items[0].webkitGetAsEntry ||
                            items[0].getAsEntry)) {
                        webentry.all(
                            arrays.map(items, function(item) {
                                if (item.webkitGetAsEntry) {
                                    return item.webkitGetAsEntry();
                                }
                                return item.getAsEntry();
                            })
                        ).then(droppedCallback);
                    } else {
                        droppedCallback(e.dataTransfer.files);
                    }
                }
            }
        });

        return this;
    }

     return files.dropzone = dropzone;
});
define('skylark-domx-files/pastezone',[
    "skylark-langx/objects",
    "skylark-domx-eventer",
    "./files"
],function(objects, eventer, files){
    function pastezone(elm, params) {
        params = params || {};
        var hoverClass = params.hoverClass || "pastezone",
            pastedCallback = params.pasted;

        eventer.on(elm, "paste", function(e) {
            var items = e.originalEvent && e.originalEvent.clipboardData &&
                e.originalEvent.clipboardData.items,
                files = [];
            if (items && items.length) {
                objects.each(items, function(index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                });
            }
            if (pastedCallback && files.length) {
                pastedCallback(files);
            }
        });

        return this;
    }

    return files.pastezone = pastezone;

});

define('skylark-io-diskfs/select',[
    "./diskfs"
],function(diskfs){
    var fileInput,
        fileInputForm,
        fileSelected,
        maxFileSize = 1 / 0;

    function select(params) {
        params = params || {};
        var directory = params.directory || false,
            multiple = params.multiple || false,
            accept = params.accept || "", //'image/gif,image/jpeg,image/jpg,image/png,image/svg'
            title = params.title || "",
            fileSelected = params.picked;
        if (!fileInput) {
            var input = fileInput = document.createElement("input");

            function selectFiles(pickedFiles) {
                for (var i = pickedFiles.length; i--;) {
                    if (pickedFiles[i].size > maxFileSize) {
                        pickedFiles.splice(i, 1);
                    }
                }
                fileSelected(pickedFiles);
            }

            input.type = "file";
            input.style.position = "fixed";
            input.style.left = 0;
            input.style.top = 0;
            input.style.opacity = .001;
            document.body.appendChild(input);

            input.onchange = function(e) {
                var entries = e.target.webkitEntries || e.target.entries;

                if (entries && entries.length) {
                    webentry.all(entries).then(function(files) {
                        selectFiles(files);
                    });
                } else {
                    selectFiles(Array.prototype.slice.call(e.target.files));
                }
                // reset to "", so selecting the same file next time still trigger the change handler
                input.value = "";
            };
        }
        fileInput.multiple = multiple;
        fileInput.accept = accept;
        fileInput.title = title;

        fileInput.webkitdirectory = directory;
        fileInput.click();
    }

    return diskfs.select = select;
});


define('skylark-domx-files/picker',[
    "skylark-langx/objects",
    "skylark-domx-eventer",
    "./files",
    "skylark-io-diskfs/select"
],function(objects, eventer, files, select){
    /*
     * Make the specified element to pop-up the file selection dialog box when clicked , and read the contents the files selected from client file system by user.
     * @param {HTMLElement} elm
     * @param {PlainObject} params
     */
    function picker(elm, params) {
        eventer.on(elm, "click", function(e) {
            e.preventDefault();
            select(params);
        });
        return this;
    }

    return files.picker = picker;

});



define('skylark-net-http/Upload',[
    "skylark-langx-types",
    "skylark-langx-objects",
    "skylark-langx-arrays",
    "skylark-langx-async/Deferred",
    "skylark-langx-emitter/Evented",    
    "./Xhr",
    "./http"
],function(types, objects, arrays, Deferred, Evented,Xhr, http){

    var blobSlice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;


    /*
     *Class for uploading files using xhr.
     */
    var Upload = Evented.inherit({
        klassName : "Upload",

        _construct : function(options) {
            this._options = objects.mixin({
                debug: false,
                url: '/upload',
                // maximum number of concurrent uploads
                maxConnections: 999,
                // To upload large files in smaller chunks, set the following option
                // to a preferred maximum chunk size. If set to 0, null or undefined,
                // or the browser does not support the required Blob API, files will
                // be uploaded as a whole.
                maxChunkSize: undefined,

                onProgress: function(id, fileName, loaded, total){
                },
                onComplete: function(id, fileName){
                },
                onCancel: function(id, fileName){
                },
                onFailure : function(id,fileName,e) {                    
                }
            },options);

            this._queue = [];
            // params for files in queue
            this._params = [];

            this._files = [];
            this._xhrs = [];

            // current loaded size in bytes for each file
            this._loaded = [];

        },

        /**
         * Adds file to the queue
         * Returns id to use with upload, cancel
         **/
        add: function(file){
            return this._files.push(file) - 1;
        },

        /**
         * Sends the file identified by id and additional query params to the server.
         */
        send: function(id, params){
            if (!this._files[id]) {
                // Already sended or canceled
                return ;
            }
            if (this._queue.indexOf(id)>-1) {
                // Already in the queue
                return;
            }
            var len = this._queue.push(id);

            var copy = objects.clone(params);

            this._params[id] = copy;

            // if too many active uploads, wait...
            if (len <= this._options.maxConnections){
                this._send(id, this._params[id]);
            }     
        },

        /**
         * Sends all files  and additional query params to the server.
         */
        sendAll: function(params){
           for( var id = 0; id <this._files.length; id++) {
                this.send(id,params);
            }
        },

        /**
         * Cancels file upload by id
         */
        cancel: function(id){
            this._cancel(id);
            this._dequeue(id);
        },

        /**
         * Cancells all uploads
         */
        cancelAll: function(){
            for (var i=0; i<this._queue.length; i++){
                this._cancel(this._queue[i]);
            }
            this._queue = [];
        },

        getName: function(id){
            var file = this._files[id];
            return file.fileName != null ? file.fileName : file.name;
        },

        getSize: function(id){
            var file = this._files[id];
            return file.fileSize != null ? file.fileSize : file.size;
        },

        /**
         * Returns uploaded bytes for file identified by id
         */
        getLoaded: function(id){
            return this._loaded[id] || 0;
        },


        /**
         * Sends the file identified by id and additional query params to the server
         * @param {Object} params name-value string pairs
         */
        _send: function(id, params){
            var options = this._options,
                name = this.getName(id),
                size = this.getSize(id),
                chunkSize = options.maxChunkSize || 0,
                curUploadingSize,
                curLoadedSize = 0,
                file = this._files[id],
                args = {
                    headers : {
                    }                    
                };

            this._loaded[id] = this._loaded[id] || 0;

            var xhr = this._xhrs[id] = new Xhr({
                url : options.url
            });

            if (chunkSize)  {

                args.data = blobSlice.call(
                    file,
                    this._loaded[id],
                    this._loaded[id] + chunkSize,
                    file.type
                );
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                curUploadingSize = args.data.size;
                // Expose the chunk bytes position range:
                args.headers["content-range"] = 'bytes ' + this._loaded[id] + '-' +
                    (this._loaded[id] + curUploadingSize - 1) + '/' + size;
                args.headers["Content-Type"] = "application/octet-stream";
            }  else {
                curUploadingSize = size;
                var formParamName =  params.formParamName,
                    formData = params.formData;

                if (formParamName) {
                    if (!formData) {
                        formData = new FormData();
                    }
                    formData.append(formParamName,file);
                    args.data = formData;
    
                } else {
                    args.headers["Content-Type"] = file.type || "application/octet-stream";
                    args.data = file;
                }
            }


            var self = this;
            xhr.post(
                args
            ).progress(function(e){
                if (e.lengthComputable){
                    curLoadedSize = curLoadedSize + e.loaded;
                    self._loaded[id] = self._loaded[id] + e.loaded;
                    self._options.onProgress(id, name, self._loaded[id], size);
                }
            }).then(function(){
                if (!self._files[id]) {
                    // the request was aborted/cancelled
                    return;
                }

                if (curLoadedSize < curUploadingSize) {
                    // Create a progress event if no final progress event
                    // with loaded equaling total has been triggered
                    // for this chunk:
                    self._loaded[id] = self._loaded[id] + curUploadingSize - curLoadedSize;
                    self._options.onProgress(id, name, self._loaded[id], size);                    
                }

                if (self._loaded[id] <size) {
                    // File upload not yet complete,
                    // continue with the next chunk:
                    self._send(id,params);
                } else {
                    self._options.onComplete(id,name);

                    self._files[id] = null;
                    self._xhrs[id] = null;
                    self._dequeue(id);
                }


            }).catch(function(e){
                self._options.onFailure(id,name,e);

                self._files[id] = null;
                self._xhrs[id] = null;
                self._dequeue(id);
            });
        },

        _cancel: function(id){
            this._options.onCancel(id, this.getName(id));

            this._files[id] = null;

            if (this._xhrs[id]){
                this._xhrs[id].abort();
                this._xhrs[id] = null;
            }
        },

        /**
         * Returns id of files being uploaded or
         * waiting for their turn
         */
        getQueue: function(){
            return this._queue;
        },


        /**
         * Removes element from queue, starts upload of next
         */
        _dequeue: function(id){
            var i = arrays.inArray(id,this._queue);
            this._queue.splice(i, 1);

            var max = this._options.maxConnections;

            if (this._queue.length >= max && i < max){
                var nextId = this._queue[max-1];
                this._send(nextId, this._params[nextId]);
            }
        }
    });

    return http.Upload = Upload;    
});
define('skylark-domx-files/MultiUploader',[
  "skylark-langx/skylark",
  "skylark-langx/langx",
  "skylark-domx-query",
  "skylark-domx-velm",
  "skylark-net-http/Upload",
  "skylark-domx-plugins",
  "./files"
]  ,function(skylark,langx,$, elmx,FileUpload, plugins,files){

    var fileListTemplate = '<div class="lark-multiuploader">' + 
        '    <h3 class="popover-title">Upload files</h3>' + 
        '    <div class="popover-content container-fluid" class="file-list file-dropzone file-pastezone">' + 
        '        <div class="no-data"><em>Add files.</em></div>' + 
        '    </div>' + 
        '    <footer>' + 
        '        <button class="btn btn-warning pull-right btn-sm" id="cancel-uploads-button"><i class="icon-cancel"></i>Cancel uploads</button>' + 
        '        <span class="btn btn-success fileinput-button btn-sm" id="fileinput-button">' + 
        '            <i class="icon-plus"></i>' + 
        '            <span>Add files...</span>' + 
        '            <input id="fileupload" type="file" name="files[]" multiple="multiple">' + 
        '        </span>' + 
        '        <button class="btn btn-primary btn-sm" id="start-uploads-button"><i class="icon-start"></i>Start uploads</button>' + 
        '    </footer>' + 
        '</div>',
        fileItemTemplate = '<div class="file-item row">' +
        '   <div class="col-md-6"><span class="name"></span></div>' + 
        '   <div class="col-md-3">' +
        '    <span class="size"></span>' +
        '    <div class="progress hidden">' +
        '        <div class="progress-label"></div>' +
        '        <div class="bar"></div>' +
        '    </div>' +
        '    <span class="message hidden"></span>' +
        '   </div>' +
        '   <div class="col-md-3">' +
        '    <button class="btn btn-warning btn-xs cancel"><i class="icon-remove"></i>Cancel</button>' +
        '    <button class="btn btn-xs clear hidden">Clear</button>' +
        '   </div>' +
        '</div>';

    var MultiUploader =  plugins.Plugin.inherit({
        klassName : "Uploader",
        pluginName : "lark.multiuploader",

        options: {
            uploadUrl: '/upload',

        	params: {
                formParamName : "file"
            },

    	    maxConnections: 3,
        	// validation
        	allowedExtensions: [],
        	sizeLimit: 0,
        	minSizeLimit: 0,

            autoUpload: false,
            selectors : {
              fileList : ".file-list",
              fileItem : ".file-item",
              nodata : ".file-list .no-data",

              picker   : ".file-picker",
              dropzone : ".file-dropzone",
              pastezone: ".file-pastezone",

              startUploads: '.start-uploads',
              cancelUploads: '.cancel-uploads',
            },

            template : fileListTemplate,

            dataType: 'json',

            fileItem : {
            	selectors : {
                    name : ".name",
                    size : ".size",
                    cancel: ".cancel",
                    clear : ".clear",
                    progress : ".progress",
                    message : ".message"                   
            	},

            	template : fileItemTemplate
            }
        },


        _construct : function(elm,options) {
            var self = this;


            // Render current files
            /*
            this.files.forEach(function (file) {
                self.renderFile(file);
            });
            */

            //this._refresh({files:true});
        

            //this._files.on('all', function(){
            //  self._refresh({files:true});
            //});


           this.overrided(elm,options);


           this._velm = elmx(this._elm);
        


            this._initEventHandler();
            this._initFileHandlers();
            this._initUpoadHandler();
            this._updateFileList();
        },

        _initFileHandlers : function() {
            var self = this;

            var selectors = this.options.selectors,
            	dzSelector = selectors.dropzone,
            	pzSelector = selectors.pastezone,
            	pkSelector = selectors.picker;

            if (dzSelector) {
				this._velm.$(dzSelector).dropzone({
	                dropped : function (files) {
                        self._addFiles(files);
	                }
				});
            }


            if (pzSelector) {
                this._velm.$(pzSelector).pastezone({
                    pasted : function (files) {
                        self._addFiles(files);
                    }
                });                
            }

            if (pkSelector) {
                this._velm.$(pkSelector).picker({
                    multiple: true,
                    picked : function (files) {
                        self._addFiles(files);
                    }
                });                
            }
        },

        _initUpoadHandler: function(){
            var self = this,
                handlerClass;

            this._handler = new FileUpload({
                url: this.options.uploadUrl,
                maxConnections: this.options.maxConnections,
                onProgress: function(id, fileName, loaded, total){
                    self._onProgress(id, fileName, loaded, total);
                },
                onComplete: function(id, fileName, result){
                    self._onComplete(id, fileName, result);
                },
                onCancel: function(id, fileName){
                    self._onCancel(id, fileName);
                },
                onFailure: function(id,fileName,e){
                    self._onFailure(id,fileName,e);
                }
            });
        },
        
         /**
         * delegate click event for cancel link
         **/
        _initEventHandler: function(){
            var self = this,
               selectors = this.options.selectors,
               itemSelectors = this.options.fileItem.selectors, 
               list = this._listElement;

            // Add cancel handler
            this._velm.$(selectors.fileList).on("click",itemSelectors.cancel,function(e){
                var $fileItem = $(this).closest(selectors.fileItem),
                    fileId = $fileItem.data("fileId");
                self._handler.cancel(fileId);
                $fileItem.remove();
                self._updateFileList();
            });

            // Add clear handler
            this._velm.$(selectors.fileList).on("click",itemSelectors.clear,function(e){
                var $fileItem = $(this).closest(selectors.fileItem),
                    fileId = $fileItem.data("fileId");
                $fileItem.remove();
                self._updateFileList();
            });

            // Add cancel all handler
            this._velm.$(selectors.cancelUploads).click(function(){
                var $files = self._velm.$(selectors.fileList).find(selectors.fileItem);           
                $files.forEach(function(fileItem){
                    var $fileItem = $(fileItem),
                        fileId = $fileItem.data("fileId");
                    self._handler.cancel(fileId);
                    $fileItem.remove();
                });
                self._updateFileList();

            });

            // Add start uploads handler
            this._velm.$(selectors.startUploads).click(function(){
                var $files = self._velm.$(selectors.fileList).find(selectors.fileItem);           
                $files.forEach(function(fileItem){
                    var $fileItem = $(fileItem),
                        fileId = $fileItem.data("fileId");
                    if (!$fileItem.data("status")) {
                        // The file has not yet been sent
                        self._handler.send(fileId,self.options.params);
                    }
                });

            });
            

        },       

        _onProgress: function(id, fileName, loaded, total){          
            var $item = this._getItemByFileId(id);

            var percent = parseInt(loaded / total * 100, 10);
            var progressHTML = this._formatSize(loaded)+' of '+ this._formatSize(total);

            $item.data("status","running");
            $item.find('.progress')
                .find('.bar')
                .css('width', percent+'%')
                .parent()
                .find('.progress-label')
                .html(progressHTML);
            this._updateFile($item);

        },

        _onComplete: function(id, fileName, result){
            this._filesInProgress--;
            var $item = this._getItemByFileId(id);
            $item.data("status","done");
            $item.find('.message').html('<i class="icon-success"></i> ' + (this.doneMsg || 'Uploaded'));
            this._updateFile($item);
        },

        _onFailure : function(id,fileName,e) {
            this._filesInProgress--;
            var $item = this._getItemByFileId(id);
            $item.data("status","error");
            $item.find('.message').html('<i class="icon-error"></i> ');;
            this._updateFile($item)

        },

        _onCancel: function(id, fileName){
            this._filesInProgress--;
            var $item = this._getItemByFileId(id);
            $item.data("status","cancel");
            this._updateFile($item)
        },

        _addToList: function(id, fileName){
            var self = this;


            var fileName = this._handler.getName(id),
                fileSize = this._handler.getSize(id);

            var item = $(this.options.fileItem.template);
            item.data("fileId",id);

            item.find(this.options.fileItem.selectors.name).html(this._formatFileName(fileName));
            item.find(this.options.fileItem.selectors.size).html(this._formatSize(fileSize));

            this._velm.$(this.options.selectors.fileList).append(item);

            this._updateFileList();
        },
    
        _updateFileList : function ()  {
            var selectors = this.options.selectors,
                itemSelectors = this.options.fileItem.selectors,
                files = this._velm.$(selectors.fileList).find(selectors.fileItem);

            var with_files_elements = this._velm.$(selectors.cancelUploads + ',' + selectors.startUploads);
            var without_files_elements = this._velm.$(selectors.nodata);
            if (files.length > 0) {
                with_files_elements.removeClass('hidden');
                without_files_elements.addClass('hidden');
            } else {
                with_files_elements.addClass('hidden');
                without_files_elements.removeClass('hidden');
            }
        },
        
        _updateFile: function ($item) {
            var selectors = this.options.fileItem.selectors,
                when_pending = $item.find(selectors.size + "," + selectors.cancel),
                when_running = $item.find(selectors.progress + "," + selectors.cancel),
                when_done = $item.find(selectors.message + "," + selectors.clear);

            var status = $item.data("status");    
            if (status == "pending") {
                when_running.add(when_done).addClass('hidden');
                when_pending.removeClass('hidden');
            } else if (status == "running") {
                when_pending.add(when_done).addClass('hidden');
                when_running.removeClass('hidden');
            } else if (status == "done" || status == "error") {
                when_pending.add(when_running).addClass('hidden');
                when_done.removeClass('hidden');
            }
        },

        _getItemByFileId: function(id){
            var selectors = this.options.selectors,
                files = this._velm.$(selectors.fileList).find(selectors.fileItem),
                item;

            // there can't be txt nodes in dynamically created list
            // and we can  use nextSibling

            for (var i = 0; i<files.length;i++){
                var item2 = files[i];
                if ($(item2).data("fileId") == id) {
                    item = item2;
                    break;
                }
            }
            if (item) {
                return $(item);
            }
        },


            
        _addFiles: function(files){
            for (var i=0; i<files.length; i++){
                if ( !this._validateFile(files[i])){
                    return;
                }
            }

            for (var i=0; i<files.length; i++){
                this._addFile(files[i]);
            }
        },

        _addFile: function(file){
            var id = this._handler.add(file);

            this._filesInProgress++;
            this._addToList(id);

            //this._handler.upload(id, this.options.params);
        },

        _validateFile: function(file){
            var name, size;

            if (file.value){
                // it is a file input
                // get input value and remove path to normalize
                name = file.value.replace(/.*(\/|\\)/, "");
            } else {
                // fix missing properties in Safari
                name = file.fileName != null ? file.fileName : file.name;
                size = file.fileSize != null ? file.fileSize : file.size;
            }

            if (! this._isAllowedExtension(name)){
                this._error('typeError', name);
                return false;

            } else if (size === 0){
                this._error('emptyError', name);
                return false;

            } else if (size && this.options.sizeLimit && size > this.options.sizeLimit){
                this._error('sizeError', name);
                return false;

            } else if (size && size < this.options.minSizeLimit){
                this._error('minSizeError', name);
                return false;
            }

            return true;
        },

        _error: function(code, fileName){
            var message = this.options.messages[code];
            function r(name, replacement){ message = message.replace(name, replacement); }

            r('{file}', this._formatFileName(fileName));
            r('{extensions}', this.options.allowedExtensions.join(', '));
            r('{sizeLimit}', this._formatSize(this.options.sizeLimit));
            r('{minSizeLimit}', this._formatSize(this.options.minSizeLimit));

            this.options.showMessage(message);
        },

        _formatFileName: function(name){
            if (name.length > 33){
                name = name.slice(0, 19) + '...' + name.slice(-13);
            }
            return name;
        },

        _isAllowedExtension: function(fileName){
            var ext = (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
            var allowed = this.options.allowedExtensions;

            if (!allowed.length){return true;}

            for (var i=0; i<allowed.length; i++){
                if (allowed[i].toLowerCase() == ext){ return true;}
            }

            return false;
        },

        _formatSize: function(bytes){
            var i = -1;
            do {
                bytes = bytes / 1024;
                i++;
            } while (bytes > 99);

            return Math.max(bytes, 0.1).toFixed(1) + ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
        }

    });

   plugins.register(MultiUploader);



	return files.MultiUploader = MultiUploader;
});
define('skylark-domx-files/main',[
	"./files",
	"skylark-domx-velm",
	"skylark-domx-query",
	"./dropzone",
	"./pastezone",
	"./picker",
	"./MultiUploader"
],function(files,velm,$){
	velm.delegate([
		"dropzone",
		"pastezone",
		"picker"
	],files);

    $.fn.pastezone = $.wraps.wrapper_every_act(files.pastezone, files);
    $.fn.dropzone = $.wraps.wrapper_every_act(files.dropzone, files);
    $.fn.picker = $.wraps.wrapper_every_act(files.picker, files);

	return files;
});
define('skylark-domx-files', ['skylark-domx-files/main'], function (main) { return main; });

define('skylark-data-color/colors',[
    "skylark-langx/skylark",
    "skylark-langx/langx"
],function(skylark,langx) {
    /*
     * This module uses the following open source code:
     *   TinyColor v1.1.2
     *     https://github.com/bgrins/TinyColor
     *     Brian Grinstead, MIT License
     */

    var colors = skylark.colors =  skylark.colors || {};

    var trimLeft = /^[\s,#]+/,
        trimRight = /\s+$/,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;


     // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = colors.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = colors.hexNames = flip(names);


    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }
       


    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
     function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }

    // `rgbaToHex`
    // Converts an RGBA color plus alpha transparency to hex
    // Assumes r, g, b and a are contained in the set [0, 255]
    // Returns an 8 character hex
    function rgbaToHex(r, g, b, a) {

        var hex = [
            pad2(convertDecimalToHex(a)),
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        return hex.join("");
    }



    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    langx.mixin(colors,{
        inputToRGB : inputToRGB,
        rgbToRgb : rgbToRgb,
        rgbToHsl : rgbToHsl,
        hslToRgb : hslToRgb,
        rgbToHsv : rgbToHsv,
        hsvToRgb : hsvToRgb,
        rgbToHex : rgbToHex,
        rgbaToHex : rgbaToHex,
        boundAlpha : boundAlpha,
        bound01 : bound01,
        clamp01 : clamp01,
        parseIntFromHex : parseIntFromHex,
        isOnePointZero : isOnePointZero,
        isPercentage : isPercentage,
        pad2 : pad2,
        convertToPercentage : convertToPercentage,
        convertHexToDecimal : convertHexToDecimal,
        stringInputToObject : stringInputToObject

    });

    return skylark.attach("data.colors",colors);

});

define('skylark-data-color/Color',[
    "skylark-langx/langx",
    "./colors"
],function(langx,colors) {
    /*
     * This module uses the following open source code:
     *   TinyColor v1.1.2
     *     https://github.com/bgrins/TinyColor
     *     Brian Grinstead, MIT License
     */

    var inputToRGB = colors.inputToRGB,
        rgbToRgb = colors.rgbToRgb,
        rgbToHsl = colors.rgbToHsl,
        hslToRgb = colors.hslToRgb,
        rgbToHsv = colors.rgbToHsv,
        rgbToHex = colors.rgbToHex,
        rgbaToHex = colors.rgbaToHex,
        boundAlpha = colors.boundAlpha,
        bound01 = colors.bound01,
        clamp01 = colors.clamp01,
        parseIntFromHex = colors.parseIntFromHex,
        isOnePointZero = colors.isOnePointZero,
        isPercentage = colors.isPercentage,
        pad2 = colors.pad2,
        convertToPercentage = colors.convertToPercentage,
        convertHexToDecimal = colors.convertHexToDecimal,
        stringInputToObject = colors.stringInputToObject,
        hexNames = colors.hexNames;

    var tinyCounter = 0,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;

	var Color = colors.Color = langx.klass({
		init : function(color, opts) {
	        color = (color) ? color : '';
    	    opts = opts || { };

	        // If input is already a Color, return itself
	        if (color instanceof Color) {
	           return color;
	        }

	        var rgb = inputToRGB(color);
	        this._originalInput = color,
	        this._r = rgb.r,
	        this._g = rgb.g,
	        this._b = rgb.b,
	        this._a = rgb.a,
	        this._roundA = mathRound(1000 * this._a) / 1000,
	        this._format = opts.format || rgb.format;
	        this._gradientType = opts.gradientType;

	        // Don't let the range of [0,255] come back in [0,1].
	        // Potentially lose a little bit of precision here, but will fix issues where
	        // .5 gets interpreted as half of the total, instead of half of 1
	        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
	        if (this._r < 1) { this._r = mathRound(this._r); }
	        if (this._g < 1) { this._g = mathRound(this._g); }
	        if (this._b < 1) { this._b = mathRound(this._b); }

	        this._ok = rgb.ok;
	        this._tc_id = tinyCounter++;
	    },

        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getOriginalInput: function() {
          return this._originalInput;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(1000 * this._a) / 1000;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
              "hsv("  + h + ", " + s + "%, " + v + "%)" :
              "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
              "hsl("  + h + ", " + s + "%, " + l + "%)" :
              "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
              "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
              "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = Color(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
	});



    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    Color.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return Color(color, opts);
    };

    // `equals`
    // Can be called with any Color input
    Color.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return Color(color1).toRgbString() == Color(color2).toRgbString();
    };
    
    Color.random = function() {
        return Color.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };

   // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = Color(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return Color(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = Color(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return Color(hsl);
    }

    function greyscale(color) {
        return Color(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = Color(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return Color(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = Color(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return Color(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = Color(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return Color(hsl);
    }

    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
    // Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = Color(color).toHsl();
        var hue = (mathRound(hsl.h) + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return Color(hsl);
    }

    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = Color(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return Color(hsl);
    }

    function triad(color) {
        var hsl = Color(color).toHsl();
        var h = hsl.h;
        return [
            Color(color),
            Color({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            Color({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = Color(color).toHsl();
        var h = hsl.h;
        return [
            Color(color),
            Color({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            Color({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            Color({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = Color(color).toHsl();
        var h = hsl.h;
        return [
            Color(color),
            Color({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            Color({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = Color(color).toHsl();
        var part = 360 / slices;
        var ret = [Color(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(Color(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = Color(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(Color({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

    // Utility Functions
    // ---------------------

    Color.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = Color(color1).toRgb();
        var rgb2 = Color(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return Color(rgba);
    };


    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/AERT#color-contrast>

    // `readability`
    // Analyze the 2 colors and returns an object with the following properties:
    //    `brightness`: difference in brightness between the two colors
    //    `color`: difference in color/hue between the two colors
    Color.readability = function(color1, color2) {
        var c1 = Color(color1);
        var c2 = Color(color2);
        var rgb1 = c1.toRgb();
        var rgb2 = c2.toRgb();
        var brightnessA = c1.getBrightness();
        var brightnessB = c2.getBrightness();
        var colorDiff = (
            Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r) +
            Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g) +
            Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b)
        );

        return {
            brightness: Math.abs(brightnessA - brightnessB),
            color: colorDiff
        };
    };

    // `readable`
    // http://www.w3.org/TR/AERT#color-contrast
    // Ensure that foreground and background color combinations provide sufficient contrast.
    // *Example*
    //    Color.isReadable("#000", "#111") => false
    Color.isReadable = function(color1, color2) {
        var readability = Color.readability(color1, color2);
        return readability.brightness > 125 && readability.color > 500;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // *Example*
    //    Color.mostReadable("#123", ["#fff", "#000"]) => "#000"
    Color.mostReadable = function(baseColor, colorList) {
        var bestColor = null;
        var bestScore = 0;
        var bestIsReadable = false;
        for (var i=0; i < colorList.length; i++) {

            // We normalize both around the "acceptable" breaking point,
            // but rank brightness constrast higher than hue.

            var readability = Color.readability(baseColor, colorList[i]);
            var readable = readability.brightness > 125 && readability.color > 500;
            var score = 3 * (readability.brightness / 125) + (readability.color / 500);

            if ((readable && ! bestIsReadable) ||
                (readable && bestIsReadable && score > bestScore) ||
                ((! readable) && (! bestIsReadable) && score > bestScore)) {
                bestIsReadable = readable;
                bestScore = score;
                bestColor = Color(colorList[i]);
            }
        }
        return bestColor;
    };


	return Color;
});

define('skylark-domx-colorpicker/draggable',[
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-query"
],function(skylark, langx, browser, noder, eventer,finder, $) {
    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (browser.isIE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).on(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).off(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }

        $(element).on("touchstart mousedown", start);
    }
	
	return draggable;
});
define('skylark-domx-colorpicker/ColorPicker',[
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-data-color/colors",
    "skylark-data-color/Color",
    "./draggable"
],function(skylark, langx, browser, noder, finder, $,eventer, styler,fx,colors, Color,draggable) {
    "use strict";

    var noop = langx.noop;

    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        allowEmpty: false,
        showButtons: true,
        clickoutFiresChange: true,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        hideAfterPaletteSelect: false,
        togglePaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        togglePaletteMoreText: "more",
        togglePaletteLessText: "less",
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        preferredFormat: false,
        className: "", // Deprecated - use containerClassName and replacerClassName instead.
        containerClassName: "",
        replacerClassName: "",
        showAlpha: false,
        theme: "sp-light",
        palette: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]],
        selectionPalette: [],
        disabled: false,
        offset: null
    },
    pickers = [],
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    
    markup = (function () {

        // IE7-10 does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (browser.isIE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = colors.Color(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (Color.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = "background-color:" + tiny.toRgbString();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < pickers.length; i++) {
            if (pickers[i]) {
                pickers[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = langx.mixin({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }



    var ColorPicker = langx.Evented.inherit({
        klassName : "ColorPicker",

        init:function (element, o) {

            var opts = instanceOptions(o, element),
                flat = opts.flat,
                showSelectionPalette = opts.showSelectionPalette,
                localStorageKey = opts.localStorageKey,
                theme = opts.theme,
                callbacks = opts.callbacks,
                resize = langx.debounce(reflow, 10),
                visible = false,
                isDragging = false,
                dragWidth = 0,
                dragHeight = 0,
                dragHelperHeight = 0,
                slideHeight = 0,
                slideWidth = 0,
                alphaWidth = 0,
                alphaSlideHelperWidth = 0,
                slideHelperHeight = 0,
                currentHue = 0,
                currentSaturation = 0,
                currentValue = 0,
                currentAlpha = 1,
                palette = [],
                paletteArray = [],
                paletteLookup = {},
                selectionPalette = opts.selectionPalette.slice(0),
                maxSelectionSize = opts.maxSelectionSize,
                draggingClass = "sp-dragging",
                shiftMovementDirection = null;

            var doc = element.ownerDocument,
                body = doc.body,
                boundElement = $(element),
                disabled = false,
                container = $(markup, doc).addClass(theme),
                pickerContainer = container.find(".sp-picker-container"),
                dragger = container.find(".sp-color"),
                dragHelper = container.find(".sp-dragger"),
                slider = container.find(".sp-hue"),
                slideHelper = container.find(".sp-slider"),
                alphaSliderInner = container.find(".sp-alpha-inner"),
                alphaSlider = container.find(".sp-alpha"),
                alphaSlideHelper = container.find(".sp-alpha-handle"),
                textInput = container.find(".sp-input"),
                paletteContainer = container.find(".sp-palette"),
                initialColorContainer = container.find(".sp-initial"),
                cancelButton = container.find(".sp-cancel"),
                clearButton = container.find(".sp-clear"),
                chooseButton = container.find(".sp-choose"),
                toggleButton = container.find(".sp-palette-toggle"),
                isInput = boundElement.is("input"),
                isInputTypeColor = isInput && boundElement.attr("type") === "color" && inputTypeColorSupport(),
                shouldReplace = isInput && !flat,
                replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
                offsetElement = (shouldReplace) ? replacer : boundElement,
                previewElement = replacer.find(".sp-preview-inner"),
                initialColor = opts.color || (isInput && boundElement.val()),
                colorOnShow = false,
                currentPreferredFormat = opts.preferredFormat,
                clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
                isEmpty = !initialColor,
                allowEmpty = opts.allowEmpty && !isInputTypeColor;

            function applyOptions() {

                if (opts.showPaletteOnly) {
                    opts.showPalette = true;
                }

                toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);

                if (opts.palette) {
                    palette = opts.palette.slice(0);
                    paletteArray = langx.isArray(palette[0]) ? palette : [palette];
                    paletteLookup = {};
                    for (var i = 0; i < paletteArray.length; i++) {
                        for (var j = 0; j < paletteArray[i].length; j++) {
                            var rgb = Color(paletteArray[i][j]).toRgbString();
                            paletteLookup[rgb] = true;
                        }
                    }
                }

                container.toggleClass("sp-flat", flat);
                container.toggleClass("sp-input-disabled", !opts.showInput);
                container.toggleClass("sp-alpha-enabled", opts.showAlpha);
                container.toggleClass("sp-clear-enabled", allowEmpty);
                container.toggleClass("sp-buttons-disabled", !opts.showButtons);
                container.toggleClass("sp-palette-buttons-disabled", !opts.togglePaletteOnly);
                container.toggleClass("sp-palette-disabled", !opts.showPalette);
                container.toggleClass("sp-palette-only", opts.showPaletteOnly);
                container.toggleClass("sp-initial-disabled", !opts.showInitial);
                container.addClass(opts.className).addClass(opts.containerClassName);

                reflow();
            }

            function initialize() {

                if (browser.isIE) {
                    container.find("*:not(input)").attr("unselectable", "on");
                }

                applyOptions();

                if (shouldReplace) {
                    boundElement.after(replacer).hide();
                }

                if (!allowEmpty) {
                    clearButton.hide();
                }

                if (flat) {
                    boundElement.after(container).hide();
                }
                else {

                    var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                    if (appendTo.length !== 1) {
                        appendTo = $("body");
                    }

                    appendTo.append(container);
                }

                updateSelectionPaletteFromStorage();

                offsetElement.on("click.ColorPicker touchstart.ColorPicker", function (e) {
                    if (!disabled) {
                        toggle();
                    }

                    e.stopPropagation();

                    if (!$(e.target).is("input")) {
                        e.preventDefault();
                    }
                });

                if(boundElement.is(":disabled") || (opts.disabled === true)) {
                    disable();
                }

                // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
                container.click(stopPropagation);

                // Handle user typed input
                textInput.change(setFromTextInput);
                textInput.on("paste", function () {
                    setTimeout(setFromTextInput, 1);
                });
                textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

                cancelButton.text(opts.cancelText);
                cancelButton.on("click.ColorPicker", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    revert();
                    hide();
                });

                clearButton.attr("title", opts.clearText);
                clearButton.on("click.ColorPicker", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    isEmpty = true;
                    move();

                    if(flat) {
                        //for the flat style, this is a change event
                        updateOriginalInput(true);
                    }
                });

                chooseButton.text(opts.chooseText);
                chooseButton.on("click.ColorPicker", function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    if (browser.isIE && textInput.is(":focus")) {
                        textInput.trigger('change');
                    }

                    if (isValid()) {
                        updateOriginalInput(true);
                        hide();
                    }
                });

                toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
                toggleButton.on("click.spectrum", function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    opts.showPaletteOnly = !opts.showPaletteOnly;

                    // To make sure the Picker area is drawn on the right, next to the
                    // Palette area (and not below the palette), first move the Palette
                    // to the left to make space for the picker, plus 5px extra.
                    // The 'applyOptions' function puts the whole container back into place
                    // and takes care of the button-text and the sp-palette-only CSS class.
                    if (!opts.showPaletteOnly && !flat) {
                        container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
                    }
                    applyOptions();
                });

                draggable(alphaSlider, function (dragX, dragY, e) {
                    currentAlpha = (dragX / alphaWidth);
                    isEmpty = false;
                    if (e.shiftKey) {
                        currentAlpha = Math.round(currentAlpha * 10) / 10;
                    }

                    move();
                }, dragStart, dragStop);

                draggable(slider, function (dragX, dragY) {
                    currentHue = parseFloat(dragY / slideHeight);
                    isEmpty = false;
                    if (!opts.showAlpha) {
                        currentAlpha = 1;
                    }
                    move();
                }, dragStart, dragStop);

                draggable(dragger, function (dragX, dragY, e) {

                    // shift+drag should snap the movement to either the x or y axis.
                    if (!e.shiftKey) {
                        shiftMovementDirection = null;
                    }
                    else if (!shiftMovementDirection) {
                        var oldDragX = currentSaturation * dragWidth;
                        var oldDragY = dragHeight - (currentValue * dragHeight);
                        var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                        shiftMovementDirection = furtherFromX ? "x" : "y";
                    }

                    var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                    var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                    if (setSaturation) {
                        currentSaturation = parseFloat(dragX / dragWidth);
                    }
                    if (setValue) {
                        currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                    }

                    isEmpty = false;
                    if (!opts.showAlpha) {
                        currentAlpha = 1;
                    }

                    move();

                }, dragStart, dragStop);

                if (!!initialColor) {
                    set(initialColor);

                    // In case color was black - update the preview UI and set the format
                    // since the set function will not run (default color is black).
                    updateUI();
                    currentPreferredFormat = opts.preferredFormat || Color(initialColor).format;

                    addColorToSelectionPalette(initialColor);
                }
                else {
                    updateUI();
                }

                if (flat) {
                    show();
                }

                function paletteElementClick(e) {
                    if (e.data && e.data.ignore) {
                        set($(e.target).closest(".sp-thumb-el").data("color"));
                        move();
                    }
                    else {
                        set($(e.target).closest(".sp-thumb-el").data("color"));
                        move();

                        // If the picker is going to close immediately, a palette selection
                        // is a change.  Otherwise, it's a move only.
                        if (opts.hideAfterPaletteSelect) {
                            updateOriginalInput(true);
                            hide();
                        } else {
                            updateOriginalInput();
                        }
                    }

                    return false;
                }

                var paletteEvent = browser.isIE ? "mousedown.ColorPicker" : "click.ColorPicker touchstart.ColorPicker";
                paletteContainer.on(paletteEvent, ".sp-thumb-el", paletteElementClick);
                initialColorContainer.on(paletteEvent, ".sp-thumb-el:nth-child(1)", { ignore: true }, paletteElementClick);
            }

            function updateSelectionPaletteFromStorage() {

                if (localStorageKey && window.localStorage) {

                    // Migrate old palettes over to new format.  May want to remove this eventually.
                    try {
                        var oldPalette = window.localStorage[localStorageKey].split(",#");
                        if (oldPalette.length > 1) {
                            delete window.localStorage[localStorageKey];
                            langx.each(oldPalette, function(i, c) {
                                 addColorToSelectionPalette(c);
                            });
                        }
                    }
                    catch(e) { }

                    try {
                        selectionPalette = window.localStorage[localStorageKey].split(";");
                    }
                    catch (e) { }
                }
            }

            function addColorToSelectionPalette(color) {
                if (showSelectionPalette) {
                    var rgb = Color(color).toRgbString();
                    if (!paletteLookup[rgb] && langx.inArray(rgb, selectionPalette) === -1) {
                        selectionPalette.push(rgb);
                        while(selectionPalette.length > maxSelectionSize) {
                            selectionPalette.shift();
                        }
                    }

                    if (localStorageKey && window.localStorage) {
                        try {
                            window.localStorage[localStorageKey] = selectionPalette.join(";");
                        }
                        catch(e) { }
                    }
                }
            }

            function getUniqueSelectionPalette() {
                var unique = [];
                if (opts.showPalette) {
                    for (var i = 0; i < selectionPalette.length; i++) {
                        var rgb = Color(selectionPalette[i]).toRgbString();

                        if (!paletteLookup[rgb]) {
                            unique.push(selectionPalette[i]);
                        }
                    }
                }

                return unique.reverse().slice(0, opts.maxSelectionSize);
            }

            function drawPalette() {

                var currentColor = get();

                var html = langx.map(paletteArray, function (palette, i) {
                    return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
                });

                updateSelectionPaletteFromStorage();

                if (selectionPalette) {
                    html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
                }

                paletteContainer.html(html.join(""));
            }

            function drawInitial() {
                if (opts.showInitial) {
                    var initial = colorOnShow;
                    var current = get();
                    initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
                }
            }

            function dragStart() {
                if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                    reflow();
                }
                isDragging = true;
                container.addClass(draggingClass);
                shiftMovementDirection = null;
                boundElement.trigger('dragstart.ColorPicker', [ get() ]);
            }

            function dragStop() {
                isDragging = false;
                container.removeClass(draggingClass);
                boundElement.trigger('dragstop.ColorPicker', [ get() ]);
            }

            function setFromTextInput() {

                var value = textInput.val();

                if ((value === null || value === "") && allowEmpty) {
                    set(null);
                    move();
                    updateOriginalInput();
                }
                else {
                    var tiny = Color(value);
                    if (tiny.isValid()) {
                        set(tiny);
                        move();
                        updateOriginalInput();
                    }
                    else {
                        textInput.addClass("sp-validation-error");
                    }
                }
            }

            function toggle() {
                if (visible) {
                    hide();
                }
                else {
                    show();
                }
            }

            function show() {
                var event = eventer.create('beforeShow.ColorPicker');

                if (visible) {
                    reflow();
                    return;
                }

                boundElement.trigger(event, [ get() ]);

                if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                    return;
                }

                hideAll();
                visible = true;

                $(doc).on("keydown.ColorPicker", onkeydown);
                $(doc).on("click.ColorPicker", clickout);
                $(window).on("resize.ColorPicker", resize);
                replacer.addClass("sp-active");
                container.removeClass("sp-hidden");

                reflow();
                updateUI();

                colorOnShow = get();

                drawInitial();
                callbacks.show(colorOnShow);
                boundElement.trigger('show.ColorPicker', [ colorOnShow ]);
            }

            function onkeydown(e) {
                // Close on ESC
                if (e.keyCode === 27) {
                    hide();
                }
            }

            function clickout(e) {
                // Return on right click.
                if (e.button == 2) { return; }

                // If a drag event was happening during the mouseup, don't hide
                // on click.
                if (isDragging) { return; }

                if (clickoutFiresChange) {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
                hide();
            }

            function hide() {
                // Return if hiding is unnecessary
                if (!visible || flat) { return; }
                visible = false;

                $(doc).off("keydown.ColorPicker", onkeydown);
                $(doc).off("click.ColorPicker", clickout);
                $(window).off("resize.ColorPicker", resize);

                replacer.removeClass("sp-active");
                container.addClass("sp-hidden");

                callbacks.hide(get());
                boundElement.trigger('hide.ColorPicker', [ get() ]);
            }

            function revert() {
                set(colorOnShow, true);
                updateOriginalInput(true);
            }

            function set(color, ignoreFormatChange) {
                if (Color.equals(color, get())) {
                    // Update UI just in case a validation error needs
                    // to be cleared.
                    updateUI();
                    return;
                }

                var newColor, newHsv;
                if (!color && allowEmpty) {
                    isEmpty = true;
                } else {
                    isEmpty = false;
                    newColor = colors.Color(color);
                    newHsv = newColor.toHsv();

                    currentHue = (newHsv.h % 360) / 360;
                    currentSaturation = newHsv.s;
                    currentValue = newHsv.v;
                    currentAlpha = newHsv.a;
                }
                updateUI();

                if (newColor && newColor.isValid() && !ignoreFormatChange) {
                    currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
                }
            }

            function get(opts) {
                opts = opts || { };

                if (allowEmpty && isEmpty) {
                    return null;
                }

                return Color.fromRatio({
                    h: currentHue,
                    s: currentSaturation,
                    v: currentValue,
                    a: Math.round(currentAlpha * 1000) / 1000
                }, { format: opts.format || currentPreferredFormat });
            }

            function isValid() {
                return !textInput.hasClass("sp-validation-error");
            }

            function move() {
                updateUI();

                callbacks.move(get());
                boundElement.trigger('move.ColorPicker', [ get() ]);
            }

            function updateUI() {

                textInput.removeClass("sp-validation-error");

                updateHelperLocations();

                // Update dragger background color (gradients take care of saturation and value).
                var flatColor = Color.fromRatio({ h: currentHue, s: 1, v: 1 });
                dragger.css("background-color", flatColor.toHexString());

                // Get a format that alpha will be included in (hex and names ignore alpha)
                var format = currentPreferredFormat;
                if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                    if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                        format = "rgb";
                    }
                }

                var realColor = get({ format: format }),
                    displayColor = '';

                 //reset background info for preview element
                previewElement.removeClass("sp-clear-display");
                previewElement.css('background-color', 'transparent');

                if (!realColor && allowEmpty) {
                    // Update the replaced elements background with icon indicating no color selection
                    previewElement.addClass("sp-clear-display");
                }
                else {
                    var realHex = realColor.toHexString(),
                        realRgb = realColor.toRgbString();

                    // Update the replaced elements background color (with actual selected color)
                    previewElement.css("background-color", realRgb);

                    if (opts.showAlpha) {
                        var rgb = realColor.toRgb();
                        rgb.a = 0;
                        var realAlpha = Color(rgb).toRgbString();
                        var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                        if (browser.isIE) {
                            alphaSliderInner.css("filter", Color(realAlpha).toFilter({ gradientType: 1 }, realHex));
                        }
                        else {
                            alphaSliderInner.css("background", "-webkit-" + gradient);
                            alphaSliderInner.css("background", "-moz-" + gradient);
                            alphaSliderInner.css("background", "-ms-" + gradient);
                            // Use current syntax gradient on unprefixed property.
                            alphaSliderInner.css("background",
                                "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                        }
                    }

                    displayColor = realColor.toString(format);
                }

                // Update the text entry input as it changes happen
                if (opts.showInput) {
                    textInput.val(displayColor);
                }

                if (opts.showPalette) {
                    drawPalette();
                }

                drawInitial();
            }

            function updateHelperLocations() {
                var s = currentSaturation;
                var v = currentValue;

                if(allowEmpty && isEmpty) {
                    //if selected color is empty, hide the helpers
                    alphaSlideHelper.hide();
                    slideHelper.hide();
                    dragHelper.hide();
                }
                else {
                    //make sure helpers are visible
                    alphaSlideHelper.show();
                    slideHelper.show();
                    dragHelper.show();

                    // Where to show the little circle in that displays your current selected color
                    var dragX = s * dragWidth;
                    var dragY = dragHeight - (v * dragHeight);
                    dragX = Math.max(
                        -dragHelperHeight,
                        Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                    );
                    dragY = Math.max(
                        -dragHelperHeight,
                        Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                    );
                    dragHelper.css({
                        "top": dragY + "px",
                        "left": dragX + "px"
                    });

                    var alphaX = currentAlpha * alphaWidth;
                    alphaSlideHelper.css({
                        "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                    });

                    // Where to show the bar that displays your current selected hue
                    var slideY = (currentHue) * slideHeight;
                    slideHelper.css({
                        "top": (slideY - slideHelperHeight) + "px"
                    });
                }
            }

            function updateOriginalInput(fireCallback) {
                var color = get(),
                    displayColor = '',
                    hasChanged = !Color.equals(color, colorOnShow);

                if (color) {
                    displayColor = color.toString(currentPreferredFormat);
                    // Update the selection palette with the current color
                    addColorToSelectionPalette(color);
                }

                if (isInput) {
                    boundElement.val(displayColor);
                }

                if (fireCallback && hasChanged) {
                    callbacks.change(color);
                    boundElement.trigger('change', [ color ]);
                }
            }

            function reflow() {
                if (!visible) {
                    return; // Calculations would be useless and wouldn't be reliable anyways
                }
                dragWidth = dragger.width();
                dragHeight = dragger.height();
                dragHelperHeight = dragHelper.height();
                slideWidth = slider.width();
                slideHeight = slider.height();
                slideHelperHeight = slideHelper.height();
                alphaWidth = alphaSlider.width();
                alphaSlideHelperWidth = alphaSlideHelper.width();

                if (!flat) {
                    container.css("position", "absolute");
                    if (opts.offset) {
                        container.offset(opts.offset);
                    } else {
                        container.offset(getOffset(container, offsetElement));
                    }
                }

                updateHelperLocations();

                if (opts.showPalette) {
                    drawPalette();
                }

                boundElement.trigger('reflow.ColorPicker');
            }

            function destroy() {
                boundElement.show();
                offsetElement.off("click.ColorPicker touchstart.ColorPicker");
                container.remove();
                replacer.remove();
                pickers[spect.id] = null;
            }

            function option(optionName, optionValue) {
                if (optionName === undefined) {
                    return langx.mixin({}, opts);
                }
                if (optionValue === undefined) {
                    return opts[optionName];
                }

                opts[optionName] = optionValue;

                if (optionName === "preferredFormat") {
                    currentPreferredFormat = opts.preferredFormat;
                }
                applyOptions();
            }

            function enable() {
                disabled = false;
                boundElement.attr("disabled", false);
                offsetElement.removeClass("sp-disabled");
            }

            function disable() {
                hide();
                disabled = true;
                boundElement.attr("disabled", true);
                offsetElement.addClass("sp-disabled");
            }

            function setOffset(coord) {
                opts.offset = coord;
                reflow();
            }

            initialize();

            var spect = {
                show: show,
                hide: hide,
                toggle: toggle,
                reflow: reflow,
                option: option,
                enable: enable,
                disable: disable,
                offset: setOffset,
                set: function (c) {
                    set(c);
                    updateOriginalInput();
                },
                get: get,
                destroy: destroy,
                container: container
            };

            spect.id = pickers.push(spect) - 1;

            return spect;
        }
    });


    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        var offsetLeft = offset.left;
        var offsetTop = offset.top;

        offsetTop += inputHeight;

        offsetLeft -=
            Math.min(offsetLeft, (offsetLeft + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offsetLeft + dpWidth - viewWidth) : 0);

        offsetTop -=
            Math.min(offsetTop, ((offsetTop + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return {
            top: offsetTop,
            bottom: offset.bottom,
            left: offsetLeft,
            right: offset.right,
            width: offset.width,
            height: offset.height
        };
    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }


    /**
    * Define a query plugin
    */
    var dataID = "ColorPicker.id";
    
    function Plugin(opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = pickers[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "skylark-ui-colorpicker: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of ColorPicker
        return this.colorPicker("destroy").each(function () {
            var options = langx.mixin({}, $(this).data(), opts);
            var spect = ColorPicker(this, options);
            $(this).data(dataID, spect.id);
        });
    }

    ColorPicker.load = true;
    ColorPicker.loadOpts = {};
    ColorPicker.draggable = draggable;
    ColorPicker.defaults = defaultOpts;

    ColorPicker.localization = { };
    ColorPicker.palettes = { };

    $.fn.colorPicker = Plugin;

    return skylark.attach("domx.ColorPicker",ColorPicker);

});

define('skylark-domx-colorpicker/i18n/texts_ja',[
	"../ColorPicker"
],function(ColorPicker) {
    var localization = ColorPicker.localization["ja"] = {
        cancelText: "中止",
        chooseText: "選択"
    };

    return localization;
});
define('skylark-domx-colorpicker/i18n/texts_zh-cn',[
	"../ColorPicker"
],function(ColorPicker) {
    var localization = ColorPicker.localization["zh-cn"] = {
        cancelText: "取消",
        chooseText: "选择",
        clearText: "清除",
        togglePaletteMoreText: "更多选项",
        togglePaletteLessText: "隐藏",
        noColorSelectedText: "尚未选择任何颜色"
    };

    return localization;

});

define('skylark-domx-colorpicker/i18n/texts_zh-tw',[
	"../ColorPicker"
],function(ColorPicker) {
    var localization = ColorPicker.localization["zh-tw"] = {
        cancelText: "取消",
        chooseText: "選擇",
        clearText: "清除",
        togglePaletteMoreText: "更多選項",
        togglePaletteLessText: "隱藏",
        noColorSelectedText: "尚未選擇任何顏色"
    };

    return localization;

});
define('skylark-domx-colorpicker/main',[
    "./ColorPicker",
    "./i18n/texts_ja",
    "./i18n/texts_zh-cn",
    "./i18n/texts_zh-tw"
], function(ColorPicker) {
    return ColorPicker;
});

define('skylark-domx-colorpicker', ['skylark-domx-colorpicker/main'], function (main) { return main; });

define('skylark-domx-gradienter/Drag',[],function() {
    /**************************************************
     * dom-drag.js
     * 09.25.2001
     * www.youngpup.net
     **************************************************
     * 10.28.2001 - fixed minor bug where events
     * sometimes fired off the handle, not the root.
     **************************************************/

    var Drag = {

        obj : null,

        gradx : null,

        init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
        {
            o.onmousedown	= Drag.start;

            o.hmode			= bSwapHorzRef ? false : true ;
            o.vmode			= bSwapVertRef ? false : true ;

            o.root = oRoot && oRoot != null ? oRoot : o ;

            if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) o.root.style.left   = "0px";
           //if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) o.root.style.top    = "0px";
            if (!o.hmode && isNaN(parseInt(o.root.style.right ))) o.root.style.right  = "0px";
           // if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) o.root.style.bottom = "0px";

            o.minX	= typeof minX != 'undefined' ? minX : null;
            o.minY	= typeof minY != 'undefined' ? minY : null;
            o.maxX	= typeof maxX != 'undefined' ? maxX : null;
            o.maxY	= typeof maxY != 'undefined' ? maxY : null;

            o.xMapper = fXMapper ? fXMapper : null;
            o.yMapper = fYMapper ? fYMapper : null;

            o.root.onDragStart	= new Function();
            o.root.onDragEnd	= new Function();
            o.root.onDrag		= new Function();
        },

        start : function(e)
        {
            Drag.gradx.current_slider_id = "#"+this.id;

            var o = Drag.obj = this;
            e = Drag.fixE(e);
            var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
            var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
            o.root.onDragStart(x, y);

            o.lastMouseX	= e.clientX;
            o.lastMouseY	= e.clientY;

            if (o.hmode) {
                if (o.minX != null)	o.minMouseX	= e.clientX - x + o.minX;
                if (o.maxX != null)	o.maxMouseX	= o.minMouseX + o.maxX - o.minX;
            } else {
                if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
                if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
            }

            if (o.vmode) {
                if (o.minY != null)	o.minMouseY	= e.clientY - y + o.minY;
                if (o.maxY != null)	o.maxMouseY	= o.minMouseY + o.maxY - o.minY;
            }
            else {
                if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
                if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
            }

            document.onmousemove	= Drag.drag;
            document.onmouseup	= Drag.end;

            return false;
        },

        drag : function(e)
        {
            e = Drag.fixE(e);
            var o = Drag.obj;

            Drag.gradx.update_style_array();
            Drag.gradx.apply_style(Drag.gradx.panel, Drag.gradx.get_style_value());
            var left = Drag.gradx.gx("#"+o.id).css("left");


            if(parseInt(left) > 60 && parseInt(left) < 390) {
                Drag.gradx.gx("#gradx_slider_info") //info element cached before
                .css("left",left)
                .show();
                         
            }/*else {
                if(parseInt(left) > 120) {
                    left = "272px";
                }else{
                    left = "120px";
                }
                    
                gradx.gx("#gradx_slider_info") //info element cached before
                .css("left",left)
                .show();
                     
            }*/
             var color = Drag.gradx.gx("#"+o.id).css("backgroundColor");
            //but what happens if @color is not in RGB ? :(
            var rgb = Drag.gradx.get_rgb_obj(color);
            Drag.gradx.cp.colorPicker("set",rgb);


            var ey	= e.clientY;
            var ex	= e.clientX;
            var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
            var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
            var nx, ny;

            if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
            if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
            if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
            if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

            nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
            ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

            if (o.xMapper)		nx = o.xMapper(y)
            else if (o.yMapper)	ny = o.yMapper(x)

            Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
            //Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
            Drag.obj.lastMouseX	= ex;
            Drag.obj.lastMouseY	= ey;

            Drag.obj.root.onDrag(nx, ny);
            return false;
        },

        end : function()
        {
            document.onmousemove = null;
            document.onmouseup   = null;
            Drag.obj.root.onDragEnd(	parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]), 
                parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]));
            Drag.obj = null;
        },

        fixE : function(e)
        {
            if (typeof e == 'undefined') e = window.event;
            if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
            if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
            return e;
        }
    };

    return Drag;
});
define('skylark-domx-gradienter/Gradienter',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-eventer",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-plugins",    
    "skylark-data-color/colors",
    "skylark-data-color/Color",
    "skylark-domx-colorpicker/ColorPicker",
    "./Drag"
],function(skylark, langx, browser, noder, eventer,finder, $, plugins,colors, Color, ColorPicker,Drag) {


    /*
     *
     * SAMPLE USAGE DETAILS :
     * 
     * sliders structure :
     *
     * [
     *  {
     *     color: "COLOR",
     *     position: "POSITION" //0 to 100 without % symbol
     *  },
     *  {
     *     ....
     *     ....
     *  },
     *  ....
     * ]
     *
     */

    'use strict';

    //make me jquery UI  independent
    if (typeof $.fn.draggable === "undefined") {

        $.fn.draggable = function() {
            //console.log(this);
            var ele = document.getElementById(this.attr("id"));
            ele.style.top = "121px";
            Drag.init(ele, null, 26, 426, 86, 86);
            return this;
        };


    }


    var gradX  = function(id, _options) {


        var options = {
            targets: [], //[element selector] -> array
            sliders: [],
            direction: 'left',
            //if linear left | top | right | bottom
            //if radial left | center | right , top | center | bottom 
            type: 'linear', //linear | circle | ellipse
            code_shown: false, //false | true
            change: function(sliders, styles) {
                //nothing to do here by default
            }
        },
    	
        //make global	
        gradx = Drag.gradx = {
            rand_RGB: [],
            rand_pos: [],
            id: null,
            slider_ids: [],
            slider_index: 0, //global index for sliders
            sliders: [], //contains styles of each slider
            direction: "left", //direction of gradient or position of centre in case of radial gradients
            type: "linear", //linear or radial
            shape: "cover", //radial gradient size
            slider_hovered: [],
            jQ_present: true,
            code_shown: false,
            load_jQ: function() {

                //handle any library conflicts here
                this.gx = $;
            },
            //very lazy to replace this by jQuery
            add_event: function(el, evt, evt_func) {
                add_event(el, evt, evt_func);
            },
            get_random_position: function() {
                var pos;

                do {
                    pos = parseInt(Math.random() * 100);
                }
                while (this.rand_pos.indexOf(pos) > -1);

                this.rand_pos.push(pos);
                return pos;

            },
            get_random_rgb: function() {

                var R, G, B, color;

                do {
                    R = parseInt(Math.random() * 255);
                    G = parseInt(Math.random() * 255);
                    B = parseInt(Math.random() * 255);

                    color = "rgb(" + R + ", " + G + ", " + B + ")";
                }
                while (this.rand_RGB.indexOf(color) > -1);

                this.rand_RGB.push(color);
                return color;

            },
            //if target element is specified the target's style (background) is updated
            update_target: function(values) {

                if (this.targets.length > 0) {
                    //target elements exist

                    var i, j, ele, len = this.targets.length, v_len = values.length;
                    for (i = 0; i < len; i++) {
                        ele = gradx.gx(this.targets[i]);

                        for (j = 0; j < v_len; j++) {
                            ele.css("background-image", values[j]);
                        }

                    }
                }
            },
            //apply styles on fly
            apply_style: function(ele, value) {

                var type = 'linear';

                if (gradx.type != 'linear') {
                    type = 'radial';
                }

                if (value.indexOf(this.direction) > -1) {
                    //add cross-browser compatibility
                    var values = [
                        "-webkit-" + type + "-gradient(" + value + ")",
                        "-moz-" + type + "-gradient(" + value + ")",
                        "-ms-" + type + "-gradient(" + value + ")",
                        "-o-" + type + "-gradient(" + value + ")",
                        type + "-gradient(" + value + ")"
                    ];
                } else {
                    //normal color
                    values = [value];
                }



                var len = values.length, css = '';

                while (len > 0) {
                    len--;
                    ele.css("background", values[len]);
                    css += "background: " + values[len] + ";\n";
                }

                //call the userdefined change function
                this.change(this.sliders, values);
                this.update_target(values);


                gradx.gx('#gradx_code').html(css);

            },
            //on load
            apply_default_styles: function() {
                this.update_style_array()
                var value = this.get_style_value();
                this.apply_style(this.panel, value);
            },
            //update the slider_values[] while dragging
            update_style_array: function() {

                this.sliders = [];

                var len = gradx.slider_ids.length,
                        i, offset, position, id;

                for (i = 0; i < len; i++) {
                    id = "#" + gradx.slider_ids[i];
                    offset = parseInt(gradx.gx(id).css("left"));
                    position = parseInt((offset / gradx.container_width) * 100);
                    position -= 6; //TODO: find why this is required
                    gradx.sliders.push([gradx.gx(id).css("background-color"), position]);

                }

                this.sliders.sort(function(A, B) {
                    if (A[1] > B[1])
                        return 1;
                    else
                        return -1;
                });
            },
            //creates the complete css background value to later apply style
            get_style_value: function() {

                var len = gradx.slider_ids.length;

                if (len === 1) {
                    //since only one slider , so simple background

                    style_str = this.sliders[0][0];
                } else {
                    var style_str = "", suffix = "";
                    for (var i = 0; i < len; i++) {
                        if (this.sliders[i][1] == "") {
                            style_str += suffix + (this.sliders[i][0]);

                        } else {
                            if (this.sliders[i][1] > 100) {
                                this.sliders[i][1] = 100;
                            }
                            style_str += suffix + (this.sliders[i][0] + " " + this.sliders[i][1] + "%");

                        }
                        suffix = " , "; //add , from next iteration
                    }

                    if (this.type == 'linear') {
                        //direction, [color stoppers]
                        style_str = this.direction + " , " + style_str; //add direction for gradient
                    } else {
                        //position, type size, [color stoppers]
                        style_str = this.direction + " , " + this.type + " " + this.shape + " , " + style_str;
                    }
                }

                return style_str;
            },
            //@input rgb string rgb(<red>,<green>,<blue>)
            //@output rgb object of form { r: <red> , g: <green> , b : <blue>}
            get_rgb_obj: function(rgb) {

                //rgb(r,g,b)
                rgb = rgb.split("(");
                //r,g,b)
                rgb = rgb[1];
                //r g b)
                rgb = rgb.split(",");

                return {
                    r: parseInt(rgb[0]),
                    g: parseInt(rgb[1]),
                    b: parseInt(rgb[2])
                };

            },
            load_info: function(ele) {
                var id = "#" + ele.id;
                this.current_slider_id = id;
                //check if current clicked element is an slider
                if (this.slider_ids.indexOf(ele.id) > -1) { //javascript does not has # in its id

                    var color = gradx.gx(id).css("backgroundColor");
                    //but what happens if @color is not in RGB ? :(
                    var rgb = this.get_rgb_obj(color);

                    var left = gradx.gx(id).css("left");
                    if (parseInt(left) > 26 && parseInt(left) < 426) {
                        gradx.gx("#gradx_slider_info") //info element cached before
                                .css("left", left)
                                .show();

                    } 
                    
                    this.set_colorpicker(rgb);
                    console.log(rgb);
                }

            },
            //add slider
            add_slider: function(sliders) {


                var id, slider, k, position, value, delta;


                if (sliders.length === 0) {
                    sliders = [//default sliders
                        {
                            color: gradx.get_random_rgb(),
                            position: gradx.get_random_position() //x percent of gradient panel(400px)
                        },
                        {
                            color: gradx.get_random_rgb(),
                            position: gradx.get_random_position()
                        }
                    ];

                }


                var obj = sliders;

                for (k in obj) {

                    if (typeof obj[k].position === "undefined")
                        break;

                    //convert % to px based on containers width
                    var delta = 26; //range: 26px tp 426px
                    position = parseInt((obj[k].position * this.container_width) / 100) + delta + "px";

                    id = "gradx_slider_" + (this.slider_index); //create an id for this slider
                    this.sliders.push(
                            [
                                obj[k].color,
                                obj[k].position
                            ]
                            );

                    this.slider_ids.push(id); //for reference wrt to id

                    slider = "<div class='gradx_slider' id='" + id + "'></div>";
                    gradx.gx("#gradx_start_sliders_" + this.id).append(slider);

                    gradx.gx('#' + id).css("backgroundColor", obj[k].color).css("left", position);
                    this.slider_index++;
                }

                for (var i = 0, len = this.slider_ids.length; i < len; i++) {

                    gradx.gx('#' + this.slider_ids[i]).draggable({
                        containment: 'parent',
                        axis: 'x',
                        start: function() {
                            if (gradx.jQ_present)
                                gradx.current_slider_id = "#" + gradx.gx(this).attr("id"); //got full jQuery power here !
                        },
                        drag: function() {

                            gradx.update_style_array();
                            gradx.apply_style(gradx.panel, gradx.get_style_value());
                            var left = gradx.gx(gradx.current_slider_id).css("left");


                            if (parseInt(left) > 26 && parseInt(left) < 426) {
                                gradx.gx("#gradx_slider_info") //info element cached before
                                        .css("left", left)
                                        .show();

                            } /*else {
                             if (parseInt(left) > 120) {
                             left = "272px";
                             } else {
                             left = "120px";
                             }
                             
                             gradx.gx("#gradx_slider_info") //info element cached before
                             .css("left", left)
                             .show();
                             
                             }*/
                            var color = gradx.gx(gradx.current_slider_id).css("backgroundColor");
                            //but what happens if @color is not in RGB ? :(
                            var rgb = gradx.get_rgb_obj(color);
                            gradx.cp.colorPicker("set", rgb);

                        }

                    }).click(function() {
                        gradx.load_info(this);
                        return false;
                    });
                }


            },
            set_colorpicker: function(clr) {
                gradx.cp.colorPicker({
                    move: function(color) {
                        if (gradx.current_slider_id != false) {
                            var rgba = color.toRgbString();
                            gradx.gx(gradx.current_slider_id).css('background-color', rgba);
                            gradx.update_style_array();
                            gradx.apply_style(gradx.panel, gradx.get_style_value());
                        }
                    },
                    change: function() {
                        gradx.gx("#gradx_slider_info").hide();
                    },
                    flat: true,
                    showAlpha: true,
                    color: clr,
                    clickoutFiresChange: true,
                    showInput: true,
                    showButtons: false

                });
            },
            generate_options: function(options) {

                var len = options.length,
                        name, state,
                        str = '';

                for (var i = 0; i < len; i++) {

                    name = options[i].split(" ");

                    name = name[0];

                    if (i < 2) {
                        state = name[1];
                    } else {
                        state = '';
                    }

                    name = name.replace("-", " ");

                    str += '<option value=' + options[i] + ' ' + state + '>' + name + '</option>';

                }

                return str;
            },
            generate_radial_options: function() {

                var options;
                options = ["horizontal-center disabled", "center selected", "left", "right"];
                gradx.gx('#gradx_gradient_subtype').html(gradx.generate_options(options));

                options = ["vertical-center disabled", "center selected", "top", "bottom"];
                gradx.gx('#gradx_gradient_subtype2').html(gradx.generate_options(options)).show();

            },
            generate_linear_options: function() {

                var options;
                options = ["horizontal-center disabled", "left selected", "right", "top", "bottom"];
                gradx.gx('#gradx_gradient_subtype').html(gradx.generate_options(options));

                gradx.gx('#gradx_gradient_subtype2').hide();

            },
            destroy: function() {
                var options = {
                    targets: [], //[element selector] -> array
                    sliders: [],
                    direction: 'left',
                    //if linear left | top | right | bottom
                    //if radial left | center | right , top | center | bottom 
                    type: 'linear', //linear | circle | ellipse
                    code_shown: false, //false | true
                    change: function(sliders, styles) {
                        //nothing to do here by default
                    }
                };

                for (var k in options) {
                    gradx[k] = options[k];
                }
            },
            load_gradx: function(id, sliders) {
                this.me = gradx.gx(id);
                this.id = id.replace("#", "");
                id = this.id;
                this.current_slider_id = false;
                var html = "<div class='gradx'>\n"+
                            "<div id='gradx_add_slider' class='gradx_add_slider gradx_btn'><i class='icon icon-add'></i>add</div>\n"+
                            "<div class='gradx_slectboxes'>\n"+
                            "<select id='gradx_gradient_type' class='gradx_gradient_type'>\n"+
                            "    <option value='linear'>Linear</option>\n"+
                            "    <option value='circle'>Radial - Circle</option>\n"+
                            "    <option value='ellipse'>Radial - Ellipse</option>\n"+
                            "</select>\n"+
                            "<select id='gradx_gradient_subtype' class='gradx_gradient_type'>\n"+
                            "    <option id='gradx_gradient_subtype_desc' value='gradient-direction' disabled>gradient direction</option>\n"+
                            "    <option value='left' selected>Left</option>\n"+
                            "    <option value='right'>Right</option>\n"+
                            "    <option value='top'>Top</option>\n"+
                            "    <option value='bottom'>Bottom</option>\n"+
                            "</select>\n"+
                            "<select id='gradx_gradient_subtype2' class='gradx_gradient_type gradx_hide'>\n"+
                            "</select>\n"+
                            "<select id='gradx_radial_gradient_size' class='gradx_gradient_type gradx_hide'>\n"+
                            "</select>\n"+
                            "</div>\n"+
                            "<div class='gradx_container' id='gradx_" + id + "'>\n"+
                            "    <div id='gradx_stop_sliders_" + id + "'></div>\n"+
                            "    <div class='gradx_panel' id='gradx_panel_" + id + "'></div>\n"+
                            "    <div class='gradx_start_sliders' id='gradx_start_sliders_" + id + "'>\n"+
                            "        <div class='cp-default' id='gradx_slider_info'>\n"+
                            "            <div id='gradx_slider_controls'>\n"+
                            "                <div id='gradx_delete_slider' class='gradx_btn'><i class='icon icon-remove'></i>delete</div>\n"+
                            "            </div>\n"+
                            "            <div id='gradx_slider_content'></div>\n"+
                            "        </div> \n"+
                            "    </div>\n"+
                            "</div>\n"+
                            "<div id='gradx_show_code' class='gradx_show_code gradx_btn'><i class='icon icon-file-css'></i><span>show the code</span></div>\n"+
                            "<div id='gradx_show_presets' style='display:none' class='gradx_show_presets gradx_btn'><i class='icon icon-preset'></i><span>show presets</span></div>\n"+
                            "<textarea class='gradx_code' id='gradx_code'></textarea>\n"+
                        "</div>";

                this.me.html(html);


                //generates html to select the different gradient sizes
                // *only available for radial gradients
                var gradient_size_val = ["gradient-size disabled", "closest-side selected", "closest-corner", "farthest-side", "farthest-corner", "contain", "cover"],
                        option_str = '';


                option_str = gradx.generate_options(gradient_size_val);

                gradx.gx('#gradx_radial_gradient_size').html(option_str);


                //cache divs for fast reference

                this.container = gradx.gx("#gradx_" + id);
                this.panel = gradx.gx("#gradx_panel_" + id);
                //.hide();
                //this.info.hide();
                this.container_width = 400 //HARDCODE;
                this.add_slider(sliders);


                gradx.add_event(document, 'click', function() {
    //            if(!gradx.jQ_present){
                    if (!gradx.slider_hovered[id]) {
                        gradx.gx("#gradx_slider_info").hide();
                        return false;
                    }
                });



                gradx.gx('#gradx_add_slider').click(function() {
                    gradx.add_slider([
                        {
                            color: gradx.get_random_rgb(),
                            position: gradx.get_random_position() //no % symbol
                        }
                    ]);
                    gradx.update_style_array();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                //cache the element
                gradx.cp = gradx.gx('#gradx_slider_content');

                //call the colorpicker plugin
                gradx.set_colorpicker("blue");

                gradx.gx('#gradx_delete_slider').click(function() {
                    gradx.gx(gradx.current_slider_id).remove();
                    gradx.gx("#gradx_slider_info").hide();
                    var id = gradx.current_slider_id.replace("#", "");

                    //remove all references from array for current deleted slider

                    for (var i = 0; i < gradx.slider_ids.length; i++) {
                        if (gradx.slider_ids[i] == id) {
                            gradx.slider_ids.splice(i, 1);
                        }
                    }

                    //apply modified style after removing the slider
                    gradx.update_style_array();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());

                    gradx.current_slider_id = false; //no slider is selected

                });

                gradx.gx('#gradx_code').focus(function() {
                    var $this = gradx.gx(this);
                    $this.select();

                    // Work around Chrome's little problem
                    $this.mouseup(function() {
                        // Prevent further mouseup intervention
                        $this.off("mouseup");
                        return false;
                    });
                });

                gradx.gx('#gradx_gradient_type').change(function() {

                    var type = gradx.gx(this).val(), options, option_str = '';

                    if (type !== "linear") {
                        //gradx.gx('#gradx_radial_gradient_size').show();

                        gradx.generate_radial_options();
                    } else {

                        gradx.generate_linear_options();
                        gradx.gx('#gradx_gradient_subtype').val("left");
                    }

                    gradx.type = type;
                    gradx.direction = gradx.gx('#gradx_gradient_subtype').val();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
                });

                //change type onload userdefined
                if (this.type !== "linear") {
                    gradx.gx('#gradx_gradient_type').val(this.type);
                    gradx.generate_radial_options();

                    var h, v;

                    if (this.direction !== 'left') {
                        //user has passed his own direction
                        var center;
                        if (this.direction.indexOf(",") > -1) {
                            center = this.direction.split(",");
                        } else {
                            //tolerate user mistakes
                            center = this.direction.split(" ");
                        }

                        h = center[0];
                        v = center[1];

                        //update the center points in the corr. select boxes
                        gradx.gx('#gradx_gradient_subtype').val(h);
                        gradx.gx('#gradx_gradient_subtype2').val(v);
                    } else {
                        var h = gradx.gx('#gradx_gradient_subtype').val();
                        var v = gradx.gx('#gradx_gradient_subtype2').val();
                    }

                    gradx.direction = h + " " + v;
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)
                } else {

                    //change direction if not left
                    if (this.direction !== 'left') {
                        gradx.gx('#gradx_gradient_subtype').val(this.direction);
                    }
                }

                gradx.gx('#gradx_gradient_subtype').change(function() {

                    if (gradx.type === 'linear') {
                        gradx.direction = gradx.gx(this).val();
                    } else {
                        var h = gradx.gx(this).val();
                        var v = gradx.gx('#gradx_gradient_subtype2').val();
                        gradx.direction = h + " " + v;
                    }
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                gradx.gx('#gradx_gradient_subtype2').change(function() {

                    var h = gradx.gx('#gradx_gradient_subtype').val();
                    var v = gradx.gx(this).val();
                    gradx.direction = h + " " + v;
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                //not visible
                gradx.gx('#gradx_radial_gradient_size').change(function() {
                    gradx.shape = gradx.gx(this).val();
                    gradx.apply_style(gradx.panel, gradx.get_style_value());//(where,style)

                });

                gradx.gx('#gradx_show_code').click(function() {

                    if (gradx.code_shown) {
                        //hide it

                        gradx.code_shown = false;
                        gradx.gx('#gradx_show_code span').text("show the code");
                        gradx.gx("#gradx_code").hide();
                    }
                    else {
                        //show it

                        gradx.gx('#gradx_show_code span').text("hide the code");
                        gradx.gx("#gradx_code").show();
                        gradx.code_shown = true;
                    }
                });

                //show or hide onload
                if (gradx.code_shown) {
                    //show it

                    gradx.gx('#gradx_show_code span').text("hide the code");
                    gradx.gx("#gradx_code").show();

                }

                gradx.add_event(document.getElementById('gradx_slider_info'), 'mouseout', function() {
                    gradx.slider_hovered[id] = false;
                });
                gradx.add_event(document.getElementById('gradx_slider_info'), 'mouseover', function() {
                    gradx.slider_hovered[id] = true;

                });

            }




        };



        function  add_event(element, event, event_function)
        {
            if (element.attachEvent) //Internet Explorer
                element.attachEvent("on" + event, function() {
                    event_function.call(element);
                });
            else if (element.addEventListener) //Firefox & company
                element.addEventListener(event, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way
        }
        ;



        //load jQuery library into gradx.gx
        gradx.load_jQ();


        /* merge _options into options */
        langx.mixin(options, _options);

        //apply options to gradx object

        for (var k in options) {

            //load the options into gradx object
            gradx[k] = options[k];

        }

        gradx.load_gradx(id, gradx.sliders);
        gradx.apply_default_styles();


    };

    return skylark.attach("domx.Gradienter",gradX);
});
define('skylark-domx-gradienter/main',[
    "./Gradienter",
], function(Gradienter) {
    return Gradienter;
});

define('skylark-domx-gradienter', ['skylark-domx-gradienter/main'], function (main) { return main; });

define('skylark-domx-forms/forms',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("domx.forms",{});
});
define('skylark-domx-forms/deserialize',[
  "skylark-langx/langx",
  "skylark-domx-query",
  "./forms"
],function(langx,$,forms){
  /**
   * Updates a key/valueArray with the given property and value. Values will always be stored as arrays.
   *
   * @param prop The property to add the value to.
   * @param value The value to add.
   * @param obj The object to update.
   * @returns {object} Updated object.
   */
  function updateKeyValueArray( prop, value, obj ) {
    var current = obj[ prop ];

    if ( current === undefined ) {
      obj[ prop ] = [ value ];
    } else {
      current.push( value );
    }

    return obj;
  }

  /**
   * Get all of the fields contained within the given elements by name.
   *
   * @param formElm The form element.
   * @param filter Custom filter to apply to the list of fields.
   * @returns {object} All of the fields contained within the given elements, keyed by name.
   */
  function getFieldsByName(formElm, filter ) {
    var elementsByName = {};

    // Extract fields from elements
    var fields = $(formElm)
      .map(function convertFormToElements() {
        return this.elements ? langx.makeArray( this.elements ) : this;
      })
      .filter( filter || ":input:not(:disabled)" )
      .get();

    langx.each( fields, function( index, field ) {
      updateKeyValueArray( field.name, field, elementsByName );
    });

    return elementsByName;
  }

  /**
   * Figure out the type of an element. Input type will be used first, falling back to nodeName.
   *
   * @param element DOM element to check type of.
   * @returns {string} The element's type.
   */
  function getElementType( element ) {
    return ( element.type || element.nodeName ).toLowerCase();
  }

  /**
   * Normalize the provided data into a key/valueArray store.
   *
   * @param data The data provided by the user to the plugin.
   * @returns {object} The data normalized into a key/valueArray store.
   */
  function normalizeData( data ) {
    var normalized = {};
    var rPlus = /\+/g;

    // Convert data from .serializeObject() notation
    if ( langx.isPlainObject( data ) ) {
      langx.extend( normalized, data );

      // Convert non-array values into an array
      langx.each( normalized, function( name, value ) {
        if ( !langx.isArray( value ) ) {
          normalized[ name ] = [ value ];
        }
      });

    // Convert data from .serializeArray() notation
    } else if ( langx.isArray( data ) ) {
      langx.each( data, function( index, field ) {
        updateKeyValueArray( field.name, field.value, normalized );
      });

    // Convert data from .serialize() notation
    } else if ( typeof data === "string" ) {
      langx.each( data.split( "&" ), function( index, field ) {
        var current = field.split( "=" );
        var name = decodeURIComponent( current[ 0 ].replace( rPlus, "%20" ) );
        var value = decodeURIComponent( current[ 1 ].replace( rPlus, "%20" ) );
        updateKeyValueArray( name, value, normalized );
      });
    }

    return normalized;
  }

  /**
   * Map of property name -> element types.
   *
   * @type {object}
   */
  var updateTypes = {
    checked: [
      "radio",
      "checkbox"
    ],
    selected: [
      "option",
      "select-one",
      "select-multiple"
    ],
    value: [
      "button",
      "color",
      "date",
      "datetime",
      "datetime-local",
      "email",
      "hidden",
      "month",
      "number",
      "password",
      "range",
      "reset",
      "search",
      "submit",
      "tel",
      "text",
      "textarea",
      "time",
      "url",
      "week"
    ]
  };

  /**
   * Get the property to update on an element being updated.
   *
   * @param element The DOM element to get the property for.
   * @returns The name of the property to update if element is supported, otherwise `undefined`.
   */
  function getPropertyToUpdate( element ) {
    var type = getElementType( element );
    var elementProperty = undefined;

    langx.each( updateTypes, function( property, types ) {
      if ( langx.inArray( type, types ) > -1 ) {
        elementProperty = property;
        return false;
      }
    });

    return elementProperty;
  }

  /**
   * Update the element based on the provided data.
   *
   * @param element The DOM element to update.
   * @param elementIndex The index of this element in the list of elements with the same name.
   * @param value The serialized element value.
   * @param valueIndex The index of the value in the list of values for elements with the same name.
   * @param callback A function to call if the value of an element was updated.
   */
  function update( element, elementIndex, value, valueIndex, callback ) {
    var property = getPropertyToUpdate( element );

    // Handle value inputs
    // If there are multiple value inputs with the same name, they will be populated by matching indexes.
    if ( property == "value" && elementIndex == valueIndex ) {
      element.value = value;
      callback.call( element, value );

    // Handle select menus, checkboxes and radio buttons
    } else if ( property == "checked" || property == "selected" ) {
      var fields = [];

      // Extract option fields from select menus
      if ( element.options ) {
        langx.each( element.options, function( index, option ) {
          fields.push( option );
        });

      } else {
        fields.push( element );
      }

      // #37: Remove selection from multiple select menus before deserialization
      if ( element.multiple && valueIndex == 0 ) {
        element.selectedIndex = -1;
      }

      langx.each( fields, function( index, field ) {
        if ( field.value == value ) {
          field[ property ] = true;
          callback.call( field, value );
        }
      });
    }
  }

  /**
   * Default plugin options.
   *
   * @type {object}
   */
  var defaultOptions = {
    change: langx.noop,
    complete: langx.noop
  };

  /**
   * The $.deserialize function.
   *
   * @param data The data to deserialize.
   * @param options Additional options.
   * @returns {jQuery} The jQuery object that was provided to the plugin.
   */
  function deserialize(formElm,data, options ) {

    // Backwards compatible with old arguments: data, callback
    if ( langx.isFunction( options ) ) {
      options = { complete: options };
    }

    options = langx.extend( defaultOptions, options || {} );
    data = normalizeData( data );

    var elementsByName = getFieldsByName( formElm, options.filter );

    langx.each( data, function( name, values ) {
      langx.each( elementsByName[ name ], function( elementIndex, element ) {
        langx.each( values, function( valueIndex, value ) {
          update( element, elementIndex, value, valueIndex, options.change );
        });
      });
    });

    options.complete.call( formElm );

    return this;
  };

  return forms.deserialize = deserialize;
});
define('skylark-domx-forms/serializeArray',[
  "skylark-langx/langx",
  "skylark-domx-data",
  "./forms"
],function(langx,datax,forms){
    function serializeArray(formElm) {
        var name, type, result = [],
            add = function(value) {
                if (value.forEach) return value.forEach(add)
                result.push({ name: name, value: value })
            }
        langx.each(formElm.elements, function(_, field) {
            type = field.type, name = field.name
            if (name && field.nodeName.toLowerCase() != 'fieldset' &&
                !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
                ((type != 'radio' && type != 'checkbox') || field.checked))
                add(datax.val(field))
        })
        return result
    };

    return forms.serializeArray = serializeArray;
});

define('skylark-domx-forms/serializeObject',[
  "skylark-langx/langx",
  "./forms",
  "./serializeArray"
],function(langx,forms,serializeArray){

  function serializeObject(formElm){
    var obj = {};
    
    langx.each(serializeArray(formElm), function(i,o){
      var n = o.name,
        v = o.value;
        
        obj[n] = obj[n] === undefined ? v
          : langx.isArray( obj[n] ) ? obj[n].concat( v )
          : [ obj[n], v ];
    });
    
    return obj;
  }

  return forms.serializeObject = serializeObject;
});  
define('skylark-domx-forms/serialize',[
  "skylark-langx/langx",
  "./forms",
  "./serializeArray"
],function(langx,forms,serializeArray){
    function serialize(formElm) {
        var result = []
        serializeArray(formElm).forEach(function(elm) {
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    return forms.serialize = serialize;
});
define('skylark-domx-forms/main',[
	"./forms",
    "skylark-domx-velm",
    "skylark-domx-query",
    "./deserialize",
    "./serializeArray",
    "./serializeObject",
    "./serialize"
],function(forms,velm,$){

    // from ./data
    velm.delegate([
        "deserialize",
        "serializeArray",
        "serializeObject",
        "serialize"
    ], forms);

    $.fn.deserialize = $.wraps.wrapper_value(forms.deserialize, forms, forms.deserialize);
    $.fn.serializeArray = $.wraps.wrapper_value(forms.serializeArray, forms, forms.serializeArray);
    $.fn.serializeObject = $.wraps.wrapper_value(forms.serializeObject, forms, forms.serializeObject);
    $.fn.serialize = $.wraps.wrapper_value(forms.serialize, forms, forms.serialize);


	return forms;
});
define('skylark-domx-forms', ['skylark-domx-forms/main'], function (main) { return main; });

define('skylark-jquery/core',[
	"skylark-langx/skylark",
	"skylark-langx/langx",
	"skylark-domx-browser",
	"skylark-domx-noder",
	"skylark-domx-data",
	"skylark-domx-eventer",
	"skylark-domx-finder",
	"skylark-domx-forms",
	"skylark-domx-fx",
	"skylark-domx-styler",
	"skylark-domx-query",
	"skylark-domx-scripter"
],function(skylark,langx,browser,noder,datax,eventer,finder,forms,fx,styler,query,scripter){
	var filter = Array.prototype.filter,
		slice = Array.prototype.slice;

    (function($){
	    $.fn.jquery = '2.2.0';

	    $.browser = browser;
	    
	    $.camelCase = langx.camelCase;

		$.cleanData = function( elems ) {
			var elem,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				datax.cleanData(elem);
			}
		};

		$.removeData = function(elm,name) {
			datax.removeData(elm,name);
		}
	
	    $.each = langx.each;

	    $.extend = langx.extend;

	    $.grep = function(elements, callback) {
	        return filter.call(elements, callback)
	    };

	    $.attr = function(elm,name) {
	    	return datax.attr(elm,name);
	    };

	    $.isArray = langx.isArray;
	    $.isEmptyObject = langx.isEmptyObject;
	    $.isFunction = langx.isFunction;
	    $.isWindow = langx.isWindow;
	    $.isPlainObject = langx.isPlainObject;
        $.isNumeric = langx.isNumber;

	    $.inArray = langx.inArray;

	    $.makeArray = langx.makeArray;
	    $.map = langx.map;  // The behavior is somewhat different from the original jquery.

	    $.noop = function() {
	    };

	    $.parseJSON = window.JSON.parse;

	    $.proxy = langx.proxy;

	    $.trim = langx.trim;
	    $.type = langx.type;

	    $.fn.extend = function(props) {
	        langx.mixin($.fn, props);
	    };


    })(query);

    (function($){
        $.Event = function Event(src, props) {
            if (langx.isString(src)) {
            	var type = src;
            	return eventer.create(type, props);
	        }
            return eventer.proxy(src, props);
        };

        $.event = {};

	    $.event.special = eventer.special;

	    $.fn.submit = function(callback) {
	        if (0 in arguments) this.bind('submit', callback)
	        else if (this.length) {
	            var event = $.Event('submit')
	            this.eq(0).trigger(event)
	            if (!event.isDefaultPrevented()) this.get(0).submit()
	        }
	        return this
	    };

	    // event
	    $.fn.triggerHandler = $.fn.trigger;

	    $.fn.delegate = function(selector, event, callback) {
	        return this.on(event, selector, callback)
	    };

	    $.fn.undelegate = function(selector, event, callback) {
	        return this.off(event, selector, callback)
	    };

	    $.fn.live = function(event, callback) {
	        $(document.body).delegate(this.selector, event, callback)
	        return this
	    };

	    $.fn.die = function(event, callback) {
	        $(document.body).undelegate(this.selector, event, callback)
	        return this
	    };

	    $.fn.bind = function(event, selector, data, callback) {
	        return this.on(event, selector, data, callback)
	    };

	    $.fn.unbind = function(event, callback) {
	        return this.off(event, callback)
	    };

	    $.fn.ready = function(callback) {
	        eventer.ready(callback);
	        return this;
	    };

	    $.fn.stop = function() {
	        // todo
	        return this;
	    };

	    $.fn.moveto = function(x, y) {
	        return this.animate({
	            left: x + "px",
	            top: y + "px"
	        }, 0.4);

	    };

	    $.ready = eventer.ready;

	    $.on = eventer.on;

	    $.off = eventer.off;
    })(query);

    (function($){
	    // plugin compatibility
	    $.uuid = 0;
	    $.support = browser.support;
	    $.expr = {};

	    $.expr[":"] = $.expr.pseudos = $.expr.filters = finder.pseudos;

	    $.expr.createPseudo = function(fn) {
	    	return fn;
	    };

	    $.cssHooks = styler.cssHooks;

	    $.contains = noder.contains;

	    $.css = styler.css;

	    $.data = datax.data;

	    $.fx = fx;
	    $.fx.step = {

        };

        $.speed = function( speed, easing, fn ) {
            var opt = speed && typeof speed === "object" ? $.extend( {}, speed ) : {
                complete: fn || !fn && easing ||
                    $.isFunction( speed ) && speed,
                duration: speed,
                easing: fn && easing || easing && !$.isFunction( easing ) && easing
            };

            // Go to the end state if fx are off
            if ( $.fx.off ) {
                opt.duration = 0;

            } else {
                if ( typeof opt.duration !== "number" ) {
                    if ( opt.duration in $.fx.speeds ) {
                        opt.duration = $.fx.speeds[ opt.duration ];

                    } else {
                        opt.duration = $.fx.speeds._default;
                    }
                }
            }

            // Normalize opt.queue - true/undefined/null -> "fx"
            if ( opt.queue == null || opt.queue === true ) {
                opt.queue = "fx";
            }

            // Queueing
            opt.old = opt.complete;

            opt.complete = function() {
                if ( $.isFunction( opt.old ) ) {
                    opt.old.call( this );
                }

                if ( opt.queue ) {
                    $.dequeue( this, opt.queue );
                }
            };

            return opt;
        };

        $.easing = {};

	    $.offset = {};
	    $.offset.setOffset = function(elem, options, i) {
	        var position = $.css(elem, "position");

	        // set position first, in-case top/left are set even on static elem
	        if (position === "static") {
	            elem.style.position = "relative";
	        }

	        var curElem = $(elem),
	            curOffset = curElem.offset(),
	            curCSSTop = $.css(elem, "top"),
	            curCSSLeft = $.css(elem, "left"),
	            calculatePosition = (position === "absolute" || position === "fixed") && $.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
	            props = {},
	            curPosition = {},
	            curTop, curLeft;

	        // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
	        if (calculatePosition) {
	            curPosition = curElem.position();
	            curTop = curPosition.top;
	            curLeft = curPosition.left;
	        } else {
	            curTop = parseFloat(curCSSTop) || 0;
	            curLeft = parseFloat(curCSSLeft) || 0;
	        }

	        if ($.isFunction(options)) {
	            options = options.call(elem, i, curOffset);
	        }

	        if (options.top != null) {
	            props.top = (options.top - curOffset.top) + curTop;
	        }
	        if (options.left != null) {
	            props.left = (options.left - curOffset.left) + curLeft;
	        }

	        if ("using" in options) {
	            options.using.call(elem, props);
	        } else {
	            curElem.css(props);
	        }
	    };

        $._data = function(elm,propName) {
            if (elm.hasAttribute) {
                return datax.data(elm,propName);
            } else {
                return {};
            }
        };

     	var t = $.fn.text;  
	    $.fn.text = function(v) {
	        var r = t.apply(this,arguments);
	        if (r === undefined) {
	            r = "";
	        }  
	        return r;
	    };       

	    $.fn.pos = $.fn.position;
        	    
    })(query);

    query.parseHTML = function(html) {
        return  noder.createFragment(html);
    };

    query.uniqueSort = query.unique = langx.uniq;

    query.skylark = skylark;

    return window.jQuery = window.$ = query;
});

define('skylark-jquery/ajax',[
    "skylark-langx/langx",
    "skylark-net-http/Xhr",
    "./core",
], function(langx,Xhr,$) {
    var jsonpID = 0;

     // Attach a bunch of functions for handling common AJAX events
    $.each( [
        "ajaxStart",
        "ajaxStop",
        "ajaxComplete",
        "ajaxError",
        "ajaxSuccess",
        "ajaxSend"
    ], function( i, type ) {
        $.fn[ type ] = function( fn ) {
            return this.on( type, fn );
        };
    } );
   

    function appendQuery(url, query) {
        if (query == '') return url
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }
    
    $.ajaxJSONP = function(options) {
        var deferred = new langx.Deferred();
        var _callbackName = options.jsonpCallback,
            callbackName = ($.isFunction(_callbackName) ?
                _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
            script = document.createElement('script'),
            originalCallback = window[callbackName],
            responseData,
            abort = function(errorType) {
                $(script).triggerHandler('error', errorType || 'abort')
            },
            xhr = { abort: abort },
            abortTimeout;

        for (var key in options.data) {
            options.url = appendQuery(options.url, key + "=" + options.data[key]);
        }
         
//        if (deferred) deferred.promise(xhr)

        $(script).on('load error', function(e, errorType) {
            clearTimeout(abortTimeout)
            $(script).off().remove()

            if (e.type == 'error' || !responseData) {
                deferred.reject(e);
            } else {
                deferred.resolve(responseData[0],200,xhr);
            }

            window[callbackName] = originalCallback
            if (responseData && $.isFunction(originalCallback))
                originalCallback(responseData[0])

            originalCallback = responseData = undefined
        })

        window[callbackName] = function() {
            responseData = arguments
        }

        script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
        document.head.appendChild(script)

        if (options.timeout > 0) abortTimeout = setTimeout(function() {
            abort('timeout')
        }, options.timeout)

        return deferred;
    }

    //$.ajaxSettings = Xhr.defaultOptions;
    //$.ajaxSettings.xhr = function() {
    //    return new window.XMLHttpRequest()
    //};

    $.ajaxSettings = {
        processData : true
    };


    $.ajax = function(url,options) {
        if (!url) {
            options = {
                url :  "./"
            };
        } else if (!options) {
            if (langx.isString(url)) {
                options = {
                    url :  url
                };
            } else {
                options = url;
            }
        } else {
            options.url = url;
        }

        options = langx.mixin({},$.ajaxSettings,options);

        if ('jsonp' == options.dataType) {
            var hasPlaceholder = /\?.+=\?/.test(options.url);

            if (!hasPlaceholder)
                options.url = appendQuery(options.url,
                    options.jsonp ? (options.jsonp + '=?') : options.jsonp === false ? '' : 'callback=?')
            return $.ajaxJSONP(options);
        }

        function ajaxSuccess(data,status,xhr) {
            $(document).trigger("ajaxSucess");
            if (options.success) {
                options.success.apply(this,arguments);
            }
            if (options.complete) {
                options.complete.apply(this,arguments);
            }
            return data;
        }

        function ajaxError() {
            $(document).trigger("ajaxError");
            if (options.error) {
                options.error.apply(this,arguments);
            }
        }

        var p = Xhr.request(options.url,options);
        p = p.then(ajaxSuccess,ajaxError);
        p.success = p.done;
        p.error = p.fail;
        p.complete = p.always;
        
        return p;
    };

    // handle optional data/success arguments
    function parseArguments(url, data, success, dataType) {
        if ($.isFunction(url)) {
            dataType = data, success = url, data = undefined,url = undefined;
        } else if ($.isFunction(data)) {
            dataType = success, success = data, data = undefined;
        } 
        if (!$.isFunction(success)) dataType = success, success = undefined
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        }
    }

    $.get = function( /* url, data, success, dataType */ ) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function( /* url, data, success, dataType */ ) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    $.getJSON = function( /* url, data, success */ ) {
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
    }

    var originalLoad = $.fn.load;

    $.fn.load = function(url, data, success) {
        if ("string" != typeof url && originalLoad) {
            return originalLoad.apply(this, arguments);
        }
        if (!this.length) return this
        var self = this,
            options = parseArguments(url, data, success),
            parts = options.url && options.url.split(/\s/),
            selector,
            callback = options.success
        if (parts && parts.length > 1) options.url = parts[0], selector = parts[1]

        if (options.data && typeof options.data === "object") {
            options.type = "POST";
        }
        options.success = function(response) {
            self.html(selector ?
                $('<div>').html(response.replace(rscript, "")).find(selector) : response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    $.param = Xhr.param;


    // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
    function addToPrefiltersOrTransports(structure) {

        // dataTypeExpression is optional and defaults to "*"
        return function(dataTypeExpression, func) {

            if (typeof dataTypeExpression !== "string") {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }

            var dataType,
                i = 0,
                dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];

            if (jQuery.isFunction(func)) {

                // For each dataType in the dataTypeExpression
                while ((dataType = dataTypes[i++])) {

                    // Prepend if requested
                    if (dataType[0] === "+") {
                        dataType = dataType.slice(1) || "*";
                        (structure[dataType] = structure[dataType] || []).unshift(func);

                        // Otherwise append
                    } else {
                        (structure[dataType] = structure[dataType] || []).push(func);
                    }
                }
            }
        };
    }

    var
        prefilters = {},
        transports = {},
        rnotwhite = (/\S+/g);

    $.ajaxPrefilter = addToPrefiltersOrTransports(prefilters);
    $.ajaxTransport = addToPrefiltersOrTransports(transports);
    $.ajaxSetup = function(target, settings) {
        langx.mixin(Xhr.defaultOptions,target,settings);
    };

    $.getScript = function( url, callback ) {
        return $.get( url, undefined, callback, "script" );
    };

    return $;

});

define('skylark-jquery/callbacks',[
    "./core"
], function($) {

    //     This module is borrow from zepto.callback.js
    //     (c) 2010-2014 Thomas Fuchs
    //     Zepto.js may be freely distributed under the MIT license.

    // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
    // Option flags:
    //   - once: Callbacks fired at most one time.
    //   - memory: Remember the most recent context and arguments
    //   - stopOnFalse: Cease iterating over callback list
    //   - unique: Permit adding at most one instance of the same callback
    $.Callbacks = function(options) {
        options = $.extend({}, options)

        var memory, // Last fire value (for non-forgettable lists)
            fired, // Flag to know if list was already fired
            firing, // Flag to know if list is currently firing
            firingStart, // First callback to fire (used internally by add and fireWith)
            firingLength, // End of the loop when firing
            firingIndex, // Index of currently firing callback (modified by remove if needed)
            list = [], // Actual callback list
            stack = !options.once && [], // Stack of fire calls for repeatable lists
            fire = function(data) {
                memory = options.memory && data
                fired = true
                firingIndex = firingStart || 0
                firingStart = 0
                firingLength = list.length
                firing = true
                for (; list && firingIndex < firingLength; ++firingIndex) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false
                        break
                    }
                }
                firing = false
                if (list) {
                    if (stack) stack.length && fire(stack.shift())
                    else if (memory) list.length = 0
                    else Callbacks.disable()
                }
            },

            Callbacks = {
                add: function() {
                    if (list) {
                        var start = list.length,
                            add = function(args) {
                                $.each(args, function(_, arg) {
                                    if (typeof arg === "function") {
                                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                                    } else if (arg && arg.length && typeof arg !== 'string') add(arg)
                                })
                            }
                        add(arguments)
                        if (firing) firingLength = list.length
                        else if (memory) {
                            firingStart = start
                            fire(memory)
                        }
                    }
                    return this
                },
                remove: function() {
                    if (list) {
                        $.each(arguments, function(_, arg) {
                            var index
                            while ((index = $.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1)
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) --firingLength
                                    if (index <= firingIndex) --firingIndex
                                }
                            }
                        })
                    }
                    return this
                },
                has: function(fn) {
                    return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
                },
                empty: function() {
                    firingLength = list.length = 0
                    return this
                },
                disable: function() {
                    list = stack = memory = undefined
                    return this
                },
                disabled: function() {
                    return !list
                },
                lock: function() {
                    stack = undefined;
                    if (!memory) Callbacks.disable()
                    return this
                },
                locked: function() {
                    return !stack
                },
                fireWith: function(context, args) {
                    if (list && (!fired || stack)) {
                        args = args || []
                        args = [context, args.slice ? args.slice() : args]
                        if (firing) stack.push(args)
                        else fire(args)
                    }
                    return this
                },
                fire: function() {
                    return Callbacks.fireWith(this, arguments)
                },
                fired: function() {
                    return !!fired
                }
            }

        return Callbacks
    };

    return $;

});

define('skylark-jquery/deferred',[
    "./core",
    "skylark-langx/langx"
], function($,langx) {

    $.Deferred = function() {
        var d = new langx.Deferred(),
            ret = {
                promise : function() {
                    return d.promise;
                }
            };

        ["resolve","resolveWith","reject","rejectWith","notify","then","done","fail","progress","always","state"].forEach(function(name){
            ret[name] = function() {
              var ret2 =   d[name].apply(d,arguments);
              if (ret2 == d) {
                ret2 = ret;
              }
              return ret2;
            }
        });

        return ret;
    };
    
    $.when = function(){
        var p = langx.Deferred.all(langx.makeArray(arguments)),
            originThen = p.then;
        p.then = function(onResolved,onRejected) {
            var handler = function(results) {
                //results = results.map(function(result){
                //    return [result];
                //});
                return onResolved && onResolved.apply(null,results);
            };
            return originThen.call(p,handler,onRejected);
        };
        return p;
    };

    return $;

});

define('skylark-jquery/queue',[
    "skylark-langx/langx",
    "./core",
    "./callbacks"
], function(langx, $) {

 // jQuery Data object
  var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
      rmultiDash = /([A-Z])/g,
      expando = "Sky" + ( '1.0' + Math.random() ).replace( /\D/g, ""),
      optionsCache = {},
      core_rnotwhite = /\S+/g,
      core_deletedIds = [],
      core_push = core_deletedIds.push;

// Convert String-formatted options into Object-formatted ones and store in cache
  function createOptions( options ) {
    var object = optionsCache[ options ] = {};
    $.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
      object[ flag ] = true;
    });
    return object;
  }

  function isArraylike( obj ) {
    var length = obj.length,
        type = $.type( obj );

    if ( $.isWindow( obj ) ) {
      return false;
    }

    if ( obj.nodeType === 1 && length ) {
      return true;
    }

    return type === "array" || type !== "function" &&
        ( length === 0 ||
            typeof length === "number" && length > 0 && ( length - 1 ) in obj );
  }

  

  function Data() {
    // Support: Android < 4,
    // Old WebKit does not have Object.preventExtensions/freeze method,
    // return new empty object instead with no [[set]] accessor
    Object.defineProperty( this.cache = {}, 0, {
      get: function() {
        return {};
      }
    });

    this.expando = expando + Math.random();
  }

  Data.uid = 1;

  Data.accepts = function( owner ) {
    // Accepts only:
    //  - Node
    //    - Node.ELEMENT_NODE
    //    - Node.DOCUMENT_NODE
    //  - Object
    //    - Any
    return owner.nodeType ?
        owner.nodeType === 1 || owner.nodeType === 9 : true;
  };

  Data.prototype = {
    key: function( owner ) {
      // We can accept data for non-element nodes in modern browsers,
      // but we should not, see #8335.
      // Always return the key for a frozen object.
      if ( !Data.accepts( owner ) ) {
        return 0;
      }

      var descriptor = {},
      // Check if the owner object already has a cache key
          unlock = owner[ this.expando ];

      // If not, create one
      if ( !unlock ) {
        unlock = Data.uid++;

        // Secure it in a non-enumerable, non-writable property
        try {
          descriptor[ this.expando ] = { value: unlock };
          Object.defineProperties( owner, descriptor );

          // Support: Android < 4
          // Fallback to a less secure definition
        } catch ( e ) {
          descriptor[ this.expando ] = unlock;
          $.extend( owner, descriptor );
        }
      }

      // Ensure the cache object
      if ( !this.cache[ unlock ] ) {
        this.cache[ unlock ] = {};
      }

      return unlock;
    },
    set: function( owner, data, value ) {
      var prop,
      // There may be an unlock assigned to this node,
      // if there is no entry for this "owner", create one inline
      // and set the unlock as though an owner entry had always existed
          unlock = this.key( owner ),
          cache = this.cache[ unlock ];

      // Handle: [ owner, key, value ] args
      if ( typeof data === "string" ) {
        cache[ data ] = value;

        // Handle: [ owner, { properties } ] args
      } else {
        // Fresh assignments by object are shallow copied
        if ( $.isEmptyObject( cache ) ) {
          $.extend( this.cache[ unlock ], data );
          // Otherwise, copy the properties one-by-one to the cache object
        } else {
          for ( prop in data ) {
            cache[ prop ] = data[ prop ];
          }
        }
      }
      return cache;
    },
    get: function( owner, key ) {
      // Either a valid cache is found, or will be created.
      // New caches will be created and the unlock returned,
      // allowing direct access to the newly created
      // empty data object. A valid owner object must be provided.
      var cache = this.cache[ this.key( owner ) ];

      return key === undefined ?
          cache : cache[ key ];
    },
    access: function( owner, key, value ) {
      var stored;
      // In cases where either:
      //
      //   1. No key was specified
      //   2. A string key was specified, but no value provided
      //
      // Take the "read" path and allow the get method to determine
      // which value to return, respectively either:
      //
      //   1. The entire cache object
      //   2. The data stored at the key
      //
      if ( key === undefined ||
          ((key && typeof key === "string") && value === undefined) ) {

        stored = this.get( owner, key );

        return stored !== undefined ?
            stored : this.get( owner, $.camelCase(key) );
      }

      // [*]When the key is not a string, or both a key and value
      // are specified, set or extend (existing objects) with either:
      //
      //   1. An object of properties
      //   2. A key and value
      //
      this.set( owner, key, value );

      // Since the "set" path can have two possible entry points
      // return the expected data based on which path was taken[*]
      return value !== undefined ? value : key;
    },
    remove: function( owner, key ) {
      var i, name, camel,
          unlock = this.key( owner ),
          cache = this.cache[ unlock ];

      if ( key === undefined ) {
        this.cache[ unlock ] = {};

      } else {
        // Support array or space separated string of keys
        if ( $.isArray( key ) ) {
          // If "name" is an array of keys...
          // When data is initially created, via ("key", "val") signature,
          // keys will be converted to camelCase.
          // Since there is no way to tell _how_ a key was added, remove
          // both plain key and camelCase key. #12786
          // This will only penalize the array argument path.
          name = key.concat( key.map( $.camelCase ) );
        } else {
          camel = $.camelCase( key );
          // Try the string as a key before any manipulation
          if ( key in cache ) {
            name = [ key, camel ];
          } else {
            // If a key with the spaces exists, use it.
            // Otherwise, create an array by matching non-whitespace
            name = camel;
            name = name in cache ?
                [ name ] : ( name.match( core_rnotwhite ) || [] );
          }
        }

        i = name.length;
        while ( i-- ) {
          delete cache[ name[ i ] ];
        }
      }
    },
    hasData: function( owner ) {
      return !$.isEmptyObject(
          this.cache[ owner[ this.expando ] ] || {}
      );
    },
    discard: function( owner ) {
      if ( owner[ this.expando ] ) {
        delete this.cache[ owner[ this.expando ] ];
      }
    }
  };

  var data_priv = new Data();

  $.extend($, {
    queue: function( elem, type, data ) {
      var queue;

      if ( elem ) {
        type = ( type || "fx" ) + "queue";
        queue = data_priv.get( elem, type );

        // Speed up dequeue by getting out quickly if this is just a lookup
        if ( data ) {
          if ( !queue || $.isArray( data ) ) {
            queue = data_priv.access( elem, type, $.makeArray(data) );
          } else {
            queue.push( data );
          }
        }
        return queue || [];
      }
    },

    dequeue: function( elem, type ) {
      type = type || "fx";

      var queue = $.queue( elem, type ),
          startLength = queue.length,
          fn = queue.shift(),
          hooks = $._queueHooks( elem, type ),
          next = function() {
            $.dequeue( elem, type );
          };

      // If the fx queue is dequeued, always remove the progress sentinel
      if ( fn === "inprogress" ) {
        fn = queue.shift();
        startLength--;
      }

      if ( fn ) {

        // Add a progress sentinel to prevent the fx queue from being
        // automatically dequeued
        if ( type === "fx" ) {
          queue.unshift( "inprogress" );
        }

        // clear up the last queue stop function
        delete hooks.stop;
        fn.call( elem, next, hooks );
      }

      if ( !startLength && hooks ) {
        hooks.empty.fire();
      }
    },

    // not intended for public consumption - generates a queueHooks object, or returns the current one
    _queueHooks: function( elem, type ) {
      var key = type + "queueHooks";
      return data_priv.get( elem, key ) || data_priv.access( elem, key, {
        empty: $.Callbacks("once memory").add(function() {
          data_priv.remove( elem, [ type + "queue", key ] );
        })
      });
    },

    // array operations
    makeArray: function( arr, results ) {
      var ret = results || [];

      if ( arr != null ) {
        if ( isArraylike( Object(arr) ) ) {
          $.merge( ret,
              typeof arr === "string" ?
                  [ arr ] : arr
          );
        } else {
          core_push.call( ret, arr );
        }
      }

      return ret;
    },
    merge: function( first, second ) {
      var l = second.length,
          i = first.length,
          j = 0;

      if ( typeof l === "number" ) {
        for ( ; j < l; j++ ) {
          first[ i++ ] = second[ j ];
        }
      } else {
        while ( second[j] !== undefined ) {
          first[ i++ ] = second[ j++ ];
        }
      }

      first.length = i;

      return first;
    }
  });

  $.extend($.fn, {
    queue: function( type, data ) {
      var setter = 2;

      if ( typeof type !== "string" ) {
        data = type;
        type = "fx";
        setter--;
      }

      if ( arguments.length < setter ) {
        return $.queue( this[0], type );
      }

      return data === undefined ?
          this :
          this.each(function() {
            var queue = $.queue( this, type, data );

            // ensure a hooks for this queue
            $._queueHooks( this, type );

            if ( type === "fx" && queue[0] !== "inprogress" ) {
              $.dequeue( this, type );
            }
          });
    },
    dequeue: function( type ) {
      return this.each(function() {
        $.dequeue( this, type );
      });
    },
    // Based off of the plugin by Clint Helfers, with permission.
    // http://blindsignals.com/index.php/2009/07/jquery-delay/
    delay: function( time, type ) {
      time = $.fx ? $.fx.speeds[ time ] || time : time;
      type = type || "fx";

      return this.queue( type, function( next, hooks ) {
        var timeout = setTimeout( next, time );
        hooks.stop = function() {
          clearTimeout( timeout );
        };
      });
    },
    clearQueue: function( type ) {
      return this.queue( type || "fx", [] );
    },
    // Get a promise resolved when queues of a certain type
    // are emptied (fx is the type by default)
    promise: function( type, obj ) {
      var tmp,
          count = 1,
          defer = $.Deferred(),
          elements = this,
          i = this.length,
          resolve = function() {
            if ( !( --count ) ) {
              defer.resolveWith( elements, [ elements ] );
            }
          };

      if ( typeof type !== "string" ) {
        obj = type;
        type = undefined;
      }
      type = type || "fx";

      while( i-- ) {
        tmp = data_priv.get( elements[ i ], type + "queueHooks" );
        if ( tmp && tmp.empty ) {
          count++;
          tmp.empty.add( resolve );
        }
      }
      resolve();
      return defer.promise( obj );
    }
  });

  return $;

});

define('skylark-jquery/JqueryPlugin',[
	"skylark-langx-types",
	"skylark-langx-objects",
	"skylark-langx-arrays",
	"skylark-langx/langx",
	"skylark-domx-data",
	"skylark-domx-eventer",
	"skylark-domx-plugins",
	"skylark-domx-query",
],function(types, objects, arrays, langx, datax, eventer, plugins, $){

    var pluginUuid = 0;

	var JqPlugin = plugins.Plugin.inherit({
		klassName : "JqPlugin",

        pluginEventPrefix: "",

        options: {
            // Callbacks
            create: null
        },

        destroy: function() {
            this.overrided();

            // We can probably remove the unbind calls in 2.0
            // all event bindings should go through this._on()
            this.element
                .off( this.eventNamespace );

            // Clean up events and states
            this.bindings.off( this.eventNamespace );
        },

        _construct : function(element,options) {
            //this.options = langx.mixin( {}, this.options );

            element = $( element || this.defaultElement || this )[ 0 ];
            this.element = $( element );
            this.uuid = pluginUuid++;
            this.eventNamespace = "." + this.pluginName + this.uuid;

            this.bindings = $();
            this.classesElementLookup = {};

			this.hoverable = $();
			this.focusable = $();

            if ( element !== this ) {
                datax.data( element, this.pluginName, this );
                this._on( true, this.element, {
                    remove: function( event ) {
                        if ( event.target === element ) {
                            this.destroy();
                        }
                    }
                } );
                this.document = $( element.style ?

                    // Element within the document
                    element.ownerDocument :

                    // Element is window or document
                    element.document || element );
                this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
            }

            this.overrided(element,options);

//            this.options = langx.mixin( {},
//                this.options,
//                this._getCreateOptions(),
//                options );

            this._create();

            this._trigger( "create", null, this._getCreateEventData() );

            this._init();
        },


	     _initOptions : function(options) {
	     	options = langx.mixin(this._getCreateOptions(),options);

			this.overrided(options);
		},

        _getCreateOptions: function() {
            return {};
        },

        _getCreateEventData: langx.noop,

		_super : function() {
			if (this.overrided) {
				return this.overrided.apply(this,arguments);
			}
		},

		_superApply : function ( args ) {
			if (this.overrided) {
				return this.overrided.apply(this,args);
			}
		},

        _create: langx.noop,

        _init: langx.noop,

		_classes: function( options ) {
			var full = [];
			var that = this;

			options = objects.mixin( {
				element: this.element,
				classes: this.options.classes || {}
			}, options );


			function bindRemoveEvent() {
				options.element.each( function( _, element ) {
					var isTracked = langx.map( that.classesElementLookup, function( elements ) {
						return elements;
					} )
						.some( function(elements ) {
							return $(elements).is( element );
						} );

					if ( !isTracked ) {
						that._on( $( element ), {
							remove: "_untrackClassesElement"
						} );
					}
				} );
			}

			function processClassString( classes, checkOption ) {
				var current, i;
				for ( i = 0; i < classes.length; i++ ) {
					current = that.classesElementLookup[ classes[ i ] ] || $();
					if ( options.add ) {
						bindRemoveEvent();
						current = $( langx.uniq( current.get().concat( options.element.get() ) ) );
					} else {
						current = $( current.not( options.element ).get() );
					}
					that.classesElementLookup[ classes[ i ] ] = current;
					full.push( classes[ i ] );
					if ( checkOption && options.classes[ classes[ i ] ] ) {
						full.push( options.classes[ classes[ i ] ] );
					}
				}
			}

			if ( options.keys ) {
				processClassString( options.keys.match( /\S+/g ) || [], true );
			}
			if ( options.extra ) {
				processClassString( options.extra.match( /\S+/g ) || [] );
			}

			return full.join( " " );
		},

		_untrackClassesElement: function( event ) {
			var that = this;
			langx.each( that.classesElementLookup, function( key, value ) {
				if ( arrays.inArray( event.target, value ) !== -1 ) {
					that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
				}
			} );

			this._off( $( event.target ) );
		},

		_removeClass: function( element, keys, extra ) {
			return this._toggleClass( element, keys, extra, false );
		},

		_addClass: function( element, keys, extra ) {
			return this._toggleClass( element, keys, extra, true );
		},

		_toggleClass: function( element, keys, extra, add ) {
			add = ( typeof add === "boolean" ) ? add : extra;
			var shift = ( typeof element === "string" || element === null ),
				options = {
					extra: shift ? keys : extra,
					keys: shift ? element : keys,
					element: shift ? this.element : element,
					add: add
				};
			options.element.toggleClass( this._classes( options ), add );
			return this;
		},

		_on: function( suppressDisabledCheck, element, handlers ) {
			var delegateElement;
			var instance = this;

			// No suppressDisabledCheck flag, shuffle arguments
			if ( typeof suppressDisabledCheck !== "boolean" ) {
				handlers = element;
				element = suppressDisabledCheck;
				suppressDisabledCheck = false;
			}

			// No element argument, shuffle and use this.element
			if ( !handlers ) {
				handlers = element;
				element = this.element;
				delegateElement = this.widget();
			} else {
				element = delegateElement = $( element );
				this.bindings = this.bindings.add( element );
			}

			objects.each( handlers, function( event, handler ) {
				function handlerProxy() {

					// Allow widgets to customize the disabled handling
					// - disabled as an array instead of boolean
					// - disabled class as method for disabling individual parts
					if ( !suppressDisabledCheck &&
							( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
						return;
					}
					return ( typeof handler === "string" ? instance[ handler ] : handler )
						.apply( instance, arguments );
				}

				// Copy the guid so direct unbinding works
				if ( typeof handler !== "string" ) {
					handlerProxy.guid = handler.guid =
						handler.guid || handlerProxy.guid || $.guid++;
				}

				var match = event.match( /^([\w:-]*)\s*(.*)$/ );
				var eventName = match[ 1 ] + instance.eventNamespace;
				var selector = match[ 2 ];

				if ( selector ) {
					delegateElement.on( eventName, selector, handlerProxy );
				} else {
					element.on( eventName, handlerProxy );
				}
			} );
		},

		_off: function( element, eventName ) {
			eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
				this.eventNamespace;
			element.off( eventName );

			// Clear the stack to avoid memory leaks (#10056)
			this.bindings = $( this.bindings.not( element ).get() );
			this.focusable = $( this.focusable.not( element ).get() );
			this.hoverable = $( this.hoverable.not( element ).get() );
		},

		_trigger: function( type, event, data ) {
			var prop, orig;
			var callback = this.options[ type ];

			data = data || {};
			event = eventer.proxy( event );
			event.type = ( type === this.widgetEventPrefix ?
				type :
				this.widgetEventPrefix + type ).toLowerCase();

			// The original event may come from any element
			// so we need to reset the target on the new event
			event.target = this.element[ 0 ];

			// Copy original event properties over to the new event
			orig = event.originalEvent;
			if ( orig ) {
				for ( prop in orig ) {
					if ( !( prop in event ) ) {
						event[ prop ] = orig[ prop ];
					}
				}
			}

			this.element.trigger( event, data );
			return !( types.isFunction( callback ) &&
				callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
				event.isDefaultPrevented() );
		},


	    enable: function() {
	      return this._setOptions( { disabled: false } );
	    },

	    disable: function() {
	      return this._setOptions( { disabled: true } );
	    }


	});

	return JqPlugin;
});
/*!
 * jQuery UI Widget @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

define( 'skylark-jquery/widget',[ 
	"skylark-langx/langx",
	"skylark-domx-plugins",
	"./core",
	"./JqueryPlugin"
],  function(langx,splugins, $,JqPlugin ) {

	var widgetUuid = 0;
	var widgetHasOwnProperty = Array.prototype.hasOwnProperty;
	var widgetSlice = Array.prototype.slice;

	$.cleanData = ( function( orig ) {
		return function( elems ) {
			var events, elem, i;
			for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}
			}
			orig( elems );
		};
	} )( $.cleanData );
	
	$.widget = function( name, base, prototype ) {
		var existingConstructor, constructor, basePrototype;

		// ProxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		var proxiedPrototype = {};

		var namespace = name.split( "." )[ 0 ];
		name = name.split( "." )[ 1 ];
		var fullName = namespace + "-" + name;

		if ( !prototype ) {
			prototype = base;
			base = $.Widget;
		}

		if ( $.isArray( prototype ) ) {
			prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
		}

		// Create selector for plugin
		$.expr.pseudos[ fullName.toLowerCase() ] = function( elem ) {
			return !!$.data( elem, fullName );
		};

		$[ namespace ] = $[ namespace ] || {};

		existingConstructor = $[ namespace ][ name ];

		var basePrototype = base.prototype,
			newPrototype = {};

		for (var key in prototype) {
			var value = prototype[key];

			if ( $.isPlainObject( value ) ) {
				newPrototype[ key ] = $.isPlainObject( basePrototype[ key ] ) ?
					$.widget.extend( {}, basePrototype[ key ], value ) :

					// Don't extend strings, arrays, etc. with objects
					$.widget.extend( {}, value );
			} else {
				newPrototype[key] = value;
			}
		}

		var _proto = $.widget.extend({

			// TODO: remove support for widgetEventPrefix
			// always use the name + a colon as the prefix, e.g., draggable:start
			// don't prefix for widgets that aren't DOM-based
			widgetEventPrefix: existingConstructor ? ( base.prototype.widgetEventPrefix || name ) : name
		}, {
			options : base.prototype.options
		},newPrototype, {
			name : fullName,
			namespace: namespace,
			widgetName: name,
			pluginName : "jqueryui." + (namespace ? namespace + "." : "") + name,
			widgetFullName: fullName
		} );

		constructor = $[ namespace ][ name ] = base.inherit(_proto);
		/*

		constructor = $[ namespace ][ name ] = function( options, element ) {

			// Allow instantiation without "new" keyword
			if ( !this._createWidget ) {
				return new constructor( options, element );
			}

			// Allow instantiation without initializing for simple inheritance
			// must use "new" keyword (the code above always passes args)
			if ( arguments.length ) {
				this._createWidget( options, element );
			}
		};
		*/
		// Extend with the existing constructor to carry over any static properties
		$.extend( constructor, existingConstructor, {
			version: prototype.version,

			// Copy the object used to create the prototype in case we need to
			// redefine the widget later
			_proto: _proto,

			// Track widgets that inherit from this widget in case this widget is
			// redefined after a widget inherits from it
			_childConstructors: []
		} );

		/*
		basePrototype = new base();

		// We need to make the options hash a property directly on the new instance
		// otherwise we'll modify the options hash on the prototype that we're
		// inheriting from
		basePrototype.options = $.widget.extend( {}, basePrototype.options );
		$.each( prototype, function( prop, value ) {
			if ( !$.isFunction( value ) ) {
				proxiedPrototype[ prop ] = value;
				return;
			}
			proxiedPrototype[ prop ] = ( function() {
				function _super() {
					return base.prototype[ prop ].apply( this, arguments );
				}

				function _superApply( args ) {
					return base.prototype[ prop ].apply( this, args );
				}

				return function() {
					var __super = this._super;
					var __superApply = this._superApply;
					var returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			} )();
		} );
		constructor.prototype = $.widget.extend( basePrototype, {

			// TODO: remove support for widgetEventPrefix
			// always use the name + a colon as the prefix, e.g., draggable:start
			// don't prefix for widgets that aren't DOM-based
			widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
		}, proxiedPrototype, {
			constructor: constructor,
			namespace: namespace,
			widgetName: name,
			widgetFullName: fullName
		} );
		*/
		// If this widget is being redefined then we need to find all widgets that
		// are inheriting from it and redefine all of them so that they inherit from
		// the new version of this widget. We're essentially trying to replace one
		// level in the prototype chain.
		if ( existingConstructor ) {
			$.each( existingConstructor._childConstructors, function( i, child ) {
				var childPrototype = child.prototype;

				// Redefine the child widget using the same prototype that was
				// originally used, but inherit from the new version of the base
				$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
					child._proto );
			} );

			// Remove the list of existing child constructors from the old constructor
			// so the old child constructors can be garbage collected
			delete existingConstructor._childConstructors;
		} else {
			if (base._childConstructors) {
				base._childConstructors.push( constructor );
			}
		}

		//$.widget.bridge( name, constructor );

		splugins.register(constructor,name,fullName);

		return constructor;
	};

	$.widget.extend = function( target ) {
		var input = widgetSlice.call( arguments, 1 );
		var inputIndex = 0;
		var inputLength = input.length;
		var key;
		var value;

		for ( ; inputIndex < inputLength; inputIndex++ ) {
			for ( key in input[ inputIndex ] ) {
				value = input[ inputIndex ][ key ];
				if ( widgetHasOwnProperty.call( input[ inputIndex ], key ) && value !== undefined ) {

					// Clone objects
					if ( $.isPlainObject( value ) ) {
						target[ key ] = $.isPlainObject( target[ key ] ) ?
							$.widget.extend( {}, target[ key ], value ) :

							// Don't extend strings, arrays, etc. with objects
							$.widget.extend( {}, value );

					// Copy everything else by reference
					} else {
						target[ key ] = value;
					}
				}
			}
		}
		return target;
	};


	$.Widget = 	 JqPlugin.inherit({
		widgetName: "widget",
		widgetEventPrefix: "",
		defaultElement: "<div>",

		options: {
			classes: {},
			disabled: false,

			// Callbacks
			create: null
		},

		widget: function() {
			return this.element;
		},

		_setOption: function( key, value ) {
			if ( key === "classes" ) {
				this._setOptionClasses( value );
			}

			this.options[ key ] = value;

			if ( key === "disabled" ) {
				this._setOptionDisabled( value );
			}

			return this;
		},

		_setOptionClasses: function( value ) {
			var classKey, elements, currentElements;

			for ( classKey in value ) {
				currentElements = this.classesElementLookup[ classKey ];
				if ( value[ classKey ] === this.options.classes[ classKey ] ||
						!currentElements ||
						!currentElements.length ) {
					continue;
				}

				// We are doing this to create a new jQuery object because the _removeClass() call
				// on the next line is going to destroy the reference to the current elements being
				// tracked. We need to save a copy of this collection so that we can add the new classes
				// below.
				elements = $( currentElements.get() );
				this._removeClass( currentElements, classKey );

				// We don't use _addClass() here, because that uses this.options.classes
				// for generating the string of classes. We want to use the value passed in from
				// _setOption(), this is the new value of the classes option which was passed to
				// _setOption(). We pass this value directly to _classes().
				elements.addClass( this._classes( {
					element: elements,
					keys: classKey,
					classes: value,
					add: true
				} ));
			}
		},

		_setOptionDisabled: function( value ) {
			this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this._removeClass( this.hoverable, null, "ui-state-hover" );
				this._removeClass( this.focusable, null, "ui-state-focus" );
			}
		},

		enable: function() {
			return this._setOptions( { disabled: false } );
		},

		disable: function() {
			return this._setOptions( { disabled: true } );
		},


		_delay: function( handler, delay ) {
			function handlerProxy() {
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}
			var instance = this;
			return setTimeout( handlerProxy, delay || 0 );
		},

		_hoverable: function( element ) {
			this.hoverable = this.hoverable.add( element );
			this._on( element, {
				mouseenter: function( event ) {
					this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
				},
				mouseleave: function( event ) {
					this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
				}
			} );
		},

		_focusable: function( element ) {
			this.focusable = this.focusable.add( element );
			this._on( element, {
				focusin: function( event ) {
					this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
				},
				focusout: function( event ) {
					this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
				}
			} );
		}

	});

	$.Widget._childConstructors = [];

	$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
		$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
			if ( typeof options === "string" ) {
				options = { effect: options };
			}

			var hasOptions;
			var effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;

			options = options || {};
			if ( typeof options === "number" ) {
				options = { duration: options };
			}

			hasOptions = !$.isEmptyObject( options );
			options.complete = callback;

			if ( options.delay ) {
				element.delay( options.delay );
			}

			if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
				element[ method ]( options );
			} else if ( effectName !== method && element[ effectName ] ) {
				element[ effectName ]( options.duration, options.easing, callback );
			} else {
				element.queue( function( next ) {
					$( this )[ method ]();
					if ( callback ) {
						callback.call( element[ 0 ] );
					}
					next();
				} );
			}
		};
	} );

	return $.widget;

});

define('skylark-jquery/main',[
    "./core",
    "./ajax",
    "./callbacks",
    "./deferred",
    "./queue",
    "./JqueryPlugin",
    "./widget"
], function($) {
    return $;
});

define('skylark-jquery', ['skylark-jquery/main'], function (main) { return main; });

define('skylark-ajaxfy-routers/routers',[
	"skylark-langx/skylark",
	"skylark-langx/langx"	
],function(skylark,langx){

	return skylark.attach("ajaxfy.routers",{
        createEvent : function (type,props) {
            var e = new CustomEvent(type,props);
            return langx.safeMixin(e, props);
        }

	});	
});

define('skylark-ajaxfy-routers/Route',[
	"skylark-langx/langx",
	"./routers"
],function(langx,routers){
    var createEvent = routers.createEvent;
    
    var Route = langx.Evented.inherit({
        klassName: "Route",
        init: function(name, setting) {
            setting = langx.mixin({}, setting);
            var pathto = setting.pathto || "",
                pattern = pathto,
                paramNames = pattern.match(/\:([a-zA-Z0-9_]+)/g);
            if (paramNames !== null) {
                paramNames = paramNames.map(function(paramName) {
                    return paramName.substring(1);
                });
                pattern = pattern.replace(/\:([a-zA-Z0-9_]+)/g, '(.*?)');
            } else {
                paramNames = [];
            }
            if (pattern === "*") {
                pattern = "(.*)";
            } else {
                pattern = pattern.replace("/", "\\/");
            }

            this._setting = setting;
            this.name = name;
            this.pathto = pathto;
            this.paramNames = paramNames;
            this.params = pattern;
            this.regex = new RegExp("^" + pattern + "$", "");

            var self = this;
            ["entering", "entered", "exiting", "exited"].forEach(function(eventName) {
                if (langx.isFunction(setting[eventName])) {
                    self.on(eventName, setting[eventName]);
                }
            });
        },

        enter: function(ctx,query) {
            if (query) {
                var r = this._entering(ctx),
                    self = this;

                return langx.Deferred.when(r).then(function(){
                    var e = createEvent("entering", {
                        route: self,
                        result: true
                    });

                    self.trigger(e);

                    return e.result;
                });
            } else {
                this._entered(ctx);

                this.trigger(createEvent("entered", langx.safeMixin({
                    route: this
                }, ctx)));
                return this;
            }
        },

        exit: function(ctx, query) {
            if (query) {
                var ok = this._exiting(ctx);
                if (!ok) {
                    return false;
                }

                var e = createEvent("exiting", {
                    route: this,
                    result: true
                });

                this.trigger(e);

                return e.result;
            } else {
                this._exited(ctx);
                this.trigger(createEvent("exited", langx.safeMixin({
                    route: this
                }, ctx)));

                return this;
            }
        },

        match: function(path) {
            var names = this.paramNames,
                x = path.indexOf('?'),
                path = ~x ? path.slice(0, x) : decodeURIComponent(path),
                m = this.regex.exec(path);

            if (!m) {
                return false
            };

            var params = {};
            for (var i = 1, len = m.length; i < len; ++i) {
                var name = names[i - 1],
                    val = decodeURIComponent(m[i]);
                params[name] = val;
            }

            return params;
        },

        path: function(params) {
            var path = this.pathto;
            if (params) {
                path = path.replace(/:([a-zA-Z0-9_]+)/g, function(match, paramName) {
                    return params[paramName];
                });
            }
            return path;
        },

        _entering: function(ctx) {
            return true;
        },
        _entered: function(ctx) {
            return true;
        },
        _exiting: function(ctx) {
            return true;
        },
        _exited: function(ctx) {
            return true;
        },
    });

	return routers.Route = Route;	
});
define('skylark-ajaxfy-routers/Router',[
    "skylark-langx/langx",
    "./routers",
    "./Route"
],function(langx,routers,Route){
    var createEvent = routers.createEvent;

    function Router() {
        var _curCtx,
            _prevCtx,
            _baseUrl,
            _homePath,
            _routes = {},
            _cache = {},
            _hub = new langx.Evented();

        var router = this;


        function current() {
            return _curCtx;
        }

        // refresh the current route
        function dispatch(ctx) {

            if (_curCtx) {
                var ret = _curCtx.route.exit({
                    path: _curCtx.path,
                    params: _curCtx.params
                }, true);
                if (!ret) {
                    return;
                }
            }

            _prevCtx = _curCtx;
            _curCtx = ctx;
            if (!_curCtx.route) {
                var m = map(_curCtx.path);
                _curCtx.route = m.route;
                _curCtx.params = m.params;
            }

            var r = _curCtx.route.enter({
                force: _curCtx.force,
                path: _curCtx.path,
                params: _curCtx.params
            },true);

            langx.Deferred.when(r).then(function() {
                _hub.trigger(createEvent("routing", {
                    current: _curCtx,
                    previous: _prevCtx
                }));

                _curCtx.route.enter({
                    path: _curCtx.path,
                    params: _curCtx.params
                },false);

                if (_prevCtx) {
                    _prevCtx.route.exit({
                        path: _prevCtx.path,
                        params: _prevCtx.params
                    }, false);
                }

                _hub.trigger(createEvent("routed", {
                    current: _curCtx,
                    previous: _prevCtx
                }));
            });
        }

        function go(path, force) {
            if (!force && _curCtx && _curCtx.path == path) {
                return false;
            }
            var ctx = map(path);
            if (ctx) {
                ctx.path = path;

                if (router.useHistoryApi) {
                    var state = {
                        force: force,
                        path: path
                    }

                    window.history.pushState(state, document.title, (_baseUrl + path).replace("//", "/"));
                    window.dispatchEvent(createEvent("popstate", {
                        state: state
                    }));
                } else if (router.useHashbang) {
                    var newHash = "#!" + path;
                    if (window.location.hash !== newHash) {
                        window.location.hash = newHash;
                    } else {
                        dispatch(ctx);
                    };
                } else {
                    dispatch(ctx);
                }
            }
            return true;
        }

        function map(path, noCache) {
            var finded = false;
            if (!noCache) {
                finded = _cache[path];
                if (finded) {
                    return finded;
                }
            }
            langx.each(_routes, function(name, route) {
                var ret = route.match(path);
                if (ret) {
                    finded = {
                        route: route,
                        params: ret
                    }
                    return false;
                }
                return true;
            });
            if (finded && !noCache) {
                _cache[path] = finded;
            }
            return finded;
        }

        function path(routeName, params) {
            var route = _routes[routeName],
                path;
            if (route) {
                path = route.path(params);
            }
            return path;
        }

        function previous() {
            return _prevCtx;
        }

        function baseUrl(path) {
            if (langx.isDefined(path)) {
                _baseUrl = path;
                return this;
            } else {
                return _baseUrl;
            }
        }

        function hub(){
            return _hub;
        }

        function homePath(path) {
            if (langx.isDefined(path)) {
                _homePath = path;
                return this;
            } else {
                return _homePath;
            }
        }

        function route(name, setting) {
            if (langx.isDefined(setting)) {
                var settings = {};
                settings[name] = setting;
                routes(settings);
                return this;
            } else {
                return _routes[name];
            }
        }

        function routes(settings) {
            if (!langx.isDefined(settings)) {
                return langx.mixin({}, _routes);
            } else {
                for (var name in settings) {
                    _routes[name] = new router.Route(name, settings[name]);
                }
            }
        }

        //starts routing urls
        function start() {
            if (router.useHashbang == null && router.useHistoryApi == null) {
                if (window.location.host  && window.history.pushState) {
                    //web access
                    router.useHistoryApi = true;
                } else {
                    // local access
                    router.useHashbang = true;
                }
            }

            var initPath = "";

            if (router.useHistoryApi) {
                initPath = window.location.pathname;
                if (_baseUrl === undefined) {
                    _baseUrl = initPath.replace(/\/$/, "");
                }
                initPath = initPath.replace(_baseUrl, "") || _homePath || "/";
            } else if (router.useHashbang) {
                initPath = window.location.hash.replace("#!", "") || _homePath || "/";
            } else {
                initPath = "/";
            }

            if (!initPath.startsWith("/")) {
                initPath = "/" + initPath;
            }
            /*
            eventer.on(document.body, "click", "a[href]", function(e) {
                var elm = e.currentTarget,
                    url = elm.getAttribute("href");

                if (url == "#") {
                    return;
                }
                if (url && langx.isSameOrigin(elm.href)) {
                    if (url.indexOf(_baseUrl) === 0) {
                        url = url.substr(_baseUrl.length);
                        eventer.stop(e);
                        url = url.replace('#!', '');
                        go(url);
                    }
                }
            });
            */
            if (router.useHistoryApi) {
                window.addEventListener("popstate", function(e) {
                    if(e.state) dispatch(e.state);
                    e.preventDefault();
                });
            } else if (router.useHashbang) {
                window.addEventListener("hashchange", function(e) {
                    dispatch({
                        path: window.location.hash.replace(/^#!/, "")
                    });
                    e.preventDefault();
                });
            }

            go(initPath);
        }

        langx.mixin(router, {
            "Route": Route,

            // Current path being processed
            "current": current,

            // Changes the current path
            "go": go,

            "map": map,

            "hub": hub,

            "off": function() {
                _hub.off.apply(_hub, arguments);
            },

            "on": function() {
                _hub.on.apply(_hub, arguments);
            },

            "one": function() {
                _hub.one.apply(_hub, arguments);
            },

            // Returns the path of the named route
            "path": path,

            "previous": previous,

            "baseUrl": baseUrl,

            "homePath": homePath,

            "route": route,

            "routes": routes,

            //starts routing urls
            "start": start,

            "trigger": function(e) {
                _hub.trigger(e);
                return this;
            },

            "useHistoryApi": null,
            "useHashbang": null
        });

    }

    return routers.Router = Router;
});

define('skylark-ajaxfy-routers/main',[
    "./routers",
    "./Router",
    "./Route"
], function(routers) {
    return routers;
});

define('skylark-ajaxfy-routers', ['skylark-ajaxfy-routers/main'], function (main) { return main; });

define('skylark-ajaxfy-spa/spa',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-ajaxfy-routers"
], function(skylark, langx, routers) {
    var Deferred = langx.Deferred;

    function createEvent(type, props) {
        var e = new CustomEvent(type, props);
        return langx.safeMixin(e, props);
    }

    var router = new routers.Router();

    var Route = router.Route = router.Route.inherit({
        klassName: "SpaRoute",

        init: function(name, setting) {
            this.overrided(name, setting);
            this.content = setting.content;
            this.forceRefresh = setting.forceRefresh;
            this.data = setting.data;
            //this.lazy = !!setting.lazy;
            var self = this;
            ["preparing", "rendering", "rendered"].forEach(function(eventName) {
                if (langx.isFunction(setting[eventName])) {
                    self.on(eventName, setting[eventName]);
                }
            });
        },

        _entering: function(ctx) {
            if (this.forceRefresh || ctx.force || !this._prepared) {
                return this.prepare();
            }
            return this;
        },

        getConfigData: function(key) {
            return key ? this.data[key] : this.data;
        },

        getNamedValue: function() {
            return window.location.pathname.match(this.regex);
        },

        prepare: function() {
            var d = new Deferred(),
                setting = this._setting,
                controllerSetting = setting.controller,
                controller = this.controller,

                self = this,
                content = setting.content,
                contentPath = setting.contentPath;

            require([controllerSetting.type], function(type) {
                controller = self.controller = new type(controllerSetting);
                d.resolve();
            });

            return d.then(function() {
                var e = createEvent("preparing", {
                    route: self,
                    result: true
                });
                self.trigger(e);
                return Deferred.when(e.result).then(function() {
                    self._prepared = true;
                });
            });
        },

        render: function(ctx) {
            var e = createEvent("rendering", {
                route: this,
                context: ctx,
                content: this.content
            });
            this.trigger(e);
            return e.content;
        },

        trigger: function(e) {
            var controller = this.controller;
            if (controller) {
                return controller.perform(e);
            } else {
                return this.overrided(e);
            }
        }
    });


    var RouteController = langx.Evented.inherit({
        klassName: "SpaRouteController",

        init: function(route, setting) {
            setting = setting || {};
            this.content = setting.content;
            this.data = setting.data;
        },

        getConfigData: function(key) {
            return key ? this.data[key] : this.data;
        },

        perform: function(e) {
            var eventName = e.type;
            if (this[eventName]) {
                return this[eventName].call(this, e);
            }

        }
    });

    var Page = langx.Evented.inherit({
        klassName: "SpaPage",

        init: function(params) {
            params = langx.mixin({
                "routeViewer": "body"
            }, params);

            this._params = params;
            this._rvc = document.querySelector(params.routeViewer);
            this._router = router;

            router.on("routed", langx.proxy(this, "refresh"));
        },

        prepare: function() {

        },

        //Refreshes the route
        refresh: function() {
            var curCtx = router.current(),
                prevCtx = router.previous();
            var content = curCtx.route.render(curCtx);
            if (content===undefined || content===null) {
                return;
            }
            if (langx.isString(content)) {
                this._rvc.innerHTML = content;
            } else {
                this._rvc.innerHTML = "";
                this._rvc.appendChild(content);
            }
            curCtx.route.trigger(createEvent("rendered", {
                route: curCtx.route,
                content: content
            }));
        }
    });

    var Plugin = langx.Evented.inherit({
        klassName: "SpaPlugin",

        init: function(name, setting) {
            this.name = name;

            if (langx.isString(setting.hookers)) {
                setting.hookers = setting.hookers.split(" ");
            }
            this._setting = setting;
        },

        isHooked: function(eventName) {
            var hookers = this._setting.hookers || [];
            return hookers.indexOf(eventName) > -1;
        },

        prepare: function() {
            var d = new Deferred(),
                setting = this._setting,
                controllerSetting = setting.controller,
                controller = this.controller,
                self = this;
            require([controllerSetting.type], function(type) {
                controller = self.controller = new type(controllerSetting);
                router.on(setting.hookers, {
                    plugin: self
                }, langx.proxy(controller.perform, controller));
                d.resolve();
            });
            return d.then(function() {
                var e = createEvent("preparing", {
                    plugin: self,
                    result: true
                });
                self.trigger(e);
                return Deferred.when(e.result).then(function() {
                    self._prepared = true;
                });
            });
        },

        trigger: function(e) {
            var controller = this.controller;
            if (controller) {
                return controller.perform(e);
            } else {
                return this.overrided(e);
            }
        }
    });

    var PluginController = langx.Evented.inherit({
        klassName: "SpaPluginController",

        init: function(plugin) {
            this.plugin = plugin;
        },

        perform: function(e) {
            var eventName = e.type;
            if (this[eventName]) {
                return this[eventName].call(this, e);
            }

        }
    });

    var Application = langx.Evented.inherit({
        klassName: "SpaApplication",

        init: function(config) {
            if (app) {
                return app;
            }
            var plugins = this._plugins = {};

            config = this._config = langx.mixin({
                plugins: {}
            }, config, true);

            langx.each(config.plugins, function(pluginName, setting) {
                plugins[pluginName] = new Plugin(pluginName, setting);
            });

            router.routes(config.routes);

            this._router = router;

            this._page = new spa.Page(config.page);

            document.title = config.title;
            var baseUrl = config.baseUrl;
            if (baseUrl === undefined) {
                baseUrl = config.baseUrl = (new langx.URL(document.baseURI)).pathname;
            }
            router.baseUrl(baseUrl);

            if (config.homePath) {
                router.homePath(config.homePath);
            }

            app = this;
        },

        baseUrl : function() {
            return router.baseUrl();
        },

        getConfig: function(key) {
            return key ? this._config[key] : this._config;
        },

        go: function(path, force) {
            router.go(path, force);
            return this;
        },

        page: function() {
            return this._page;
        },

        prepare: function() {
            if (this._prepared) {
                return Deferred.resolve();
            }
            var self = this;

            var promises0 = langx.map(this._plugins, function(plugin, name) {
                if (plugin.isHooked("starting")) {
                    return plugin.prepare();
                }
            });

            return Deferred.all(promises0).then(function() {
                router.trigger(createEvent("starting", {
                    spa: self
                }));
                var promises1 = langx.map(router.routes(), function(route, name) {
                        if (route.lazy === false) {
                            return route.prepare();
                        }
                    }),
                    promises2 = langx.map(self._plugins, function(plugin, name) {
                        if (!plugin.isHooked("starting")) {
                            return plugin.prepare();
                        }
                    });


                return Deferred.all(promises1.concat(promises2)).then(function() {
                    self._prepared = true;
                });
            });
        },

        run: function() {
            this._router.start();
            router.trigger(createEvent("started", {
                spa: this
            }));
        }
    });

    var app;
    var spa = function(config) {
        if (!app) {
            window[config.name || "app"] = app = new spa.Application(config);
        }

        return app;
    }

    langx.mixin(spa, {
        "Application": Application,

        "Page": Page,

        "Plugin": Plugin,
        "PluginController": PluginController,

        "Route": Route,

        "router" : router,
        
        "RouteController": RouteController

    });

    return skylark.attach("ajaxfy.spa",spa);
});

define('skylark-ajaxfy-spa/main',[
    "skylark-langx/skylark",
    "./spa"
], function(skylark) {
    return skylark;
});

define('skylark-ajaxfy-spa', ['skylark-ajaxfy-spa/main'], function (main) { return main; });

define('skylark-data-entities/entities',[
    "skylark-langx/langx"
], function(langx) {
    function entities() {
        return entities;
    }

    langx.mixin(entities, {
        // set a `X-Http-Method-Override` header.
        emulateHTTP : false,

        // Turn on `emulateJSON` to support legacy servers that can't deal with direct
        // `application/json` requests ... this will encode the body as
        // `application/x-www-form-urlencoded` instead and will send the model in a
        // form param named `model`.
        emulateJSON : false,

        backends : {
            
        }
    });


    return entities;
});

define('skylark-data-entities/Entity',[
	"skylark-langx/langx",
	"./entities"
],function(langx,entities){
   // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

 
  var Entity = langx.Stateful.inherit({
    sync: function() {
      return entities.sync.apply(this, arguments);
    },

    // Get the HTML-escaped value of an attribute.
    //escape: function(attr) {
    //  return _.escape(this.get(attr));
    //},

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return langx.isMatch(this.attributes,attrs);
    },

    // Fetch the entity from the server, merging the response with the entity's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = langx.mixin({parse: true}, options);
      var entity = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? entity.parse(resp, options) : resp;
        if (!entity.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, entity, resp, options);
        entity.trigger('sync', entity, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of entity attributes, and sync the entity to the server.
    // If the server returns an attributes hash that differs, the entity's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = langx.mixin({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the entity will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var entity = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        entity.attributes = attributes;
        var serverAttrs = options.parse ? entity.parse(resp, options) : resp;
        if (wait) serverAttrs = langx.mixin({}, attrs, serverAttrs);
        if (serverAttrs && !entity.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, entity, resp, options);
        entity.trigger('sync', entity, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = langx.mixin({}, attributes, attrs);

      var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this entity on the server if it was already persisted.
    // Optimistically removes the entity from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? langx.clone(options) : {};
      var entity = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        entity.stopListening();
        entity.trigger('destroy', entity, entity.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, entity, resp, options);
        if (!entity.isNew()) entity.trigger('sync', entity, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        langx.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the entity's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        langx.result(this, 'urlRoot') ||
        langx.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the entity. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    }
  });

  return entities.Entity = Entity;

});
define('skylark-data-entities/Collection',[
	"skylark-langx/langx",
	"./entities",
	"./Entity"
],function(langx,entities,Entity){
  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };


	var Collection  = langx.Evented.inherit({
		"_construct" : function(entities, options) {
			options || (options = {});
			if (options.entity) this.entity = options.entity;
			if (options.comparator !== void 0) this.comparator = options.comparator;
			this._reset();
			if (entities) this.reset(entities, langx.mixin({silent: true}, options));
		}
	}); 

	// Default options for `Collection#set`.
	var setOptions = {add: true, remove: true, merge: true};
	var addOptions = {add: true, remove: false};

	// Splices `insert` into `array` at index `at`.
	var splice = function(array, insert, at) {
		at = Math.min(Math.max(at, 0), array.length);
		var tail = Array(array.length - at);
		var length = insert.length;
		var i;
		for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
		for (i = 0; i < length; i++) array[i + at] = insert[i];
		for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
	};

  // Define the Collection's inheritable methods.
	Collection.partial({

		// The default entity for a collection is just a **Entity**.
		// This should be overridden in most cases.
		entity: Entity,

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// The JSON representation of a Collection is an array of the
		// entities' attributes.
		toJSON: function(options) {
		  return this.map(function(entity) { return entity.toJSON(options); });
		},

		// Proxy `entities.sync` by default.
		sync: function() {
		  return entities.sync.apply(this, arguments);
		},

		// Add a entity, or list of entities to the set. `entities` may be Backbone
		// Entitys or raw JavaScript objects to be converted to Entitys, or any
		// combination of the two.
		add: function(entities, options) {
		  return this.set(entities, langx.mixin({merge: false}, options, addOptions));
		},

		// Remove a entity, or a list of entities from the set.
		remove: function(entities, options) {
		  options = langx.mixin({}, options);
		  var singular = !langx.isArray(entities);
		  entities = singular ? [entities] : entities.slice();
		  var removed = this._removeEntitys(entities, options);
		  if (!options.silent && removed.length) {
		    options.changes = {added: [], merged: [], removed: removed};
		    this.trigger('update', this, options);
		  }
		  return singular ? removed[0] : removed;
		},

		// Update a collection by `set`-ing a new list of entities, adding new ones,
		// removing entities that are no longer present, and merging entities that
		// already exist in the collection, as necessary. Similar to **Entity#set**,
		// the core operation for updating the data contained by the collection.
		set: function(entities, options) {
		  if (entities == null) return;

		  options = langx.mixin({}, setOptions, options);
		  if (options.parse && !this._isEntity(entities)) {
		    entities = this.parse(entities, options) || [];
		  }

		  var singular = !langx.isArray(entities);
		  entities = singular ? [entities] : entities.slice();

		  var at = options.at;
		  if (at != null) at = +at;
		  if (at > this.length) at = this.length;
		  if (at < 0) at += this.length + 1;

		  var set = [];
		  var toAdd = [];
		  var toMerge = [];
		  var toRemove = [];
		  var modelMap = {};

		  var add = options.add;
		  var merge = options.merge;
		  var remove = options.remove;

		  var sort = false;
		  var sortable = this.comparator && at == null && options.sort !== false;
		  var sortAttr = langx.isString(this.comparator) ? this.comparator : null;

		  // Turn bare objects into entity references, and prevent invalid entities
		  // from being added.
		  var entity, i;
		  for (i = 0; i < entities.length; i++) {
		    entity = entities[i];

		    // If a duplicate is found, prevent it from being added and
		    // optionally merge it into the existing entity.
		    var existing = this.get(entity);
		    if (existing) {
		      if (merge && entity !== existing) {
		        var attrs = this._isEntity(entity) ? entity.attributes : entity;
		        if (options.parse) attrs = existing.parse(attrs, options);
		        existing.set(attrs, options);
		        toMerge.push(existing);
		        if (sortable && !sort) sort = existing.hasChanged(sortAttr);
		      }
		      if (!modelMap[existing.cid]) {
		        modelMap[existing.cid] = true;
		        set.push(existing);
		      }
		      entities[i] = existing;

		    // If this is a new, valid entity, push it to the `toAdd` list.
		    } else if (add) {
		      entity = entities[i] = this._prepareEntity(entity, options);
		      if (entity) {
		        toAdd.push(entity);
		        this._addReference(entity, options);
		        modelMap[entity.cid] = true;
		        set.push(entity);
		      }
		    }
		  }

		  // Remove stale entities.
		  if (remove) {
		    for (i = 0; i < this.length; i++) {
		      entity = this.entities[i];
		      if (!modelMap[entity.cid]) toRemove.push(entity);
		    }
		    if (toRemove.length) this._removeEntitys(toRemove, options);
		  }

		  // See if sorting is needed, update `length` and splice in new entities.
		  var orderChanged = false;
		  var replace = !sortable && add && remove;
		  if (set.length && replace) {
		    orderChanged = this.length !== set.length || this.entities.some(function(m, index) {
		      return m !== set[index];
		    });
		    this.entities.length = 0;
		    splice(this.entities, set, 0);
		    this.length = this.entities.length;
		  } else if (toAdd.length) {
		    if (sortable) sort = true;
		    splice(this.entities, toAdd, at == null ? this.length : at);
		    this.length = this.entities.length;
		  }

		  // Silently sort the collection if appropriate.
		  if (sort) this.sort({silent: true});

		  // Unless silenced, it's time to fire all appropriate add/sort/update events.
		  if (!options.silent) {
		    for (i = 0; i < toAdd.length; i++) {
		      if (at != null) options.index = at + i;
		      entity = toAdd[i];
		      entity.trigger('add', entity, this, options);
		    }
		    if (sort || orderChanged) this.trigger('sort', this, options);
		    if (toAdd.length || toRemove.length || toMerge.length) {
		      options.changes = {
		        added: toAdd,
		        removed: toRemove,
		        merged: toMerge
		      };
		      this.trigger('update', this, options);
		    }
		  }

		  // Return the added (or merged) entity (or entities).
		  return singular ? entities[0] : entities;
		},

		// When you have more items than you want to add or remove individually,
		// you can reset the entire set with a new list of entities, without firing
		// any granular `add` or `remove` events. Fires `reset` when finished.
		// Useful for bulk operations and optimizations.
		reset: function(entities, options) {
		  options = options ? langx.clone(options) : {};
		  for (var i = 0; i < this.entities.length; i++) {
		    this._removeReference(this.entities[i], options);
		  }
		  options.previousEntitys = this.entities;
		  this._reset();
		  entities = this.add(entities, langx.mixin({silent: true}, options));
		  if (!options.silent) this.trigger('reset', this, options);
		  return entities;
		},

		// Add a entity to the end of the collection.
		push: function(entity, options) {
		  return this.add(entity, langx.mixin({at: this.length}, options));
		},

		// Remove a entity from the end of the collection.
		pop: function(options) {
		  var entity = this.at(this.length - 1);
		  return this.remove(entity, options);
		},

		// Add a entity to the beginning of the collection.
		unshift: function(entity, options) {
		  return this.add(entity, langx.mixin({at: 0}, options));
		},

		// Remove a entity from the beginning of the collection.
		shift: function(options) {
		  var entity = this.at(0);
		  return this.remove(entity, options);
		},

		// Slice out a sub-array of entities from the collection.
		slice: function() {
		  return slice.apply(this.entities, arguments);
		},

		// Get a entity from the set by id, cid, entity object with id or cid
		// properties, or an attributes object that is transformed through entityId.
		get: function(obj) {
		  if (obj == null) return void 0;
		  return this._byId[obj] ||
		    this._byId[this.entityId(obj.attributes || obj)] ||
		    obj.cid && this._byId[obj.cid];
		},

		// Returns `true` if the entity is in the collection.
		has: function(obj) {
		  return this.get(obj) != null;
		},

		// Get the entity at the given index.
		at: function(index) {
		  if (index < 0) index += this.length;
		  return this.entities[index];
		},

		// Return entities with matching attributes. Useful for simple cases of
		// `filter`.
		where: function(attrs, first) {
		  return this[first ? 'find' : 'filter'](attrs);
		},

		// Return the first entity with matching attributes. Useful for simple cases
		// of `find`.
		findWhere: function(attrs) {
		  return this.where(attrs, true);
		},

		// Force the collection to re-sort itself. You don't need to call this under
		// normal circumstances, as the set will maintain sort order as each item
		// is added.
		sort: function(options) {
		  var comparator = this.comparator;
		  if (!comparator) throw new Error('Cannot sort a set without a comparator');
		  options || (options = {});

		  var length = comparator.length;
		  if (langx.isFunction(comparator)) comparator = langx.proxy(comparator, this);

		  // Run sort based on type of `comparator`.
		  if (length === 1 || langx.isString(comparator)) {
		    this.entities = this.sortBy(comparator);
		  } else {
		    this.entities.sort(comparator);
		  }
		  if (!options.silent) this.trigger('sort', this, options);
		  return this;
		},

		// Pluck an attribute from each entity in the collection.
		pluck: function(attr) {
		  return this.map(attr + '');
		},

		// Fetch the default set of entities for this collection, resetting the
		// collection when they arrive. If `reset: true` is passed, the response
		// data will be passed through the `reset` method instead of `set`.
		fetch: function(options) {
		  options = langx.mixin({parse: true}, options);
		  var success = options.success;
		  var collection = this;
		  options.success = function(resp) {
		    var method = options.reset ? 'reset' : 'set';
		    collection[method](resp, options);
		    if (success) success.call(options.context, collection, resp, options);
		    collection.trigger('sync', collection, resp, options);
		  };
		  wrapError(this, options);
		  return this.sync('read', this, options);
		},

		// Create a new instance of a entity in this collection. Add the entity to the
		// collection immediately, unless `wait: true` is passed, in which case we
		// wait for the server to agree.
		create: function(entity, options) {
		  options = options ? langx.clone(options) : {};
		  var wait = options.wait;
		  entity = this._prepareEntity(entity, options);
		  if (!entity) return false;
		  if (!wait) this.add(entity, options);
		  var collection = this;
		  var success = options.success;
		  options.success = function(m, resp, callbackOpts) {
		    if (wait) collection.add(m, callbackOpts);
		    if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
		  };
		  entity.save(null, options);
		  return entity;
		},

		// **parse** converts a response into a list of entities to be added to the
		// collection. The default implementation is just to pass it through.
		parse: function(resp, options) {
		  return resp;
		},

		// Create a new collection with an identical list of entities as this one.
		clone: function() {
		  return new this.constructor(this.entities, {
		    entity: this.entity,
		    comparator: this.comparator
		  });
		},

		// Define how to uniquely identify entities in the collection.
		entityId: function(attrs) {
		  return attrs[this.entity.prototype.idAttribute || 'id'];
		},

		// Private method to reset all internal state. Called when the collection
		// is first initialized or reset.
		_reset: function() {
		  this.length = 0;
		  this.entities = [];
		  this._byId  = {};
		},

		// Prepare a hash of attributes (or other entity) to be added to this
		// collection.
		_prepareEntity: function(attrs, options) {
		  if (this._isEntity(attrs)) {
		    if (!attrs.collection) attrs.collection = this;
		    return attrs;
		  }
		  options = options ? langx.clone(options) : {};
		  options.collection = this;
		  var entity = new this.entity(attrs, options);
		  if (!entity.validationError) return entity;
		  this.trigger('invalid', this, entity.validationError, options);
		  return false;
		},

		// Internal method called by both remove and set.
		_removeEntitys: function(entities, options) {
		  var removed = [];
		  for (var i = 0; i < entities.length; i++) {
		    var entity = this.get(entities[i]);
		    if (!entity) continue;

		    var index = this.indexOf(entity);
		    this.entities.splice(index, 1);
		    this.length--;

		    // Remove references before triggering 'remove' event to prevent an
		    // infinite loop. #3693
		    delete this._byId[entity.cid];
		    var id = this.entityId(entity.attributes);
		    if (id != null) delete this._byId[id];

		    if (!options.silent) {
		      options.index = index;
		      entity.trigger('remove', entity, this, options);
		    }

		    removed.push(entity);
		    this._removeReference(entity, options);
		  }
		  return removed;
		},

		// Method for checking whether an object should be considered a entity for
		// the purposes of adding to the collection.
		_isEntity: function(entity) {
		  return entity instanceof Entity;
		},

		// Internal method to create a entity's ties to a collection.
		_addReference: function(entity, options) {
		  this._byId[entity.cid] = entity;
		  var id = this.entityId(entity.attributes);
		  if (id != null) this._byId[id] = entity;
		  entity.on('all', this._onEntityEvent, this);
		},

		// Internal method to sever a entity's ties to a collection.
		_removeReference: function(entity, options) {
		  delete this._byId[entity.cid];
		  var id = this.entityId(entity.attributes);
		  if (id != null) delete this._byId[id];
		  if (this === entity.collection) delete entity.collection;
		  entity.off('all', this._onEntityEvent, this);
		},

		// Internal method called every time a entity in the set fires an event.
		// Sets need to update their indexes when entities change ids. All other
		// events simply proxy through. "add" and "remove" events that originate
		// in other collections are ignored.
		_onEntityEvent: function(event, entity, collection, options) {
		  if (entity) {
		    if ((event === 'add' || event === 'remove') && collection !== this) return;
		    if (event === 'destroy') this.remove(entity, options);
		    if (event === 'change') {
		      var prevId = this.entityId(entity.previousAttributes());
		      var id = this.entityId(entity.attributes);
		      if (prevId !== id) {
		        if (prevId != null) delete this._byId[prevId];
		        if (id != null) this._byId[id] = entity;
		      }
		    }
		  }
		  this.trigger.apply(this, arguments);
		}

  	});

	return entities.Collection = Collection;
});
define('skylark-data-entities/backends/registry',[
	
],function(){
	var providers = {

	};

	function add(name,setting) {
		providers[name] = setting;
	}

	function remove(name) {
		delete provides[name];
	}

	function get(name) {
		return providers[name];
	}

	return {
		add : add,
		remove: remove,
		get : get
	}
});
define('skylark-data-entities/sync',[
	"skylark-langx/langx",
	"./entities",
  	"./backends/registry"
],function(langx,entities,registry){

	// Override 'Backbone.sync' to default to localSync,
	// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
	function sync(method, model, options) {
		if (!options.backend) {
			throw new Error("The backend is not specified")
		}
		var setting = registry.get(options.backend);
		if (!setting) {
			throw new Error("The backend is not defined:" + options.backend);
		}
		var syncMethod = setting.sync;
		if (!syncMethod) {
			throw new Error("The backend sync method is not defined:" + options.backend);
		}

		var options2 = langx.mixin({},setting.options,options);
	  	return syncMethod.apply(this, [method, model, options2]);
	};

  
   return entities.sync = sync;

});
define('skylark-data-entities/backends/ajaxSync',[
	"skylark-langx/langx",
	"../entities"
],function(langx,entities){
// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };
  

  var sync = function(method, entity, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    langx.defaults(options || (options = {}), {
      emulateHTTP: entities.emulateHTTP,
      emulateJSON: entities.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = langx.result(entity, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && entity && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || entity.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {entity: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = langx.Xhr.request(langx.mixin(params, options));
    entity.trigger('request', entity, xhr, options);
    return xhr;
  };

 
  
  return entities.backends.ajaxSync = sync;

});
define('skylark-data-entities/backends/localSync',[
  "skylark-langx/langx",
  "../entities"
],function(langx,entities){

  // A simple module to replace `Backbone.sync` with *localStorage*-based
  // persistence. Models are given GUIDS, and saved into a JSON object. Simple
  // as that.

  // Hold reference to Underscore.js and Backbone.js in the closure in order
  // to make things work even if they are removed from the global namespace

  // Generate four random hex digits.
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  // Our Store is represented by a single JS object in *localStorage*. Create it
  // with a meaningful name, like the name you'd give a table.
  // window.Store is deprecated, use Backbone.LocalStorage instead
  var LocalStorage = langx.klass({
    _construct : function(name) {
      this.name = name;
      var store = this.localStorage().getItem(this.name);
      this.records = (store && store.split(",")) || [];
    },

    // Save the current state of the **Store** to *localStorage*.
    save: function() {
      this.localStorage().setItem(this.name, this.records.join(","));
    },

    // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
    // have an id of it's own.
    create: function(model) {
      if (!model.id) {
        model.id = guid();
        model.set(model.idAttribute, model.id);
      }
      this.localStorage().setItem(this.name+"-"+model.id, JSON.stringify(model));
      this.records.push(model.id.toString());
      this.save();
      return this.find(model);
    },

    // Update a model by replacing its copy in `this.data`.
    update: function(model) {
      this.localStorage().setItem(this.name+"-"+model.id, JSON.stringify(model));
      if (!_.include(this.records, model.id.toString()))
        this.records.push(model.id.toString()); this.save();
      return this.find(model);
    },

    // Retrieve a model from `this.data` by id.
    find: function(model) {
      return this.jsonData(this.localStorage().getItem(this.name+"-"+model.id));
    },

    // Return the array of all entities currently in storage.
    findAll: function() {
      return _(this.records).chain()
        .map(function(id){
          return this.jsonData(this.localStorage().getItem(this.name+"-"+id));
        }, this)
        .compact()
        .value();
    },

    // Delete a model from `this.data`, returning it.
    destroy: function(model) {
      if (model.isNew())
        return false
      this.localStorage().removeItem(this.name+"-"+model.id);
      this.records = _.reject(this.records, function(id){
        return id === model.id.toString();
      });
      this.save();
      return model;
    },

    localStorage: function() {
      return localStorage;
    },

    // fix for "illegal access" error on Android when JSON.parse is passed null
    jsonData: function (data) {
        return data && JSON.parse(data);
    }

  });

  // localSync delegate to the model or collection's
  // *localStorage* property, which should be an instance of `Store`.
  function sync(method, model, options) {
    var store = model.localStorage || model.collection.localStorage;

    var resp, errorMessage, syncDfd = langx.Deferred(); //If $ is having Deferred - use it.

    try {

      switch (method) {
        case "read":
          resp = model.id != undefined ? store.find(model) : store.findAll();
          break;
        case "create":
          resp = store.create(model);
          break;
        case "update":
          resp = store.update(model);
          break;
        case "delete":
          resp = store.destroy(model);
          break;
      }

    } catch(error) {
      if (error.code === DOMException.QUOTA_EXCEEDED_ERR && window.localStorage.length === 0)
        errorMessage = "Private browsing is unsupported";
      else
        errorMessage = error.message;
    }

    if (resp) {
      model.trigger("sync", model, resp, options);
      if (options && options.success)
        options.success(resp);
      if (syncDfd)
        syncDfd.resolve(resp);

    } else {
      errorMessage = errorMessage ? errorMessage
                                  : "Record Not Found";

      if (options && options.error)
        options.error(errorMessage);
      if (syncDfd)
        syncDfd.reject(errorMessage);
    }

    // add compatibility with $.ajax
    // always execute callback for success and error
    if (options && options.complete) options.complete(resp);

    return syncDfd && syncDfd.promise();
  };

  entities.backends.LocalStorage = sync.LocalStorage = LocalStorage;
  
  return entities.backends.localSync = sync;

});
define('skylark-data-entities/main',[
	"./entities",
	"./Collection",
	"./Entity",
	"./sync",
	"./backends/ajaxSync",
	"./backends/localSync",
	"./backends/registry"
],function(entities){
	return entities;
});
define('skylark-data-entities', ['skylark-data-entities/main'], function (main) { return main; });

define('skylark-io-streams/streams',[
    "skylark-langx/skylark"
], function(skylark) {

    return skylark.attach("data.streams",{});
});

define('skylark-io-streams/Stream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams"
], function(skylark, langx,streams) {

   	var Stream = langx.Evented.inherit({
        klassName: "Stream",
        init: function(arrayBuffer, start, length, dict) {
	        this.bytes = new Uint8Array(arrayBuffer);
	        this.start = start || 0;
	        this.pos = this.start;
	        this.end = (start + length) || this.bytes.length;
	        this.dict = dict;
        },


        length : {
        	get : function() {
            	return this.end - this.start;
        	}
        },

        getByte: function () {
            if (this.pos >= this.end)
                return null;
            return this.bytes[this.pos++];
        },
        // returns subarray of original buffer
        // should only be read
        getBytes: function (length) {
            var bytes = this.bytes;
            var pos = this.pos;
            var strEnd = this.end;

            if (!length)
                return bytes.subarray(pos, strEnd);

            var end = pos + length;
            if (end > strEnd)
                end = strEnd;

            this.pos = end;
            return bytes.subarray(pos, end);
        },

        lookChar: function () {
            if (this.pos >= this.end)
                return null;
            return String.fromCharCode(this.bytes[this.pos]);
        },
        getChar: function () {
            if (this.pos >= this.end)
                return null;
            return String.fromCharCode(this.bytes[this.pos++]);
        },
        skip: function (n) {
            if (!n)
                n = 1;
            this.pos += n;
        },
        reset: function () {
            this.pos = this.start;
        },
        moveStart: function () {
            this.start = this.pos;
        },
        makeSubStream: function (start, length, dict) {
            return new Stream(this.bytes.buffer, start, length, dict);
        },
        isStream: true
    });
    
    return streams.Stream = Stream;
	
});

define('skylark-io-streams/DecodeStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./Stream"
], function(skylark, langx, streams, Stream) {

    var DecodeStream = Stream.inherit({
        klassName : "DecodeStream",

        init : function() {
            this.pos = 0;
            this.bufferLength = 0;
            this.eof = false;
            this.buffer = null;     
        },

        ensureBuffer: function(requested) {
            var buffer = this.buffer;
            var current = buffer ? buffer.byteLength : 0;
            if (requested < current)
                return buffer;
            var size = 512;
            while (size < requested)
                size <<= 1;
            var buffer2 = new Uint8Array(size);
            for (var i = 0; i < current; ++i)
                buffer2[i] = buffer[i];
            return (this.buffer = buffer2);
        },
        getByte: function () {
            var pos = this.pos;
            while (this.bufferLength <= pos) {
                if (this.eof)
                    return null;
                this.readBlock();
            }
            return this.buffer[this.pos++];
        },
        getBytes: function(length) {
            var end, pos = this.pos;

            if (length) {
                this.ensureBuffer(pos + length);
                end = pos + length;

                while (!this.eof && this.bufferLength < end)
                    this.readBlock();

                var bufEnd = this.bufferLength;
                if (end > bufEnd)
                    end = bufEnd;
            } else {
                while (!this.eof)
                    this.readBlock();

                end = this.bufferLength;

                // checking if bufferLength is still 0 then
                // the buffer has to be initialized
                if (!end)
                    this.buffer = new Uint8Array(0);
            }

            this.pos = end;
            return this.buffer.subarray(pos, end);
        },
        lookChar: function() {
            var pos = this.pos;
            while (this.bufferLength <= pos) {
                if (this.eof)
                    return null;
                this.readBlock();
            }
            return String.fromCharCode(this.buffer[this.pos]);
        },
        getChar: function () {
            var pos = this.pos;
            while (this.bufferLength <= pos) {
                if (this.eof)
                    return null;
                this.readBlock();
            }
            return String.fromCharCode(this.buffer[this.pos++]);
        },
        makeSubStream: function (start, length, dict) {
            var end = start + length;
            while (this.bufferLength <= end && !this.eof)
                this.readBlock();
            return new Stream(this.buffer, start, length, dict);
        },
        skip: function (n) {
            if (!n)
                n = 1;
            this.pos += n;
        },
        reset: function () {
            this.pos = 0;
        }

    });

    return streams.DecodeStream = DecodeStream;

});

define('skylark-io-streams/Ascii85Stream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var Ascii85Stream = DecodeStream.inherit({
        klassName : "Ascii85Stream",

        init : function(str) {
            this.str = str;
            this.dict = str.dict;
            this.input = new Uint8Array(5);

            DecodeStream.prototype.init.call(this);          
        },

        readBlock : function() {
            var tildaCode = '~'.charCodeAt(0);
            var zCode = 'z'.charCodeAt(0);
            var str = this.str;

            var c = str.getByte();
            while (Lexer.isSpace(String.fromCharCode(c)))
                c = str.getByte();

            if (!c || c === tildaCode) {
                this.eof = true;
                return;
            }

            var bufferLength = this.bufferLength,
                buffer;

            // special code for z
            if (c == zCode) {
                buffer = this.ensureBuffer(bufferLength + 4);
                for (var i = 0; i < 4; ++i)
                    buffer[bufferLength + i] = 0;
                this.bufferLength += 4;
            } else {
                var input = this.input;
                input[0] = c;
                for (var i = 1; i < 5; ++i) {
                    c = str.getByte();
                    while (Lexer.isSpace(String.fromCharCode(c)))
                        c = str.getByte();

                    input[i] = c;

                    if (!c || c == tildaCode)
                        break;
                }
                buffer = this.ensureBuffer(bufferLength + i - 1);
                this.bufferLength += i - 1;

                // partial ending;
                if (i < 5) {
                    for (; i < 5; ++i)
                        input[i] = 0x21 + 84;
                    this.eof = true;
                }
                var t = 0;
                for (var i = 0; i < 5; ++i)
                    t = t * 85 + (input[i] - 0x21);

                for (var i = 3; i >= 0; --i) {
                    buffer[bufferLength + i] = t & 0xFF;
                    t >>= 8;
                }
            }

        }

    });

    return streams.Ascii85Stream = Ascii85Stream;

});

define('skylark-io-streams/AsciiHexStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {
    var hexvalueMap = {
        9: -1, // \t
        32: -1, // space
        48: 0,
        49: 1,
        50: 2,
        51: 3,
        52: 4,
        53: 5,
        54: 6,
        55: 7,
        56: 8,
        57: 9,
        65: 10,
        66: 11,
        67: 12,
        68: 13,
        69: 14,
        70: 15,
        97: 10,
        98: 11,
        99: 12,
        100: 13,
        101: 14,
        102: 15
    };

    var AsciiHexStream = DecodeStream.inherit({
        klassName : "AsciiHexStream",

        init : function(str) {
            this.str = str;
            this.dict = str.dict;

            DecodeStream.prototype.init.call(this);          
        },

        readBlock : function() {
            var gtCode = '>'.charCodeAt(0),
                bytes = this.str.getBytes(),
                c, n,
                decodeLength, buffer, bufferLength, i, length;

            decodeLength = (bytes.length + 1) >> 1;
            buffer = this.ensureBuffer(this.bufferLength + decodeLength);
            bufferLength = this.bufferLength;

            for (i = 0, length = bytes.length; i < length; i++) {
                c = hexvalueMap[bytes[i]];
                while (c == -1 && (i + 1) < length) {
                    c = hexvalueMap[bytes[++i]];
                }

                if ((i + 1) < length && (bytes[i + 1] !== gtCode)) {
                    n = hexvalueMap[bytes[++i]];
                    buffer[bufferLength++] = c * 16 + n;
                } else {
                    // EOD marker at an odd number, behave as if a 0 followed the last
                    // digit.
                    if (bytes[i] !== gtCode) {
                        buffer[bufferLength++] = c * 16;
                    }
                }
            }

            this.bufferLength = bufferLength;
            this.eof = true;        
       }

    });

    return streams.AsciiHexStream = AsciiHexStream;
});

define('skylark-io-streams/ChunkedStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./Stream"
], function(skylark, langx,streams,Stream) {


    var ChunkedStream = Stream.inherit({
        klassName : "ChunkedStream",

        "numChunks": 0,
        "numChunksLoaded": 0,

        init : function(str) {
            var length = str.length;
            var bytes = new Uint8Array(length);
            for (var n = 0; n < length; ++n)
                bytes[n] = str.charCodeAt(n);
            DecodeStream.prototype.init.call(bytes);          
            this.dict = stream.dict;
        },

        "numChunks": function() {

        },


        getMissingChunks: function ChunkedStream_getMissingChunks() {
            var chunks = [];
            for (var chunk = 0, n = this.numChunks; chunk < n; ++chunk) {
                if (!(chunk in this.loadedChunks)) {
                    chunks.push(chunk);
                }
            }
            return chunks;
        },

        getBaseStreams: function ChunkedStream_getBaseStreams() {
            return [this];
        },

        allChunksLoaded: function ChunkedStream_allChunksLoaded() {
            var _ = this._;
            return _.numChunksLoaded === _.numChunks;
        },

        onReceiveData: function(begin, chunk) {
            var end = begin + chunk.byteLength;

            assert(begin % this.chunkSize === 0, 'Bad begin offset: ' + begin);
            // Using this.length is inaccurate here since this.start can be moved
            // See ChunkedStream.moveStart()
            var length = this.bytes.length;
            assert(end % this.chunkSize === 0 || end === length,
                'Bad end offset: ' + end);

            this.bytes.set(new Uint8Array(chunk), begin);
            var chunkSize = this.chunkSize;
            var beginChunk = Math.floor(begin / chunkSize);
            var endChunk = Math.floor((end - 1) / chunkSize) + 1;

            for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
                if (!(chunk in this.loadedChunks)) {
                    this.loadedChunks[chunk] = true;
                    ++this.numChunksLoaded;
                }
            }
        },

        onReceiveInitialData: function(data) {
            this.bytes.set(data);
            this.initialDataLength = data.length;
            var endChunk = this.end === data.length ?
                this.numChunks : Math.floor(data.length / this.chunkSize);
            for (var i = 0; i < endChunk; i++) {
                this.loadedChunks[i] = true;
                ++this.numChunksLoaded;
            }
        },

        ensureRange: function ChunkedStream_ensureRange(begin, end) {
            if (begin >= end) {
                return;
            }

            if (end <= this.initialDataLength) {
                return;
            }

            var chunkSize = this.chunkSize;
            var beginChunk = Math.floor(begin / chunkSize);
            var endChunk = Math.floor((end - 1) / chunkSize) + 1;
            for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
                if (!(chunk in this.loadedChunks)) {
                    throw new MissingDataException(begin, end);
                }
            }
        },

        nextEmptyChunk: function ChunkedStream_nextEmptyChunk(beginChunk) {
            for (var chunk = beginChunk, n = this.numChunks; chunk < n; ++chunk) {
                if (!(chunk in this.loadedChunks)) {
                    return chunk;
                }
            }
            // Wrap around to beginning
            for (var chunk = 0; chunk < beginChunk; ++chunk) {
                if (!(chunk in this.loadedChunks)) {
                    return chunk;
                }
            }
            return null;
        },

        hasChunk: function ChunkedStream_hasChunk(chunk) {
            return chunk in this._.loadedChunks;
        },

        getByte: function ChunkedStream_getByte() {
            var pos = this.pos;
            if (pos >= this.end) {
                return -1;
            }
            this.ensureRange(pos, pos + 1);
            return this.bytes[this.pos++];
        },

        // returns subarray of original buffer
        // should only be read
        getBytes: function ChunkedStream_getBytes(length) {
            var bytes = this.bytes;
            var pos = this.pos;
            var strEnd = this.end;

            if (!length) {
                this.ensureRange(pos, strEnd);
                return bytes.subarray(pos, strEnd);
            }

            var end = pos + length;
            if (end > strEnd)
                end = strEnd;
            this.ensureRange(pos, end);

            this.pos = end;
            return bytes.subarray(pos, end);
        },

        peekBytes: function ChunkedStream_peekBytes(length) {
            var bytes = this.getBytes(length);
            this.pos -= bytes.length;
            return bytes;
        },

        getByteRange: function ChunkedStream_getBytes(begin, end) {
            this.ensureRange(begin, end);
            return this.bytes.subarray(begin, end);
        },

        skip: function ChunkedStream_skip(n) {
            if (!n)
                n = 1;
            this.pos += n;
        },

        reset: function ChunkedStream_reset() {
            this.pos = this.start;
        },

        moveStart: function ChunkedStream_moveStart() {
            this.start = this.pos;
        },

        makeSubStream: function ChunkedStream_makeSubStream(start, length, dict) {
            function ChunkedStreamSubstream() {}
            ChunkedStreamSubstream.prototype = Object.create(this);
            ChunkedStreamSubstream.prototype.getMissingChunks = function() {
                var chunkSize = this.chunkSize;
                var beginChunk = Math.floor(this.start / chunkSize);
                var endChunk = Math.floor((this.end - 1) / chunkSize) + 1;
                var missingChunks = [];
                for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
                    if (!(chunk in this.loadedChunks)) {
                        missingChunks.push(chunk);
                    }
                }
                return missingChunks;
            };
            var subStream = new ChunkedStreamSubstream();
            subStream.pos = subStream.start = start;
            subStream.end = start + length || this.end;
            subStream.dict = dict;
            return subStream;
        }
    });

    return streams.ChunkedStream = ChunkedStream;

});


define('skylark-io-streams/DecryptStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var chunkSize = 512;

    var DecryptStream = DecodeStream.inherit({
        klassName : "DecryptStream",

        init : function(str, decrypt) {
            this.str = str;
            this.dict = str.dict;
            this.decrypt = decrypt;
            DecodeStream.prototype.init.call(this);          
        },

        readBlock : function() {
            var chunk = this.str.getBytes(chunkSize);
            if (!chunk || chunk.length == 0) {
                this.eof = true;
                return;
            }
            var decrypt = this.decrypt;
            chunk = decrypt(chunk);

            var bufferLength = this.bufferLength;
            var i, n = chunk.length;
            var buffer = this.ensureBuffer(bufferLength + n);
            for (i = 0; i < n; i++)
                buffer[bufferLength++] = chunk[i];
            this.bufferLength = bufferLength;
        }
    });

    return streams.DecryptStream = DecryptStream;
});


define('skylark-io-streams/FakeStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var FakeStream = DecodeStream.inherit({
        klassName : "FakeStream",

        init : function(stream) {
            this.dict = stream.dict;
            Stream.prototype.init.call(this);          
        },

        readBlock : function() {
            var bufferLength = this.bufferLength;
            bufferLength += 1024;
            var buffer = this.ensureBuffer(bufferLength);
            this.bufferLength = bufferLength;
        },

        getBytes : function (length) {
            var end, pos = this.pos;

            if (length) {
                this.ensureBuffer(pos + length);
                end = pos + length;

                while (!this.eof && this.bufferLength < end)
                    this.readBlock();

                var bufEnd = this.bufferLength;
                if (end > bufEnd)
                    end = bufEnd;
            } else {
                this.eof = true;
                end = this.bufferLength;
            }

            this.pos = end;
            return this.buffer.subarray(pos, end);
        }

    });

    return streams.FakeStream = FakeStream;
});


define('skylark-io-streams/FlateStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var codeLenCodeMap = new Uint32Array([
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
    ]);

    var lengthDecode = new Uint32Array([
        0x00003, 0x00004, 0x00005, 0x00006, 0x00007, 0x00008, 0x00009, 0x0000a,
        0x1000b, 0x1000d, 0x1000f, 0x10011, 0x20013, 0x20017, 0x2001b, 0x2001f,
        0x30023, 0x3002b, 0x30033, 0x3003b, 0x40043, 0x40053, 0x40063, 0x40073,
        0x50083, 0x500a3, 0x500c3, 0x500e3, 0x00102, 0x00102, 0x00102
    ]);

    var distDecode = new Uint32Array([
        0x00001, 0x00002, 0x00003, 0x00004, 0x10005, 0x10007, 0x20009, 0x2000d,
        0x30011, 0x30019, 0x40021, 0x40031, 0x50041, 0x50061, 0x60081, 0x600c1,
        0x70101, 0x70181, 0x80201, 0x80301, 0x90401, 0x90601, 0xa0801, 0xa0c01,
        0xb1001, 0xb1801, 0xc2001, 0xc3001, 0xd4001, 0xd6001
    ]);

    var fixedLitCodeTab = [new Uint32Array([
        0x70100, 0x80050, 0x80010, 0x80118, 0x70110, 0x80070, 0x80030, 0x900c0,
        0x70108, 0x80060, 0x80020, 0x900a0, 0x80000, 0x80080, 0x80040, 0x900e0,
        0x70104, 0x80058, 0x80018, 0x90090, 0x70114, 0x80078, 0x80038, 0x900d0,
        0x7010c, 0x80068, 0x80028, 0x900b0, 0x80008, 0x80088, 0x80048, 0x900f0,
        0x70102, 0x80054, 0x80014, 0x8011c, 0x70112, 0x80074, 0x80034, 0x900c8,
        0x7010a, 0x80064, 0x80024, 0x900a8, 0x80004, 0x80084, 0x80044, 0x900e8,
        0x70106, 0x8005c, 0x8001c, 0x90098, 0x70116, 0x8007c, 0x8003c, 0x900d8,
        0x7010e, 0x8006c, 0x8002c, 0x900b8, 0x8000c, 0x8008c, 0x8004c, 0x900f8,
        0x70101, 0x80052, 0x80012, 0x8011a, 0x70111, 0x80072, 0x80032, 0x900c4,
        0x70109, 0x80062, 0x80022, 0x900a4, 0x80002, 0x80082, 0x80042, 0x900e4,
        0x70105, 0x8005a, 0x8001a, 0x90094, 0x70115, 0x8007a, 0x8003a, 0x900d4,
        0x7010d, 0x8006a, 0x8002a, 0x900b4, 0x8000a, 0x8008a, 0x8004a, 0x900f4,
        0x70103, 0x80056, 0x80016, 0x8011e, 0x70113, 0x80076, 0x80036, 0x900cc,
        0x7010b, 0x80066, 0x80026, 0x900ac, 0x80006, 0x80086, 0x80046, 0x900ec,
        0x70107, 0x8005e, 0x8001e, 0x9009c, 0x70117, 0x8007e, 0x8003e, 0x900dc,
        0x7010f, 0x8006e, 0x8002e, 0x900bc, 0x8000e, 0x8008e, 0x8004e, 0x900fc,
        0x70100, 0x80051, 0x80011, 0x80119, 0x70110, 0x80071, 0x80031, 0x900c2,
        0x70108, 0x80061, 0x80021, 0x900a2, 0x80001, 0x80081, 0x80041, 0x900e2,
        0x70104, 0x80059, 0x80019, 0x90092, 0x70114, 0x80079, 0x80039, 0x900d2,
        0x7010c, 0x80069, 0x80029, 0x900b2, 0x80009, 0x80089, 0x80049, 0x900f2,
        0x70102, 0x80055, 0x80015, 0x8011d, 0x70112, 0x80075, 0x80035, 0x900ca,
        0x7010a, 0x80065, 0x80025, 0x900aa, 0x80005, 0x80085, 0x80045, 0x900ea,
        0x70106, 0x8005d, 0x8001d, 0x9009a, 0x70116, 0x8007d, 0x8003d, 0x900da,
        0x7010e, 0x8006d, 0x8002d, 0x900ba, 0x8000d, 0x8008d, 0x8004d, 0x900fa,
        0x70101, 0x80053, 0x80013, 0x8011b, 0x70111, 0x80073, 0x80033, 0x900c6,
        0x70109, 0x80063, 0x80023, 0x900a6, 0x80003, 0x80083, 0x80043, 0x900e6,
        0x70105, 0x8005b, 0x8001b, 0x90096, 0x70115, 0x8007b, 0x8003b, 0x900d6,
        0x7010d, 0x8006b, 0x8002b, 0x900b6, 0x8000b, 0x8008b, 0x8004b, 0x900f6,
        0x70103, 0x80057, 0x80017, 0x8011f, 0x70113, 0x80077, 0x80037, 0x900ce,
        0x7010b, 0x80067, 0x80027, 0x900ae, 0x80007, 0x80087, 0x80047, 0x900ee,
        0x70107, 0x8005f, 0x8001f, 0x9009e, 0x70117, 0x8007f, 0x8003f, 0x900de,
        0x7010f, 0x8006f, 0x8002f, 0x900be, 0x8000f, 0x8008f, 0x8004f, 0x900fe,
        0x70100, 0x80050, 0x80010, 0x80118, 0x70110, 0x80070, 0x80030, 0x900c1,
        0x70108, 0x80060, 0x80020, 0x900a1, 0x80000, 0x80080, 0x80040, 0x900e1,
        0x70104, 0x80058, 0x80018, 0x90091, 0x70114, 0x80078, 0x80038, 0x900d1,
        0x7010c, 0x80068, 0x80028, 0x900b1, 0x80008, 0x80088, 0x80048, 0x900f1,
        0x70102, 0x80054, 0x80014, 0x8011c, 0x70112, 0x80074, 0x80034, 0x900c9,
        0x7010a, 0x80064, 0x80024, 0x900a9, 0x80004, 0x80084, 0x80044, 0x900e9,
        0x70106, 0x8005c, 0x8001c, 0x90099, 0x70116, 0x8007c, 0x8003c, 0x900d9,
        0x7010e, 0x8006c, 0x8002c, 0x900b9, 0x8000c, 0x8008c, 0x8004c, 0x900f9,
        0x70101, 0x80052, 0x80012, 0x8011a, 0x70111, 0x80072, 0x80032, 0x900c5,
        0x70109, 0x80062, 0x80022, 0x900a5, 0x80002, 0x80082, 0x80042, 0x900e5,
        0x70105, 0x8005a, 0x8001a, 0x90095, 0x70115, 0x8007a, 0x8003a, 0x900d5,
        0x7010d, 0x8006a, 0x8002a, 0x900b5, 0x8000a, 0x8008a, 0x8004a, 0x900f5,
        0x70103, 0x80056, 0x80016, 0x8011e, 0x70113, 0x80076, 0x80036, 0x900cd,
        0x7010b, 0x80066, 0x80026, 0x900ad, 0x80006, 0x80086, 0x80046, 0x900ed,
        0x70107, 0x8005e, 0x8001e, 0x9009d, 0x70117, 0x8007e, 0x8003e, 0x900dd,
        0x7010f, 0x8006e, 0x8002e, 0x900bd, 0x8000e, 0x8008e, 0x8004e, 0x900fd,
        0x70100, 0x80051, 0x80011, 0x80119, 0x70110, 0x80071, 0x80031, 0x900c3,
        0x70108, 0x80061, 0x80021, 0x900a3, 0x80001, 0x80081, 0x80041, 0x900e3,
        0x70104, 0x80059, 0x80019, 0x90093, 0x70114, 0x80079, 0x80039, 0x900d3,
        0x7010c, 0x80069, 0x80029, 0x900b3, 0x80009, 0x80089, 0x80049, 0x900f3,
        0x70102, 0x80055, 0x80015, 0x8011d, 0x70112, 0x80075, 0x80035, 0x900cb,
        0x7010a, 0x80065, 0x80025, 0x900ab, 0x80005, 0x80085, 0x80045, 0x900eb,
        0x70106, 0x8005d, 0x8001d, 0x9009b, 0x70116, 0x8007d, 0x8003d, 0x900db,
        0x7010e, 0x8006d, 0x8002d, 0x900bb, 0x8000d, 0x8008d, 0x8004d, 0x900fb,
        0x70101, 0x80053, 0x80013, 0x8011b, 0x70111, 0x80073, 0x80033, 0x900c7,
        0x70109, 0x80063, 0x80023, 0x900a7, 0x80003, 0x80083, 0x80043, 0x900e7,
        0x70105, 0x8005b, 0x8001b, 0x90097, 0x70115, 0x8007b, 0x8003b, 0x900d7,
        0x7010d, 0x8006b, 0x8002b, 0x900b7, 0x8000b, 0x8008b, 0x8004b, 0x900f7,
        0x70103, 0x80057, 0x80017, 0x8011f, 0x70113, 0x80077, 0x80037, 0x900cf,
        0x7010b, 0x80067, 0x80027, 0x900af, 0x80007, 0x80087, 0x80047, 0x900ef,
        0x70107, 0x8005f, 0x8001f, 0x9009f, 0x70117, 0x8007f, 0x8003f, 0x900df,
        0x7010f, 0x8006f, 0x8002f, 0x900bf, 0x8000f, 0x8008f, 0x8004f, 0x900ff
    ]), 9];

    var fixedDistCodeTab = [new Uint32Array([
        0x50000, 0x50010, 0x50008, 0x50018, 0x50004, 0x50014, 0x5000c, 0x5001c,
        0x50002, 0x50012, 0x5000a, 0x5001a, 0x50006, 0x50016, 0x5000e, 0x00000,
        0x50001, 0x50011, 0x50009, 0x50019, 0x50005, 0x50015, 0x5000d, 0x5001d,
        0x50003, 0x50013, 0x5000b, 0x5001b, 0x50007, 0x50017, 0x5000f, 0x00000
    ]), 5];


    var FlateStream = DecodeStream.inherit({
        klassName : "FlateStream",

        init : function(stream) {
            var bytes = stream.getBytes();
            var bytesPos = 0;

            this.dict = stream.dict;
            var cmf = bytes[bytesPos++];
            var flg = bytes[bytesPos++];
            if (cmf == -1 || flg == -1)
                error('Invalid header in flate stream: ' + cmf + ', ' + flg);
            if ((cmf & 0x0f) != 0x08)
                error('Unknown compression method in flate stream: ' + cmf + ', ' + flg);
            if ((((cmf << 8) + flg) % 31) != 0)
                error('Bad FCHECK in flate stream: ' + cmf + ', ' + flg);
            if (flg & 0x20)
                error('FDICT bit set in flate stream: ' + cmf + ', ' + flg);

            this.bytes = bytes;
            this.bytesPos = bytesPos;

            this.codeSize = 0;
            this.codeBuf = 0;
            DecodeStream.prototype.init.call(this);          
        },

        getBits : function(bits) {
            var codeSize = this.codeSize;
            var codeBuf = this.codeBuf;
            var bytes = this.bytes;
            var bytesPos = this.bytesPos;

            var b;
            while (codeSize < bits) {
                if (typeof(b = bytes[bytesPos++]) == 'undefined')
                    error('Bad encoding in flate stream');
                codeBuf |= b << codeSize;
                codeSize += 8;
            }
            b = codeBuf & ((1 << bits) - 1);
            this.codeBuf = codeBuf >> bits;
            this.codeSize = codeSize -= bits;
            this.bytesPos = bytesPos;
            return b;
        },

        getCode : function(table) {
            var codes = table[0];
            var maxLen = table[1];
            var codeSize = this.codeSize;
            var codeBuf = this.codeBuf;
            var bytes = this.bytes;
            var bytesPos = this.bytesPos;

            while (codeSize < maxLen) {
                var b;
                if (typeof(b = bytes[bytesPos++]) == 'undefined')
                    error('Bad encoding in flate stream');
                codeBuf |= (b << codeSize);
                codeSize += 8;
            }
            var code = codes[codeBuf & ((1 << maxLen) - 1)];
            var codeLen = code >> 16;
            var codeVal = code & 0xffff;
            if (codeSize == 0 || codeSize < codeLen || codeLen == 0)
                error('Bad encoding in flate stream');
            this.codeBuf = (codeBuf >> codeLen);
            this.codeSize = (codeSize - codeLen);
            this.bytesPos = bytesPos;
            return codeVal;
        },

        generateHuffmanTable : function(lengths) {
                var n = lengths.length;

                // find max code length
                var maxLen = 0;
                for (var i = 0; i < n; ++i) {
                    if (lengths[i] > maxLen)
                        maxLen = lengths[i];
                }

                // build the table
                var size = 1 << maxLen;
                var codes = new Uint32Array(size);
                for (var len = 1, code = 0, skip = 2; len <= maxLen;
                    ++len, code <<= 1, skip <<= 1) {
                    for (var val = 0; val < n; ++val) {
                        if (lengths[val] == len) {
                            // bit-reverse the code
                            var code2 = 0;
                            var t = code;
                            for (var i = 0; i < len; ++i) {
                                code2 = (code2 << 1) | (t & 1);
                                t >>= 1;
                            }

                            // fill the table entries
                            for (var i = code2; i < size; i += skip)
                                codes[i] = (len << 16) | val;

                            ++code;
                        }
                    }
                }

                return [codes, maxLen];
        },

        readBlock : function() {
            // read block header
            var hdr = this.getBits(3);
            if (hdr & 1)
                this.eof = true;
            hdr >>= 1;

            if (hdr == 0) { // uncompressed block
                var bytes = this.bytes;
                var bytesPos = this.bytesPos;
                var b;

                if (typeof(b = bytes[bytesPos++]) == 'undefined')
                    error('Bad block header in flate stream');
                var blockLen = b;
                if (typeof(b = bytes[bytesPos++]) == 'undefined')
                    error('Bad block header in flate stream');
                blockLen |= (b << 8);
                if (typeof(b = bytes[bytesPos++]) == 'undefined')
                    error('Bad block header in flate stream');
                var check = b;
                if (typeof(b = bytes[bytesPos++]) == 'undefined')
                    error('Bad block header in flate stream');
                check |= (b << 8);
                if (check != (~blockLen & 0xffff))
                    error('Bad uncompressed block length in flate stream');

                this.codeBuf = 0;
                this.codeSize = 0;

                var bufferLength = this.bufferLength;
                var buffer = this.ensureBuffer(bufferLength + blockLen);
                var end = bufferLength + blockLen;
                this.bufferLength = end;
                for (var n = bufferLength; n < end; ++n) {
                    if (typeof(b = bytes[bytesPos++]) == 'undefined') {
                        this.eof = true;
                        break;
                    }
                    buffer[n] = b;
                }
                this.bytesPos = bytesPos;
                return;
            }

            var litCodeTable;
            var distCodeTable;
            if (hdr == 1) { // compressed block, fixed codes
                litCodeTable = fixedLitCodeTab;
                distCodeTable = fixedDistCodeTab;
            } else if (hdr == 2) { // compressed block, dynamic codes
                var numLitCodes = this.getBits(5) + 257;
                var numDistCodes = this.getBits(5) + 1;
                var numCodeLenCodes = this.getBits(4) + 4;

                // build the code lengths code table
                var codeLenCodeLengths = new Uint8Array(codeLenCodeMap.length);

                for (var i = 0; i < numCodeLenCodes; ++i)
                    codeLenCodeLengths[codeLenCodeMap[i]] = this.getBits(3);
                var codeLenCodeTab = this.generateHuffmanTable(codeLenCodeLengths);

                // build the literal and distance code tables
                var len = 0;
                var i = 0;
                var codes = numLitCodes + numDistCodes;
                var codeLengths = new Uint8Array(codes);
                while (i < codes) {
                    var code = this.getCode(codeLenCodeTab);
                    if (code == 16) {
                        var bitsLength = 2,
                            bitsOffset = 3,
                            what = len;
                    } else if (code == 17) {
                        var bitsLength = 3,
                            bitsOffset = 3,
                            what = (len = 0);
                    } else if (code == 18) {
                        var bitsLength = 7,
                            bitsOffset = 11,
                            what = (len = 0);
                    } else {
                        codeLengths[i++] = len = code;
                        continue;
                    }

                    var repeatLength = this.getBits(bitsLength) + bitsOffset;
                    while (repeatLength-- > 0)
                        codeLengths[i++] = what;
                }

                litCodeTable =
                    this.generateHuffmanTable(codeLengths.subarray(0, numLitCodes));
                distCodeTable =
                    this.generateHuffmanTable(codeLengths.subarray(numLitCodes, codes));
            } else {
                error('Unknown block type in flate stream');
            }

            var buffer = this.buffer;
            var limit = buffer ? buffer.length : 0;
            var pos = this.bufferLength;
            while (true) {
                var code1 = this.getCode(litCodeTable);
                if (code1 < 256) {
                    if (pos + 1 >= limit) {
                        buffer = this.ensureBuffer(pos + 1);
                        limit = buffer.length;
                    }
                    buffer[pos++] = code1;
                    continue;
                }
                if (code1 == 256) {
                    this.bufferLength = pos;
                    return;
                }
                code1 -= 257;
                code1 = lengthDecode[code1];
                var code2 = code1 >> 16;
                if (code2 > 0)
                    code2 = this.getBits(code2);
                var len = (code1 & 0xffff) + code2;
                code1 = this.getCode(distCodeTable);
                code1 = distDecode[code1];
                code2 = code1 >> 16;
                if (code2 > 0)
                    code2 = this.getBits(code2);
                var dist = (code1 & 0xffff) + code2;
                if (pos + len >= limit) {
                    buffer = this.ensureBuffer(pos + len);
                    limit = buffer.length;
                }
                for (var k = 0; k < len; ++k, ++pos)
                    buffer[pos] = buffer[pos - dist];
            }
        }
    });


    return streams.FlateStream = FlateStream;
});

define('skylark-io-streams/LZWStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var LZWStream = DecodeStream.inherit({
        klassName : "LZWStream",

        init : function(str, earlyChange) {
            this.str = str;
            this.dict = str.dict;
            this.cachedData = 0;
            this.bitsCached = 0;

            var maxLzwDictionarySize = 4096;
            var lzwState = {
                earlyChange: earlyChange,
                codeLength: 9,
                nextCode: 258,
                dictionaryValues: new Uint8Array(maxLzwDictionarySize),
                dictionaryLengths: new Uint16Array(maxLzwDictionarySize),
                dictionaryPrevCodes: new Uint16Array(maxLzwDictionarySize),
                currentSequence: new Uint8Array(maxLzwDictionarySize),
                currentSequenceLength: 0
            };
            for (var i = 0; i < 256; ++i) {
                lzwState.dictionaryValues[i] = i;
                lzwState.dictionaryLengths[i] = 1;
            }
            this.lzwState = lzwState;
            DecodeStream.prototype.init.call(this);          
        },

        readBits : function(n) {
            var bitsCached = this.bitsCached;
            var cachedData = this.cachedData;
            while (bitsCached < n) {
                var c = this.str.getByte();
                if (c == null) {
                    this.eof = true;
                    return null;
                }
                cachedData = (cachedData << 8) | c;
                bitsCached += 8;
            }
            this.bitsCached = (bitsCached -= n);
            this.cachedData = cachedData;
            this.lastCode = null;
            return (cachedData >>> bitsCached) & ((1 << n) - 1);
        },

        readBlock : function() {
            var blockSize = 512;
            var estimatedDecodedSize = blockSize * 2,
                decodedSizeDelta = blockSize;
            var i, j, q;

            var lzwState = this.lzwState;
            if (!lzwState)
                return; // eof was found

            var earlyChange = lzwState.earlyChange;
            var nextCode = lzwState.nextCode;
            var dictionaryValues = lzwState.dictionaryValues;
            var dictionaryLengths = lzwState.dictionaryLengths;
            var dictionaryPrevCodes = lzwState.dictionaryPrevCodes;
            var codeLength = lzwState.codeLength;
            var prevCode = lzwState.prevCode;
            var currentSequence = lzwState.currentSequence;
            var currentSequenceLength = lzwState.currentSequenceLength;

            var decodedLength = 0;
            var currentBufferLength = this.bufferLength;
            var buffer = this.ensureBuffer(this.bufferLength + estimatedDecodedSize);

            for (i = 0; i < blockSize; i++) {
                var code = this.readBits(codeLength);
                var hasPrev = currentSequenceLength > 0;
                if (code < 256) {
                    currentSequence[0] = code;
                    currentSequenceLength = 1;
                } else if (code >= 258) {
                    if (code < nextCode) {
                        currentSequenceLength = dictionaryLengths[code];
                        for (j = currentSequenceLength - 1, q = code; j >= 0; j--) {
                            currentSequence[j] = dictionaryValues[q];
                            q = dictionaryPrevCodes[q];
                        }
                    } else {
                        currentSequence[currentSequenceLength++] = currentSequence[0];
                    }
                } else if (code == 256) {
                    codeLength = 9;
                    nextCode = 258;
                    currentSequenceLength = 0;
                    continue;
                } else {
                    this.eof = true;
                    delete this.lzwState;
                    break;
                }

                if (hasPrev) {
                    dictionaryPrevCodes[nextCode] = prevCode;
                    dictionaryLengths[nextCode] = dictionaryLengths[prevCode] + 1;
                    dictionaryValues[nextCode] = currentSequence[0];
                    nextCode++;
                    codeLength = (nextCode + earlyChange) & (nextCode + earlyChange - 1) ?
                        codeLength : Math.min(Math.log(nextCode + earlyChange) /
                            0.6931471805599453 + 1, 12) | 0;
                }
                prevCode = code;

                decodedLength += currentSequenceLength;
                if (estimatedDecodedSize < decodedLength) {
                    do {
                        estimatedDecodedSize += decodedSizeDelta;
                    } while (estimatedDecodedSize < decodedLength);
                    buffer = this.ensureBuffer(this.bufferLength + estimatedDecodedSize);
                }
                for (j = 0; j < currentSequenceLength; j++)
                    buffer[currentBufferLength++] = currentSequence[j];
            }
            lzwState.nextCode = nextCode;
            lzwState.codeLength = codeLength;
            lzwState.prevCode = prevCode;
            lzwState.currentSequenceLength = currentSequenceLength;

            this.bufferLength = currentBufferLength;
        }
    });

    return streams.LZWStream = LZWStream;
});


define('skylark-io-streams/PredictorStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var PredictorStream = DecodeStream.inherit({
        klassName : "PredictorStream",

        init : function(stream, params) {
            var predictor = this.predictor = params.get('Predictor') || 1;

            if (predictor <= 1)
                return stream; // no prediction
            if (predictor !== 2 && (predictor < 10 || predictor > 15))
                error('Unsupported predictor: ' + predictor);

            if (predictor === 2)
                this.readBlock = this.readBlockTiff;
            else
                this.readBlock = this.readBlockPng;

            this.stream = stream;
            this.dict = stream.dict;

            var colors = this.colors = params.get('Colors') || 1;
            var bits = this.bits = params.get('BitsPerComponent') || 8;
            var columns = this.columns = params.get('Columns') || 1;

            this.pixBytes = (colors * bits + 7) >> 3;
            this.rowBytes = (columns * colors * bits + 7) >> 3;
            DecodeStream.prototype.init.call(this);          
        },

        readBlockTiff : function () {
                var rowBytes = this.rowBytes;

                var bufferLength = this.bufferLength;
                var buffer = this.ensureBuffer(bufferLength + rowBytes);

                var bits = this.bits;
                var colors = this.colors;

                var rawBytes = this.stream.getBytes(rowBytes);

                var inbuf = 0,
                    outbuf = 0;
                var inbits = 0,
                    outbits = 0;
                var pos = bufferLength;

                if (bits === 1) {
                    for (var i = 0; i < rowBytes; ++i) {
                        var c = rawBytes[i];
                        inbuf = (inbuf << 8) | c;
                        // bitwise addition is exclusive or
                        // first shift inbuf and then add
                        buffer[pos++] = (c ^ (inbuf >> colors)) & 0xFF;
                        // truncate inbuf (assumes colors < 16)
                        inbuf &= 0xFFFF;
                    }
                } else if (bits === 8) {
                    for (var i = 0; i < colors; ++i)
                        buffer[pos++] = rawBytes[i];
                    for (; i < rowBytes; ++i) {
                        buffer[pos] = buffer[pos - colors] + rawBytes[i];
                        pos++;
                    }
                } else {
                    var compArray = new Uint8Array(colors + 1);
                    var bitMask = (1 << bits) - 1;
                    var j = 0,
                        k = bufferLength;
                    var columns = this.columns;
                    for (var i = 0; i < columns; ++i) {
                        for (var kk = 0; kk < colors; ++kk) {
                            if (inbits < bits) {
                                inbuf = (inbuf << 8) | (rawBytes[j++] & 0xFF);
                                inbits += 8;
                            }
                            compArray[kk] = (compArray[kk] +
                                (inbuf >> (inbits - bits))) & bitMask;
                            inbits -= bits;
                            outbuf = (outbuf << bits) | compArray[kk];
                            outbits += bits;
                            if (outbits >= 8) {
                                buffer[k++] = (outbuf >> (outbits - 8)) & 0xFF;
                                outbits -= 8;
                            }
                        }
                    }
                    if (outbits > 0) {
                        buffer[k++] = (outbuf << (8 - outbits)) +
                            (inbuf & ((1 << (8 - outbits)) - 1));
                    }
                }
                this.bufferLength += rowBytes;
        },

        readBlockPng : function() {

                var rowBytes = this.rowBytes;
                var pixBytes = this.pixBytes;

                var predictor = this.stream.getByte();
                var rawBytes = this.stream.getBytes(rowBytes);

                var bufferLength = this.bufferLength;
                var buffer = this.ensureBuffer(bufferLength + rowBytes);

                var prevRow = buffer.subarray(bufferLength - rowBytes, bufferLength);
                if (prevRow.length == 0)
                    prevRow = new Uint8Array(rowBytes);

                var j = bufferLength;
                switch (predictor) {
                    case 0:
                        for (var i = 0; i < rowBytes; ++i)
                            buffer[j++] = rawBytes[i];
                        break;
                    case 1:
                        for (var i = 0; i < pixBytes; ++i)
                            buffer[j++] = rawBytes[i];
                        for (; i < rowBytes; ++i) {
                            buffer[j] = (buffer[j - pixBytes] + rawBytes[i]) & 0xFF;
                            j++;
                        }
                        break;
                    case 2:
                        for (var i = 0; i < rowBytes; ++i)
                            buffer[j++] = (prevRow[i] + rawBytes[i]) & 0xFF;
                        break;
                    case 3:
                        for (var i = 0; i < pixBytes; ++i)
                            buffer[j++] = (prevRow[i] >> 1) + rawBytes[i];
                        for (; i < rowBytes; ++i) {
                            buffer[j] = (((prevRow[i] + buffer[j - pixBytes]) >> 1) +
                                rawBytes[i]) & 0xFF;
                            j++;
                        }
                        break;
                    case 4:
                        // we need to save the up left pixels values. the simplest way
                        // is to create a new buffer
                        for (var i = 0; i < pixBytes; ++i) {
                            var up = prevRow[i];
                            var c = rawBytes[i];
                            buffer[j++] = up + c;
                        }
                        for (; i < rowBytes; ++i) {
                            var up = prevRow[i];
                            var upLeft = prevRow[i - pixBytes];
                            var left = buffer[j - pixBytes];
                            var p = left + up - upLeft;

                            var pa = p - left;
                            if (pa < 0)
                                pa = -pa;
                            var pb = p - up;
                            if (pb < 0)
                                pb = -pb;
                            var pc = p - upLeft;
                            if (pc < 0)
                                pc = -pc;

                            var c = rawBytes[i];
                            if (pa <= pb && pa <= pc)
                                buffer[j++] = left + c;
                            else if (pb <= pc)
                                buffer[j++] = up + c;
                            else
                                buffer[j++] = upLeft + c;
                        }
                        break;
                    default:
                        error('Unsupported predictor: ' + predictor);
                }
                this.bufferLength += rowBytes;
        }
    });

    return streams.PredictorStream = PredictorStream;
});


define('skylark-io-streams/StreamsSequenceStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./DecodeStream"
], function(skylark, langx, streams, DecodeStream) {

    var StreamsSequenceStream = DecodeStream.inherit({
        klassName : "StreamsSequenceStream",

        init : function(streams) {
            this.dict = stream.dict;
            DecodeStream.prototype.init.call(this);          
        },

        readBlock : function() {
            var streams = this.streams;
            if (streams.length == 0) {
                this.eof = true;
                return;
            }
            var stream = streams.shift();
            var chunk = stream.getBytes();
            var bufferLength = this.bufferLength;
            var newLength = bufferLength + chunk.length;
            var buffer = this.ensureBuffer(newLength);
            buffer.set(chunk, bufferLength);
            this.bufferLength = newLength;
        }
    });

    return streams.StreamsSequenceStream = StreamsSequenceStream;
});

define('skylark-io-streams/StringStream',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./streams",
    "./Stream"
], function(skylark, langx, streams, Stream) {

    var StringStream = Stream.inherit({
        klassName : "StringStream",

        init : function(str) {
            var length = str.length;
            var bytes = new Uint8Array(length);
            for (var n = 0; n < length; ++n)
                bytes[n] = str.charCodeAt(n);
            DecodeStream.prototype.init.call(this);          
        }
    });


    return streams.StringStream = StringStream;

});

define('skylark-io-streams/main',[
    "./streams",
    "./Ascii85Stream",
    "./AsciiHexStream",
    "./ChunkedStream",
    "./DecodeStream",
    "./DecryptStream",
    "./FakeStream",
    "./FlateStream",
    "./LZWStream",
    "./PredictorStream",
    "./Stream",
    "./StreamsSequenceStream",
    "./StringStream"
], function(streams) {

	return streams;
});
define('skylark-io-streams', ['skylark-io-streams/main'], function (main) { return main; });

define('skylark-slax-runtime/main',[
	"./slax",
	"./cache",
	"skylark-langx",
	"skylark-domx",
	"skylark-domx-files",
	"skylark-domx-images",
	"skylark-domx-colorpicker",
	"skylark-domx-gradienter",
	"skylark-jquery",
	"skylark-ajaxfy-spa",
	"skylark-data-entities",
	"skylark-io-streams"
],function(slax){
	return slax;
});
define('skylark-slax-runtime', ['skylark-slax-runtime/main'], function (main) { return main; });


},this);