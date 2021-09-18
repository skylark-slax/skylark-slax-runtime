define([
  "skylark-langx/langx",
  "skylark-domx-browser",
  "skylark-domx-eventer",
  "skylark-domx-noder",
  "skylark-domx-geom",
  "skylark-domx-query",
  "skylark-domx-plugins-base",
  "./panels",
  "./panel"
],function(langx,browser,eventer,noder,geom,$,plugins,panels,Panel){

  'use strict';

  var Pagination = Panel.inherit({
      klassName : "Pagination",

      pluginName : "lark.panels.pagination",

      options : {
          tagName : "ul",
          css : "",
          selectors : {
              firstNavi : "li[aria-label='first']",
              prevNavi : "li[aria-label='prev']",
              nextNavi : "li[aria-label='next']",
              lastNavi : "li[aria-label='last']",
              numericNavi : "li:not([aria-label])",
              numericTxt  : "a"
          },
          totalPages: 7,
          maxButtonsVisible: 5,
          currentPage: 1     
      },

      state : {
          totalPages : Number,
          currentPage : Number
      },

      _construct : function(elm,options) {
        Panel.prototype._construct.call(this,elm,options);

        this.$first = this._velm.$(this.options.selectors.firstNavi);
        this.$prev = this._velm.$(this.options.selectors.prevNavi);
        this.$last = this._velm.$(this.options.selectors.lastNavi);
        this.$next = this._velm.$(this.options.selectors.nextNavi);
        this.$numeric = this._velm.$(this.options.selectors.numericNavi);

        var self = this;

        function checkCanAction(elm) {
          var $elm = $(elm);
          if ($elm.is(".disabled,.active")) {
            return false;
          } else {
            return $elm;
          }
        }

        this.$first.click(function(){
          if (!checkCanAction(this)) {
            return;
          }
          self.currentPage(1);
        });

        this.$prev.click(function(){
          if (!checkCanAction(this)) {
            return;
          }
          self.currentPage(self.currentPage()-1);
        });

        this.$last.click(function(){
          if (!checkCanAction(this)) {
            return;
          }
          self.currentPage(self.totalPages());
        });

        this.$next.click(function(){
          if (!checkCanAction(this)) {
            return;
          }
          self.currentPage(self.currentPage()+1);
        });

        this.$numeric.click(function(){
          var ret = checkCanAction(this)
          if (!ret) {
            return;
          }
          var numeric = ret.find(self.options.selectors.numericTxt).text(),
              pageNo = parseInt(numeric);
          self.currentPage(pageNo);

        });

        this._currentPage = this.options.currentPage;
        this._totalPages = this.options.totalPages;

        this._refresh({
          currentPage : true,
          totalPages : true
        });
      },

      _refresh: function (updates) {
        var self = this;

        function changePageNoBtns(currentPage,totalPages) {

          // Create the numeric buttons.
          // Variable of number control in the buttons.
          var totalPageNoBtns = Math.min(totalPages, self.options.maxButtonsVisible);
          var begin = 1;
          var end = begin + totalPageNoBtns - 1;

          /*
           * Align the values in the begin and end variables if the user has the
           * possibility that select a page that doens't appear in the paginador.
           * e.g currentPage = 1, and user go to the 20 page.
           */
          while ((currentPage < begin) || (currentPage > end)) {
            if (currentPage > end) {
               begin += totalPageNoBtns;
               end += totalPageNoBtns;

               if (end > totalPages) {
                 begin = begin - (end - totalPages);
                 end = totalPages;
               }
             } else {
               begin -= totalPageNoBtns;
               end -= totalPageNoBtns;

               if (begin < 0) {
                 end = end + (begin + totalPageNoBtns);
                 begin = 1;
               }
             }
          }
         /*
          * Verify if the user clicks in the last page show by paginator.
          * If yes, the paginator advances.
          */
          if ((currentPage === end) && (totalPages != 1)) {
            begin = currentPage - 1;
            end = begin + totalPageNoBtns - 1;

            if (end >= totalPages) {
              begin = begin - (end - (totalPages));
              end = totalPages;
            }
          }

          /*
           * Verify it the user clicks in the first page show by paginator.
           * If yes, the paginator retrogress
           */
           if ((begin === currentPage) && (totalPages != 1)) {
             if (currentPage != 1) {
               end = currentPage + 1;
               begin = end - (totalPageNoBtns - 1);
             }
           }

           var count = self.$numeric.size(),
               visibles = end-begin + 1,
               i = 0;

           self.$numeric.filter(".active").removeClass("active");
           while (i<visibles) {
             var pageNo = i + begin,
                 $btn = self.$numeric.eq(i);
             $btn.find(self.options.selectors.numericTxt).text(i+begin).show();
             if (pageNo == currentPage) {
              $btn.addClass("active");
             }
             i++;
           }
           while (i<count) {
             self.$numeric.eq(i).find(self.options.selectors.numericTxt).text(i+begin).hide();
             i++;
           }


        }

        function changeLabeldBtns(currentPage,totalPages) {
          if (currentPage < 1) {
            throw('Page can\'t be less than 1');
          } else if (currentPage > totalPages) {
            throw('Page is bigger than total pages');
          }

          if (totalPages < 1) {
            throw('Total Pages can\'t be less than 1');
          }

          if (currentPage == 1 ) {
            self.$first.addClass("disabled");
            self.$prev.addClass("disabled");
          } else {
            self.$first.removeClass("disabled");
            self.$prev.removeClass("disabled");
          }

          if (currentPage == totalPages ) {
            self.$last.addClass("disabled");
            self.$next.addClass("disabled");
          } else {
            self.$last.removeClass("disabled");
            self.$next.removeClass("disabled");
          }
        }

        if (updates.currentPage || updates.totalPages) {
          var currentPage = self.currentPage(),
              totalPages = self.totalPages();

          changePageNoBtns(currentPage,totalPages);
          changeLabeldBtns(currentPage,totalPages);
        }

      },

      currentPage : function(v) {
        if (v !== undefined) {
          this._currentPage = v;
          this._refresh({
            currentPage : true
          });            
          return this;
        } else {
          return this._currentPage;
        }
      },

      totalPages : function(v) {
        if (v !== undefined) {
          this._totalPages = v;
          this._refresh({
            totalPages : true
          });
          return this;
        } else {
          return this._totalPages;
        }
      }
  });

  plugins.register(Pagination);


  return panels.Pagination = Pagination;
});