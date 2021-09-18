/**
 * skylark-slax-runtime - The skylark shells widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-slax/skylark-slax-runtime/
 * @license MIT
 */
!function(factory,globals){var define=globals.define,require=globals.require,isAmd="function"==typeof define&&define.amd,isCmd=!isAmd&&"undefined"!=typeof exports;if(!isAmd&&!define){var map={};define=globals.define=function(s,r,e){"function"==typeof e?(map[s]={factory:e,deps:r.map(function(r){return function(s,r){if("."!==s[0])return s;var e=r.split("/"),a=s.split("/");e.pop();for(var n=0;n<a.length;n++)"."!=a[n]&&(".."==a[n]?e.pop():e.push(a[n]));return e.join("/")}(r,s)}),resolved:!1,exports:null},require(s)):map[s]={factory:null,resolved:!0,exports:e}},require=globals.require=function(s){if(!map.hasOwnProperty(s))throw new Error("Module "+s+" has not been defined");var module=map[s];if(!module.resolved){var r=[];module.deps.forEach(function(s){r.push(require(s))}),module.exports=module.factory.apply(globals,r)||null,module.resolved=!0}return module.exports}}if(!define)throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");if(function(define,require){define("skylark-slax-runtime/slax",["skylark-langx-ns","skylark-langx-objects","skylark-langx-hoster","skylark-langx-async","skylark-net-http/Xhr","skylark-domx-eventer"],function(skylark,objects,hoster,async,Xhr,eventer){var _config={},_rootUrl="",_baseUrl="",slax={prepare:function(config){var p,slaxRoot,slaxApp;if(config||(config=hoster.global.slaxConfig),!config)for(var scripts=document.getElementsByTagName("script"),i=0,script,slaxDir,src,match;i<scripts.length;)if(script=scripts[i++],(src=script.getAttribute("src"))&&(match=src.match(/(((.*)\/)|^)skylark-slax-runtime([0-9A-Za-z\-]*)\.js(\W|$)/i))){slaxDir=match[3]||"",(src=script.getAttribute("data-slax-config"))?config=eval("({ "+src+" })"):(slaxRoot=script.getAttribute("data-slax-root"),void 0==slaxRoot&&(slaxRoot=slaxDir),slaxApp=script.getAttribute("data-slax-app"));break}if(config)objects.mixin(_config,config),p=async.Deferred.resolve();else{var d=new async.Deferred,p=d.promise;Xhr.get(slaxRoot+"/slax-config.json").then(function(s){if(slaxApp){for(var r,e=0;e<s.apps.length;e++)s.apps[e].name==slaxApp&&(r=slaxRoot+s.apps[e].dir);Xhr.get(r+"/spa.json").then(function(s){objects.mixin(_config,s),d.resolve()})}else objects.mixin(_config,s),d.resolve()})}return p},start:function(){var s=_config;if(s.runtime&&require.config(s.runtime),s.boot){let r=window[s.boot];r(s)}else{var r=function(r,e){var a=r(e=e||s);hoster.global.go=function(s,r){a.go(s,r)},a.prepare().then(function(){a.run()})};s.spaModule?require([s.spaModule],function(s){s._start?s._start().then(function(e){r(s,e)}):r(s)}):r(skylark.spa)}}};return define("slax",[],function(){return slax}),skylark.attach("slax",slax)}),define("skylark-slax-runtime/caches",["./slax","skylark-io-caches"],function(s,r){return s.caches=r}),define("skylark-slax-runtime/skylark",["./slax","skylark-langx-ns","skylark-langx","skylark-langx-logging","skylark-domx","skylark-domx-files","skylark-domx-images","skylark-domx-i18n","skylark-domx-plugins-base","skylark-domx-plugins-colors","skylark-domx-plugins-groups","skylark-domx-plugins-pictures","skylark-domx-plugins-players","skylark-domx-plugins-panels","skylark-domx-plugins-embeds","skylark-domx-plugins-sandboxs","skylark-domx-plugins-menus","skylark-domx-plugins-popups","skylark-domx-plugins-uploads","skylark-devices-keyboard","skylark-devices-orientation","skylark-devices-points","skylark-devices-webgl","skylark-io-mimes","skylark-io-caches","skylark-io-diskfs","skylark-io-streams","skylark-net-http","skylark-appify-routers","skylark-appify-spa","skylark-data-entities","skylark-jquery"],function(s,r){return s.skylark=r}),define("skylark-slax-runtime/main",["./slax","./caches","./skylark"],function(s){return s}),define("skylark-slax-runtime",["skylark-slax-runtime/main"],function(s){return s})}(define,require),!isAmd){var skylarkjs=require("skylark-langx-ns");isCmd?module.exports=skylarkjs:globals.skylarkjs=skylarkjs}}(0,this);
//# sourceMappingURL=sourcemaps/skylark-slax-runtime.js.map
