/**
 * skylark-slax-runtime - The skylark shells widget
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-slax/skylark-slax-runtime/
 * @license MIT
 */
define(["skylark-langx-ns","skylark-langx-objects","skylark-langx-hoster","skylark-langx-async","skylark-langx-xhr","skylark-utils-dom/eventer","skylark-utils-dom/eventer"],function(skylark,objects,hoster,async,Xhr,eventer){var _config={},_rootUrl="",_baseUrl="",slax={prepare:function(config){var p,slaxRoot,slaxApp;if(config||(config=hoster.global.slaxConfig),!config)for(var scripts=document.getElementsByTagName("script"),i=0,script,slaxDir,src,match;i<scripts.length;)if(script=scripts[i++],(src=script.getAttribute("src"))&&(match=src.match(/(((.*)\/)|^)skylark-slax-runtime([0-9A-Za-z\-]*)\.js(\W|$)/i))){slaxDir=match[3]||"",(src=script.getAttribute("data-slax-config"))?config=eval("({ "+src+" })"):(slaxRoot=script.getAttribute("data-slax-root"),void 0==slaxRoot&&(slaxRoot=slaxDir),slaxApp=script.getAttribute("data-slax-app"));break}if(config)objects.mixin(_config,config),p=async.Deferred.resolve();else{var d=new async.Deferred,p=d.promise;Xhr.get(slaxRoot+"/slax-config.json").then(function(s){if(slaxApp){for(var t,r=0;r<s.apps.length;r++)s.apps[r].name==slaxApp&&(t=slaxRoot+s.apps[r].dir);Xhr.get(t+"/spa.json").then(function(s){objects.mixin(_config,s),d.resolve()})}else objects.mixin(_config,s),d.resolve()})}return p},start:function(){var s=_config;require.config(s.runtime);var t=function(t,r){var a=t(r=r||s);hoster.global.go=function(s,t){a.go(s,t)},a.prepare().then(function(){a.run()})};s.spaModule?require([s.spaModule],function(s){s._start?s._start().then(function(r){t(s,r)}):t(s)}):t(skylark.spa)}};return define("slax",[],function(){return slax}),skylark.attach("slax",slax)});
//# sourceMappingURL=sourcemaps/slax.js.map
