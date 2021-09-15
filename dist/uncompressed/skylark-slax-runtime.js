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

            if (cfg.runtime) {
                require.config(cfg.runtime);
            }

            if (cfg.boot) {
                let bootFunc = window[cfg.boot];
                bootFunc(cfg);
            } else {
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
        }
    };

    define("slax",[],function(){
        return slax;
    });

    return skylark.attach("slax",slax);

});
define('skylark-slax-runtime/caches',[
	"./slax",
	"skylark-io-caches"
],function(slax,caches){
	//local
	//page
	//session
	return slax.caches = caches;
});
define('skylark-slax-runtime/skylark',[
	"./slax",
	"skylark-langx",
	"skylark-domx",
	"skylark-domx-files",
	"skylark-domx-images",
	"skylark-domx-i18n",
	"skylark-domx-plugins-base",
	"skylark-domx-plugins-colors",
	"skylark-domx-plugins-groups",
	"skylark-domx-plugins-pictures",
	"skylark-domx-plugins-players",
	"skylark-domx-plugins-panels",
	"skylark-domx-plugins-embeds",
	"skylark-domx-plugins-sandboxs",
	"skylark-domx-plugins-menus",	
	"skylark-domx-plugins-popups",	
	"skylark-devices-keyboard",	
	"skylark-devices-orientation",	
	"skylark-devices-points",	
	"skylark-devices-webgl",
	"skylark-io-mimes",
	"skylark-io-caches",
	"skylark-io-streams",
	"skylark-net-http",
	"skylark-appify-routers",
	"skylark-appify-spa",
	"skylark-data-entities",
	"skylark-jquery"
	
],function(slax,skylark){
	return slax.skylark = skylark;
});
define('skylark-slax-runtime/main',[
	"./slax",
	"./caches",
	"./skylark"
],function(slax){
	return slax;
});
define('skylark-slax-runtime', ['skylark-slax-runtime/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-slax-runtime.js.map
