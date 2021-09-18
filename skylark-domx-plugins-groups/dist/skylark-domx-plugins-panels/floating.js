/**
 * skylark-domx-plugins-panels - The skylark panel plugins library for dom api extension
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-domx-plugins-panels/
 * @license MIT
 */
define(["skylark-domx/noder","skylark-domx/eventer","skylark-domx/query","skylark-domx-plugins-base","skylark-domx-plugins-interact/movable","./panels","./panel"],function(i,t,e,s,o,n,a){"use strict";var l=[],h=a.inherit({klassName:"Floating",pluginName:"lark.panels.floating",options:{selectors:{headerPane:"",contentPane:"",footerPane:"",titlebar:"",buttons:{fullscreen:".button-fullscreen",maximize:".button-maximize",minimize:".button-minimize",close:".button-close"}},classes:{maximize:"maximize"},fixedContent:!0,initMaximized:!1,movable:{dragHandle:!1,dragCancel:null}},_construct:function(i,t){a.prototype._construct.call(this,i,t),this.$pane=e(this._elm),this.isOpened=!1,this.isMaximized=!1,this.options.movable&&(this._movable=new o(i,{handle:this.options.movable.dragHandle,starting:i=>{const t=this.options.movable.dragCancel;return!e(i.target).closest(t).length&&(!this.isResizing&&!this.isMaximized)}})),this.$close=this._velm.$(this.options.selectors.buttons.close),this.$maximize=this._velm.$(this.options.selectors.buttons.maximize),this.$minimize=this._velm.$(this.options.selectors.buttons.minimize),this.$fullscreen=this._velm.$(this.options.selectors.buttons.fullscreen),this.$close.off("click.window").on("click.window",i=>{this.close()}),this.$fullscreen.off("click.window").on("click.window",()=>{this.fullscreen()}),this.$maximize.off("click.window").on("click.window",()=>{this.maximize()}),this.$pane.off("keydown.window").on("keydown.window",i=>{this._keydown(i)}),l.push(this)},close:function(){this.trigger("closing",this),this.$pane.remove(),this.isOpened=!1,this.isMaximized=!1;var i=l.indexOf(this);i>-1&&l.splice(i,1),this.trigger("closed",this)},maximize:function(){if(this.$pane.get(0).focus(),this.isMaximized){let i=e(window),t=e(document);this.$pane.removeClass(this.options.classes.maximize);const s=(i.width()-this.options.modalWidth)/2+t.scrollLeft(),o=(i.height()-this.options.modalHeight)/2+t.scrollTop();this.$pane.css({width:this.modalData.width?this.modalData.width:this.options.modalWidth,height:this.modalData.height?this.modalData.height:this.options.modalHeight,left:this.modalData.left?this.modalData.left:s,top:this.modalData.top?this.modalData.top:o}),this.isMaximized=!1}else this.modalData={width:this.$pane.width(),height:this.$pane.height(),left:this.$pane.offset().left,top:this.$pane.offset().top},this.$pane.addClass(this.options.classes.maximize),this.$pane.css({width:"100%",height:"100%",left:0,top:0}),this.isMaximized=!0;t.resized(this._elm)},fullscreen:function(){this.$pane.get(0).focus(),i.fullscreen(this.$pane[0])},_keydown:function(i){if(!this.options.keyboard)return!1;const t=i.keyCode||i.which||i.charCode;i.ctrlKey||i.metaKey,i.altKey||i.metaKey;switch(t){case 81:this.close()}}});return t.on(window,"resize.window",()=>{for(let i=0;i<l.length;i++)t.resized(l[i]._elm)}),n.Floating=h});
//# sourceMappingURL=sourcemaps/floating.js.map
