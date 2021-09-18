/**
 * skylark-domx-plugins-panels - The skylark panel plugins library for dom api extension
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-domx-plugins-panels/
 * @license MIT
 */
define(["skylark-langx/langx","skylark-domx-browser","skylark-domx-eventer","skylark-domx-noder","skylark-domx-geom","skylark-domx-query","skylark-domx-plugins-base","skylark-domx-plugins-interact/resizable","./panels"],function(s,t,e,i,o,r,l,a,n){var b=l.Plugin.inherit({klassName:"Panel",pluginName:"lark.panels.panel",options:{},_construct:function(s,t){this.overrided(s,t),this._velm=this.elmx(),this.options.resizable&&(this._resizable=new a(s,{handle:{border:{directions:{top:!0,left:!0,right:!0,bottom:!0,topLeft:!0,topRight:!0,bottomLeft:!0,bottomRight:!0},classes:{all:this.options.resizable.border.classes.all,top:this.options.resizable.border.classes.top,left:this.options.resizable.border.classes.left,right:this.options.resizable.border.classes.right,bottom:this.options.resizable.border.classes.bottom,topLeft:this.options.resizable.border.classes.topLeft,topRight:this.options.resizable.border.classes.topRight,bottomLeft:this.options.resizable.border.classes.bottomLeft,bottomRight:this.options.resizable.border.classes.bottomRight}}},constraints:{minWidth:this.options.resizable.minWidth,minHeight:this.options.resizable.minHeight},started:()=>{this.isResizing=!0},moving:function(s){},stopped:()=>{this.isResizing=!1}}))}});return l.register(b),b});
//# sourceMappingURL=sourcemaps/panel.js.map
