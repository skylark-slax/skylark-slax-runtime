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

define("skylark-slax-runtime/slax",["skylark-langx-ns","skylark-langx-objects","skylark-langx-hoster","skylark-langx-async","skylark-net-http/Xhr","skylark-domx-eventer"],function(skylark,objects,hoster,async,Xhr,eventer){var _config={},_rootUrl="",_baseUrl="",slax={prepare:function(config){var p,slaxRoot,slaxApp,d,p;if(config=config||hoster.global.slaxConfig,!config)for(var scripts=document.getElementsByTagName("script"),i=0,script,slaxDir,src,match;i<scripts.length;)if(script=scripts[i++],(src=script.getAttribute("src"))&&(match=src.match(/(((.*)\/)|^)skylark-slax-runtime([0-9A-Za-z\-]*)\.js(\W|$)/i))){slaxDir=match[3]||"",(src=script.getAttribute("data-slax-config"))?config=eval("({ "+src+" })"):(slaxRoot=script.getAttribute("data-slax-root"),null==slaxRoot&&(slaxRoot=slaxDir),slaxApp=script.getAttribute("data-slax-page")||script.getAttribute("data-slax-app"));break}return config?(objects.mixin(_config,config),p=async.Deferred.resolve()):(d=new async.Deferred,p=d.promise,Xhr.get(slaxRoot+"/slax-config.json").then(function(r){if(slaxApp){for(var s,a=0;a<r.apps.length;a++)r.apps[a].name==slaxApp&&(s=slaxRoot+r.apps[a].dir);Xhr.get(s+"/spa.json").then(function(r){objects.mixin(_config,r),d.resolve()})}else objects.mixin(_config,r),d.resolve()})),p},start:function(){var a,e=_config;e.runtime&&require.config(e.runtime),e.boot?(0,window[e.boot])(e):(a=function(r,s){var a=slax.page=r(s=s||e);hoster.global.go=function(r,s){a.go(r,s)},a.prepare().then(function(){a.run()})},e.spaModule?require([e.spaModule],function(s){s._start?s._start().then(function(r){a(s,r)}):a(s)}):a(skylark.spa))}};return define("slax",[],function(){return slax}),skylark.attach("slax",slax)}),define("skylark-slax-runtime/caches",["./slax","skylark-io-caches"],function(r,s){return r.caches=s}),define("skylark-io-diskfs/download",["skylark-langx/types","./diskfs"],function(e,r){return r.downlad=function(r,s){var a;window.navigator.msSaveBlob?(e.isString(r)&&(r=dataURItoBlob(r)),window.navigator.msSaveBlob(r,s)):(a=document.createElement("a"),r instanceof Blob&&(r=URL.createObjectURL(r)),a.href=r,a.setAttribute("download",s||"noname"),a.click())}}),define("skylark-io-diskfs/read",["skylark-langx-async/deferred","./diskfs"],function(n,r){return r.read=r.readFile=function(r,s){s=s||{};var a=new n,e=new FileReader;return e.onload=function(r){a.resolve(r.target.result)},e.onerror=function(r){r=r.target.error.code;2===r?alert("please don't open this page using protocol fill:///"):alert("error code: "+r)},s.asArrayBuffer?e.readAsArrayBuffer(r):s.asDataUrl?e.readAsDataURL(r):s.asText?e.readAsText(r):e.readAsArrayBuffer(r),a.promise}}),define("skylark-io-diskfs/read-image",["skylark-langx-async/deferred","./diskfs","./read"],function(e,r,n){return r.readImage=function(r){var s=new e,a=new Image;return a.onload=function(){s.resolve(a)},a.onerror=function(r){s.reject(r)},n(r,{asDataUrl:!0}).then(function(r){a.src=r}).catch(function(r){s.reject(r)}),s.promise}}),define("skylark-io-diskfs/main",["./diskfs","./download","./read","./read-image","./select","./webentry"],function(r){return r}),define("skylark-io-diskfs",["skylark-io-diskfs/main"],function(r){return r}),define("skylark-slax-runtime/skylark",["./slax","skylark-langx-ns","skylark-langx","skylark-langx-logging","skylark-domx","skylark-domx-files","skylark-domx-images","skylark-domx-i18n","skylark-domx-plugins-base","skylark-domx-plugins-colors","skylark-domx-plugins-groups","skylark-domx-plugins-pictures","skylark-domx-plugins-players","skylark-domx-plugins-panels","skylark-domx-plugins-embeds","skylark-domx-plugins-sandboxs","skylark-domx-plugins-menus","skylark-domx-plugins-popups","skylark-domx-plugins-uploads","skylark-devices-keyboard","skylark-devices-orientation","skylark-devices-points","skylark-devices-webgl","skylark-io-mimes","skylark-io-caches","skylark-io-diskfs","skylark-io-streams","skylark-net-http","skylark-appify-routers","skylark-appify-spa","skylark-data-entities","skylark-jquery"],function(r,s){return r.skylark=s}),define("skylark-slax-runtime/main",["./slax","./caches","./skylark"],function(r){return r}),define("skylark-slax-runtime",["skylark-slax-runtime/main"],function(r){return r});
},this,define,require);
//# sourceMappingURL=sourcemaps/skylark-slax-runtime.js.map
