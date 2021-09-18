define([
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-query",
    "skylark-domx-plugins-base",
    "skylark-domx-plugins-popups/Dropdown",
    "skylark-domx-plugins-toggles/tab",
    "./panels",
    "./panel"
], function(langx, browser, eventer, noder, geom,  $, plugins,Dropdown, TabButton,panels,Panel) {

    var TabStrip = Panel.inherit({
        klassName : "TabStrip",
        pluginName : "lark.panels.tabstrip",

        options : {
          selectors : {
            header : ".nav-tabs",
            tab : "[data-toggle=\"tab\"]",
            content : ".tab-content",
            tabpane : ".tab-pane"
          },

          droptabs : {
            selectors : {
              dropdown : "li.droptabs",
              dropdownMenu    : "ul.dropdown-menu",
              dropdownTabs    : "li",
              dropdownCaret   : "b.caret",
              visibleTabs     : ">li:not(.dropdown)",
            },
            auto              : true,
            pullDropdownRight : true,


          }
        },

     _construct : function(elm,options) {
        Panel.prototype._construct.call(this,elm,options);

        this.$header = this._velm.$(this.options.selectors.header); 
        this.$tabs = this.$header.find(this.options.selectors.tab);
        this.$content = this._velm.$(this.options.selectors.content);
        this.$tabpanes = this.$content.find(this.options.selectors.tabpane);

        this.$header.find('[data-toggle="dropdown"]').plugin(Dropdown.prototype.pluginName);

        var self = this;
        this.$tabs.each(function(idx,tabEl){
          $(tabEl).plugin(TabButton.prototype.pluginName, {
            target : self.$tabpanes[idx]
          });
        });

      },

      arrange : function () {

        var dropdownTabsSelector = this.options.droptabs.selectors.dropdownTabs,
            visibleTabsSelector = this.options.droptabs.selectors.visibleTabs;

            $container = this.$header;
        var dropdown = $container.find(this.options.droptabs.selectors.dropdown);
        var dropdownMenu = dropdown.find(this.options.droptabs.selectors.dropdownMenu);
        var dropdownLabel = $('>a', dropdown).clone();
        var dropdownCaret = $(this.options.droptabs.selectors.dropdownCaret, dropdown);

        // We only want the default label, strip the caret out
        $(this.options.droptabs.selectors.dropdownCaret, dropdownLabel).remove();

        if (this.options.droptabs.pullDropdownRight) {
          $(dropdown).addClass('pull-right');
        }

        var $dropdownTabs = function () {
          return $(dropdownTabsSelector, dropdownMenu);
        }

        var $visibleTabs = function () {
          return $(visibleTabsSelector, $container);
        }

        function getFirstHiddenElementWidth() {
          var tempElem=$dropdownTabs().first().clone().appendTo($container).css("position","fixed");
          var hiddenElementWidth = $(tempElem).outerWidth();
          $(tempElem).remove();
          return hiddenElementWidth;
        }

        function getHiddenElementWidth(elem) {
          var tempElem=$(elem).clone().appendTo($container).css("position","fixed");
          var hiddenElementWidth = $(tempElem).outerWidth();
          $(tempElem).remove();
          return hiddenElementWidth;
        }

        function getDropdownLabel() {
          var labelText = 'Dropdown';
          if ($(dropdown).hasClass('active')) {
            labelText = $('>li.active>a', dropdownMenu).html();
          } else if (dropdownLabel.html().length > 0) {
            labelText = dropdownLabel.html();
          }

          labelText = $.trim(labelText);

          if (labelText.length > 10) {
            labelText = labelText.substring(0, 10) + '...';
          }

          return labelText;
        }

        function renderDropdownLabel() {
          $('>a', dropdown).html(getDropdownLabel() + ' ' + dropdownCaret.prop('outerHTML'));
        }

        function manageActive(elem) {
          //fixes a bug where Bootstrap can't remove the 'active' class on elements after they've been hidden inside the dropdown
          $('a', $(elem)).on('show.bs.tab', function (e) {
            $(e.relatedTarget).parent().removeClass('active');
          })
          $('a', $(elem)).on('shown.bs.tab', function (e) {
            renderDropdownLabel();
          })

        }

        function checkDropdownSelection() {
          if ($($dropdownTabs()).filter('.active').length > 0) {
            $(dropdown).addClass('active');
          } else {
            $(dropdown).removeClass('active');
          }

          renderDropdownLabel();
        }


        var visibleTabsWidth = function () {
          var visibleTabsWidth = 0;
          $($visibleTabs()).each(function( index ) {
            visibleTabsWidth += parseInt($(this).outerWidth(), 10);
          });
          visibleTabsWidth = visibleTabsWidth + parseInt($(dropdown).outerWidth(), 10);
          return visibleTabsWidth;
        }

        var availableSpace = function () {
          return $container.outerWidth()-visibleTabsWidth();
        }

        if (availableSpace()<0) {//we will hide tabs here
          var x = availableSpace();
          $($visibleTabs().get().reverse()).each(function( index ){
            if (!($(this).hasClass('always-visible'))){
                $(this).prependTo(dropdownMenu);
                x=x+$(this).outerWidth();
            }
            if (x>=0) {return false;}
          });
        }

        if (availableSpace()>getFirstHiddenElementWidth()) { //and here we bring the tabs out
          var x = availableSpace();
          $($dropdownTabs()).each(function( index ){
            if (getHiddenElementWidth(this) < x && !($(this).hasClass('always-dropdown'))){
              $(this).appendTo($container);
              x = x-$(this).outerWidth();
            } else {return false;}
           });

          if (!this.options.droptabs.pullDropdownRight && !$(dropdown).is(':last-child')) {
            // If not pulling-right, keep the dropdown at the end of the container.
            $(dropdown).detach().insertAfter($container.find('li:last-child'));
          }
        }

        if ($dropdownTabs().length <= 0) {
          dropdown.hide();
        } else {
          dropdown.show();
        }
      },

      //Activates a tab specified as a selector. 
      activateTab : function(tab) {
        if (langx.isNumber(tab)) {
          $(this.$tabs[tab]).plugin(TabButton.prototype.pluginName).show();
        }
      },

      addTab : function() {
        //TODO
      },

      removeTab : function(){
        //TODO
      }
    });

    plugins.register(TabStrip);


    return panels.TabStrip = TabStrip;

});