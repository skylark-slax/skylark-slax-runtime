/**
 * skylark-domx-plugins-panels - The skylark panel plugins library for dom api extension
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-domx-plugins-panels/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-query","skylark-domx-plugins-base","./panels","./panel"],function(t,o,r,e,s){var i=s.inherit({klassName:"Toolbar",pluginName:"lark.panels.toolbar",options:{toolbarFloat:!0,toolbarHidden:!1,toolbarFloatOffset:0,template:'<div class="domx-toolbar"><ul></ul></div>',separator:{template:'<li><span class="separator"></span></li>'}},_construct:function(t,r){var e,i;s.prototype._construct.call(this,t,r),this.opts=this.options,this.wrapper=o(this._elm),this.list=this.wrapper.find("ul"),this.list.on("click",function(t){return!1}),this.wrapper.on("mousedown",(i=this,function(t){return i.list.find(".menu-on").removeClass(".menu-on")})),o(document).on("mousedown.toolbar",function(t){return function(o){return t.list.find(".menu-on").removeClass("menu-on")}}(this)),!this.opts.toolbarHidden&&this.opts.toolbarFloat&&(this.wrapper.css("top",this.opts.toolbarFloatOffset),e=0,function(t){return function(){return t.wrapper.css("position","static"),t.wrapper.width("auto"),t.editor.editable.util.reflow(t.wrapper),t.wrapper.width(t.wrapper.outerWidth()),t.wrapper.css("left",t.editor.editable.util.os.mobile?t.wrapper.position().left:t.wrapper.offset().left),t.wrapper.css("position",""),e=t.wrapper.outerHeight(),t.editor.placeholderEl.css("top",e),!0}}(this))},addToolItem:function(t){return o(t._elm).appendTo(this.list),this},addSeparator:function(){return o(this.options.separator.template).appendTo(this.list),this}});return r.register(i),e.Toolbar=i});
//# sourceMappingURL=sourcemaps/toolbar.js.map
