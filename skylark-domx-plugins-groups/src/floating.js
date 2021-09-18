define([
    "skylark-domx/noder",
    "skylark-domx/eventer",
    "skylark-domx/query",
    "skylark-domx-plugins-base",
    "skylark-domx-plugins-interact/movable",
    "./panels",
    "./panel"
], function (noder,eventer,$,plugins,Movable, panels,Panel) {
    'use strict';

    var floatings = [];

    var Floating = Panel.inherit({
        klassName : "Floating",

        pluginName : "lark.panels.floating",

        options : {
            selectors : {
                headerPane  : "",
                contentPane : "",
                footerPane  : "",
                titlebar : "",
                buttons : {
                    "fullscreen" : ".button-fullscreen",
                    "maximize" : ".button-maximize",
                    "minimize" : ".button-minimize",     
                    "close" : ".button-close"
                }
            },

            classes : {
                "maximize" : "maximize"
            },

            fixedContent: true,
            initMaximized: false,

            movable : {
                dragHandle: false,
                dragCancel: null
            }
        },

        _construct : function(elm,options) {
            Panel.prototype._construct.call(this,elm,options);
            this.$pane = $(this._elm);

            this.isOpened = false;
            this.isMaximized = false;

            if (this.options.movable) {
                this._movable = new Movable(elm,{
                    handle : this.options.movable.dragHandle,
                    starting : (e) => {
                        const   dragCancel = this.options.movable.dragCancel, 
                                elemCancel = $(e.target).closest(dragCancel);
                        if (elemCancel.length) {
                            return false;
                        }
                        if (this.isResizing || this.isMaximized) {
                            return false;
                        }

                        return true;
                    }
                });

            }

            this.$close = this._velm.$(this.options.selectors.buttons.close);
            this.$maximize = this._velm.$(this.options.selectors.buttons.maximize);
            this.$minimize = this._velm.$(this.options.selectors.buttons.minimize);
            this.$fullscreen = this._velm.$(this.options.selectors.buttons.fullscreen);


            this.$close.off("click.window").on("click.window", e => {
                this.close();
            });
            this.$fullscreen.off("click.window").on("click.window", () => {
                this.fullscreen();
            });
            this.$maximize.off("click.window").on("click.window", () => {
                this.maximize();
            });
            this.$pane.off("keydown.window").on("keydown.window", e => {
                this._keydown(e);
            });

            floatings.push(this);
        },
        close: function() {
            this.trigger('closing', this);
            this.$pane.remove();
            this.isOpened = false;
            this.isMaximized = false;

            ///if (!$(Constants.CLASS_NS + '-modal').length) {
            ///    if (this.options.fixedContent) {
            ///        $('html').css({
            ///            overflow: '',
            ///            'padding-right': ''
            ///        });
            ///    }
                ///if (this.options.multiInstances) {
                ///    zIndex = this.options.zIndex;
                ///}
            ///    eventer.off(window,"resize.window");
            var idx = floatings.indexOf(this);
            if (idx>-1) {
                floatings.splice(idx,1);
            }
            this.trigger('closed', this);
        },

        maximize: function() {
            this.$pane.get(0).focus();
            if (!this.isMaximized) {
                this.modalData = {
                    width: this.$pane.width(),
                    height: this.$pane.height(),
                    left: this.$pane.offset().left,
                    top: this.$pane.offset().top
                };
                this.$pane.addClass(this.options.classes.maximize);
                this.$pane.css({
                    width: '100%',
                    height: '100%',
                    left: 0,
                    top: 0
                });
                this.isMaximized = true;
            } else {
                let $W = $(window),$D = $(document);
                this.$pane.removeClass(this.options.classes.maximize);
                const initModalLeft = ($W.width() - this.options.modalWidth) / 2 + $D.scrollLeft();
                const initModalTop = ($W.height() - this.options.modalHeight) / 2 + $D.scrollTop();
                this.$pane.css({
                    width: this.modalData.width ? this.modalData.width : this.options.modalWidth,
                    height: this.modalData.height ? this.modalData.height : this.options.modalHeight,
                    left: this.modalData.left ? this.modalData.left : initModalLeft,
                    top: this.modalData.top ? this.modalData.top : initModalTop
                });
                this.isMaximized = false;
            }

            eventer.resized(this._elm);
        },
        fullscreen: function() {
            this.$pane.get(0).focus();
            noder.fullscreen(this.$pane[0]);
        },
        _keydown: function(e) {
            if (!this.options.keyboard) {
                return false;
            }
            const keyCode = e.keyCode || e.which || e.charCode;
            const ctrlKey = e.ctrlKey || e.metaKey;
            const altKey = e.altKey || e.metaKey;
            switch (keyCode) {

                // Q
                case 81:
                    this.close();
                    break;
                default:
            }
        }

    });

    eventer.on(window,"resize.window", ()=>{
        for (let i=0; i<floatings.length; i++ ) {
            eventer.resized(floatings[i]._elm);
        }
    });

    return panels.Floating = Floating;
});