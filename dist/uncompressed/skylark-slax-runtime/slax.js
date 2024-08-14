define([
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