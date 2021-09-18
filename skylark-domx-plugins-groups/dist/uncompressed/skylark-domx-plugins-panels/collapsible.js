define([
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-noder",
  "skylark-domx-geom",
  "skylark-domx-query",
  "skylark-domx-plugins-base",
  "skylark-domx-plugins-toggles/collapse",
  "./panels",
  "./panel"
],function(langx,browser,eventer,noder,geom,$,plugins,Collapse,panels,Panel){

  var Collapsible = Panel.inherit({
    klassName : "Collapsible",

    pluginName : "lark.panels.collapsible",

    options : {
      toggler : {
        selector : ".panel-heading [data-toggle=\"collapse\"]"
      },

      body : {
        selector : ".panel-body"
      }
    },

    _construct : function(elm,options) {
      Panel.prototype._construct.call(this,elm,options);
      
      this._expanded = false;
      this.$toggle = this._velm.find(this.options.toggler.selector);
      this.$body = this._velm.find(this.options.body.selector);
      this.$toggle.on('click.panel',(e) => {
        this.toggle();
      });

    },

    expand : function() {
      // expand this panel
      this.emit("expanding");
      this.$body.plugin(Collapse.prototype.pluginName).show();
      this._expanded = true;
      this.emit("expanded");
    },

    collapse : function() {
      // collapse this panel
      this.emit("collapsing");
      this.$body.plugin(Collapse.prototype.pluginName).hide();
      this._expanded = false;
      this.emit("collapsed");
    },

    toggle : function() {
      // toggle this panel
      if (this._expanded) {
        this.collapse();
      } else {
        this.expand();
      }
    },

    full : function() {

    },

    unfull : function() {

    },

    toogleFull : function() {

    },
    
    close: function () {
    }


  });

  plugins.register(Collapsible);

  return panels.Collapsible = Collapsible;

});