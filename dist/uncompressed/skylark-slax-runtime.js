/**
 * skylark-slax-runtime - The skylark shells widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-slax/skylark-slax-runtime/
 * @license MIT
 */
(function(factory,globals,define,require) {
  var isAmd = (typeof define === 'function' && define.amd),
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
    _baseUrl = "";  //the base url of slax page



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
                            slaxApp = script.getAttribute("data-slax-page") || script.getAttribute("data-slax-app");
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
                var initPage = function(spa, _cfg) {
                    _cfg = _cfg || cfg;
      
                    var page = slax.page = spa(_cfg);

                    hoster.global.go =  function(path, force) {
                        page.go(path, force);
                    };

                    page.prepare().then(function(){
                        page.run();
                    });
                };
                if(cfg.spaModule) {
                    require([cfg.spaModule], function(spa) {
                        if(spa._start) {
                            spa._start().then(function(_cfg){
                                initPage(spa, _cfg);
                            });
                        } else {
                            initPage(spa);
                        }
                    });
                } else {
                    initPage(skylark.spa);
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
define('skylark-io-diskfs/download',[
    "skylark-langx/types",
    "./diskfs"
],function(types,diskfs){

    function downloadFile(data, name) {
        if (window.navigator.msSaveBlob) {
            if (types.isString(data)) {
                data = dataURItoBlob(data);
            }
            window.navigator.msSaveBlob(data, name);
        } else {
            var a = document.createElement('a');
            if (data instanceof Blob) {
                data = URL.createObjectURL(data);
            }
            a.href = data;
            a.setAttribute('download', name || 'noname');
            //a.dispatchEvent(new CustomEvent('click'));
            a.click();
        }
    }

    return diskfs.downlad = downloadFile;

});

define('skylark-io-diskfs/read',[
    "skylark-langx-async/deferred",
    "./diskfs"
],function(Deferred, diskfs){

    function readFile(file, params) {
        params = params || {};
        var d = new Deferred,
            reader = new FileReader();

        reader.onload = function(evt) {
            d.resolve(evt.target.result);
        };
        reader.onerror = function(e) {
            var code = e.target.error.code;
            if (code === 2) {
                alert('please don\'t open this page using protocol fill:///');
            } else {
                alert('error code: ' + code);
            }
        };

        if (params.asArrayBuffer) {
            reader.readAsArrayBuffer(file);
        } else if (params.asDataUrl) {
            reader.readAsDataURL(file);
        } else if (params.asText) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }

        return d.promise;
    }

    return diskfs.read = diskfs.readFile = readFile;
    
});

define('skylark-io-diskfs/read-image',[
    "skylark-langx-async/deferred",
    "./diskfs",
    "./read"
],function(Deferred, diskfs,read){

	function readImage(fileObj) {
        var d = new Deferred,
	    	img = new Image();

	    img.onload = function() {
	      d.resolve(img);
	    };
	    img.onerror = function(e) {
	      d.reject(e);
	    };

	    read(fileObj,{
	    	asDataUrl : true
	    }).then(function(dataUrl){
	        img.src = dataUrl;
	    }).catch(function(e){
	    	d.reject(e);
	    });

	    return d.promise;
	}

	return diskfs.readImage = readImage;

});
define('skylark-io-diskfs/main',[
	"./diskfs",
	"./download",
	"./read",
	"./read-image",
	"./select",
	"./webentry"
],function(diskfs){
	return diskfs;
});
define('skylark-io-diskfs', ['skylark-io-diskfs/main'], function (main) { return main; });

define('skylark-slax-runtime/skylark',[
	"./slax",
	"skylark-langx-ns",
	"skylark-langx",
	"skylark-langx-logging",
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
	"skylark-domx-plugins-uploads",
	"skylark-devices-keyboard",	
	"skylark-devices-orientation",	
	"skylark-devices-points",	
	"skylark-devices-webgl",
	"skylark-io-mimes",
	"skylark-io-caches",
	"skylark-io-diskfs",
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


},this,define,require);
//# sourceMappingURL=sourcemaps/skylark-slax-runtime.js.map
