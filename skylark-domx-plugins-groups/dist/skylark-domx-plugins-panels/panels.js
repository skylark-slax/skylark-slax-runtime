/**
 * skylark-domx-plugins-panels - The skylark panel plugins library for dom api extension
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-domx-plugins-panels/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-langx/langx","skylark-domx-browser","skylark-domx-eventer","skylark-domx-noder","skylark-domx-geom","skylark-domx-query","skylark-domx-plugins-base/plugins"],function(E,e,r,n,s,t,i,k){var l={},O={BACKSPACE_KEYCODE:8,COMMA_KEYCODE:188,DELETE_KEYCODE:46,DOWN_ARROW_KEYCODE:40,ENTER_KEYCODE:13,TAB_KEYCODE:9,UP_ARROW_KEYCODE:38},a=function(E){return function(e){return e.keyCode===E}},o=a(O.BACKSPACE_KEYCODE),C=a(O.DELETE_KEYCODE),D=a(O.TAB_KEYCODE),K=a(O.UP_ARROW_KEYCODE),_=a(O.DOWN_ARROW_KEYCODE),y=/&[^\s]*;/;return e.mixin(l,{CONST:O,cleanInput:function(E){for(;y.test(E);)E=i("<i>").html(E).text();return i("<i>").text(E).html()},isBackspaceKey:o,isDeleteKey:C,isShiftHeld:function(E){return!0===E.shiftKey},isTabKey:D,isUpArrow:K,isDownArrow:_}),k.panels=l});
//# sourceMappingURL=sourcemaps/panels.js.map
