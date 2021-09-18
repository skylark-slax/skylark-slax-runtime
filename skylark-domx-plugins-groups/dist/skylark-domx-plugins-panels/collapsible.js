/**
 * skylark-domx-plugins-panels - The skylark panel plugins library for dom api extension
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-domx-plugins-panels/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-browser","skylark-domx-eventer","skylark-domx-noder","skylark-domx-geom","skylark-domx-query","skylark-domx-plugins-base","skylark-domx-plugins-toggles/collapse","./panels","./panel"],function(e,l,o,t,s,i,n,a,p,d){var g=d.inherit({klassName:"Collapsible",pluginName:"lark.panels.collapsible",options:{toggler:{selector:'.panel-heading [data-toggle="collapse"]'},body:{selector:".panel-body"}},_construct:function(e,l){d.prototype._construct.call(this,e,l),this._expanded=!1,this.$toggle=this._velm.find(this.options.toggler.selector),this.$body=this._velm.find(this.options.body.selector),this.$toggle.on("click.panel",e=>{this.toggle()})},expand:function(){this.emit("expanding"),this.$body.plugin(a.prototype.pluginName).show(),this._expanded=!0,this.emit("expanded")},collapse:function(){this.emit("collapsing"),this.$body.plugin(a.prototype.pluginName).hide(),this._expanded=!1,this.emit("collapsed")},toggle:function(){this._expanded?this.collapse():this.expand()},full:function(){},unfull:function(){},toogleFull:function(){},close:function(){}});return n.register(g),p.Collapsible=g});
//# sourceMappingURL=sourcemaps/collapsible.js.map
