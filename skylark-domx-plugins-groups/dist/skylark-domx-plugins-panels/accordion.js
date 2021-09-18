/**
 * skylark-domx-plugins-panels - The skylark panel plugins library for dom api extension
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-domx-plugins-panels/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-velm","skylark-domx-plugins-base","./panels","./panel","./collapsible"],function(n,e,o,i,t,l,a){var s=l.inherit({klassName:"Accordion",pluginName:"lark.panels.accordion",options:{panel:{selector:"> .panel",template:null}},_construct:function(n,e){l.prototype._construct.call(this,n,e);var o=[];this._velm.$(this.options.panel.selector).forEach(n=>{var e=new s.Pane(n,{group:this});o.push(e)}),this._panels=o},panels:{get:function(){}},addPanel:function(){},remove:function(){},expand:function(){},expandAll:function(){},collapse:function(){},collapseAll:function(){}});return s.Pane=a.inherit({klassName:"AccordionPane",expand:function(){this.options.group.active&&this.options.group.active.collapse(),this.overrided(),this.options.group.active=this},collapse:function(){this.overrided(),this.options.group.active=null},toggle:function(){this.overrided()},remove:function(){this.overrided()}}),i.register(s),t.Accordion=s});
//# sourceMappingURL=sourcemaps/accordion.js.map
