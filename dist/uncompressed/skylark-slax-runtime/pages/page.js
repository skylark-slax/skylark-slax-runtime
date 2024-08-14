define([
	"skylark-langx/langx",
	"skylark-domx-css",
	"skylark-langx-scripter",
	"skylark-domx-finder",
	"skylark-domx-query",
	"skylark-appify-spa",
	"skylark-nprogress",
	"skylark-bootbox4",
    "skylark-visibility",
    "skylark-tinycon"
],function(langx, css, scripter, finder,$,spa,nprogress,bootbox,Visibility, Tinycon){
	function createAlert(params,template) {
	    params.parseTemplate('alert', params, function (alertTpl) {
	      params.translate(alertTpl, function (translatedHTML) {				
	        var alert = $('#' + params.alert_id);
					if (alert.length) {
						return updateAlert(alert, params);
					}
					alert = $(translatedHTML);
					alert.fadeIn(200);

					
					params.container.prepend(alert);
					//components.get('toaster/tray').prepend(alert);

					alert.find('button').on('click', function () {
						if (typeof params.closefn === 'function') {
							params.closefn();
						}
						fadeOut(alert);
						return false;
					});


					if (params.timeout) {
						startTimeout(alert, params.timeout);
					}

					if (typeof params.clickfn === 'function') {
						alert
							.addClass('pointer')
							.on('click', function (e) {
								if (!$(e.target).is('.close')) {
									params.clickfn();
								}
								fadeOut(alert);
							});
					}

			  });
	   });

		//Benchpress.parse('alert', params, function (alertTpl) {
		//	translator.translate(alertTpl, function (translatedHTML) {
		//		...
		//	});
		//});
	}

	function updateAlert(alert, params) {
		alert.find('strong').html(params.title);
		alert.find('p').html(params.message);
		alert.attr('class', 'alert alert-dismissable alert-' + params.type + ' clearfix');

		clearTimeout(parseInt(alert.attr('timeoutId'), 10));
		if (params.timeout) {
			startTimeout(alert, params.timeout);
		}

		alert.children().fadeOut(100);
		//translator.translate(alert.html(), function (translatedHTML) {
		params.translate(alert.html(), function (translatedHTML) {
			alert.children().fadeIn(100);
			alert.html(translatedHTML);
		});

		// Handle changes in the clickfn
		alert.off('click').removeClass('pointer');
		if (typeof params.clickfn === 'function') {
			alert
				.addClass('pointer')
				.on('click', function (e) {
					if (!$(e.target).is('.close')) {
						params.clickfn();
					}
					fadeOut(alert);
				});
		}
	}

	function fadeOut(alert) {
		alert.fadeOut(500, function () {
			$(this).remove();
		});
	}

	function startTimeout(alert, timeout) {
		var timeoutId = setTimeout(function () {
			fadeOut(alert);
		}, timeout);

		alert.attr('timeoutId', timeoutId);

		// Reset and start animation
		alert.css('transition-property', 'none');
		alert.removeClass('animate');

		setTimeout(function () {
			alert.css('transition-property', '');
			alert.css('transition', 'width ' + (timeout + 450) + 'ms linear, background-color ' + (timeout + 450) + 'ms ease-in');
			alert.addClass('animate');
		}, 50);

		// Handle mouseenter/mouseleave
		alert
			.on('mouseenter', function () {
				$(this).css('transition-duration', 0);
			});
	}

	var Shell = spa.Page.inherit({
		options : {
	        i18n : {
	            locale : "en",
	            translate : function(txt) {
	              return langx.Deferred.resolve(txt);
	            }
	        },
			alerts : {
				container : "",     // element,$elment or selector,
				titles : {
					success : '[[global:alert.success]]',
					error :  '[[global:alert.error]]'
				},
			},
			templator  : {
				parse  : null,    // template function
			},
			skins : {

			}
		},

		_construct : function(options) {
			spa.Page.prototype._construct.call(this,options);

	      	this._titleObj = {
	        	active: false,
	        	interval: undefined,
	        	titles: [],
	      	};

	     	var self = this;

	     	self.isFocused = true;

	      	Visibility.change(function (event, state) {
	        	if (state === 'visible') {
	          		self.isFocused = true;
	         		self.alternatingTitle('');
	        	} else if (state === 'hidden') {
	          		self.isFocused = false;
	        	}
      		});      
		},

		progress : function() {
			return nprogress;
		},

		alert : function (params) {
			params.alert_id = 'alert_button_' + (params.alert_id ? params.alert_id : new Date().getTime());
			params.title = params.title ? params.title.trim() || '' : '';
			params.message = params.message ? params.message.trim() : '';
			params.type = params.type || 'info';


			var alert = $('#' + params.alert_id);

      		params.translate = params.translate || this.option("i18n.translate");
			if (alert.length) {
				updateAlert(alert, params);
			} else {
        		params.parseTemplate = params.parseTemplate || this.option("templator.parse");
        		params.container  = params.container || this.option("alerts.container");
				createAlert(params);
			}
		},

		removeAlert : function (id) {
			$('#alert_button_' + id).remove();
		},

		alertSuccess : function (message, timeout) {
			this.alert({
				title: this.option("alerts.titles.success"),
				message: message,
				type: 'success',
				timeout: timeout || 5000,
			});
		},

		alertError : function (message, timeout) {
			message = message.message || message;

			this.alert({
				title: this.option("alerts.titles.error"),
				message: message,
				type: 'danger',
				timeout: timeout || 10000,
			});
		},

    	alternatingTitle : function (title) {
      		if (typeof title !== 'string') {
        		return;
      		}

	      var titleObj = this._titleObj;

	      if (title.length > 0 && !app.isFocused) {
	        if (!titleObj.titles[0]) {
	          titleObj.titles[0] = window.document.title;
	        }

	        var translate = this.option("i18n.translate");
	        translate(title, function (translated) {
	            titleObj.titles[1] = translated;
	            if (titleObj.interval) {
	              clearInterval(titleObj.interval);
	            }

	            titleObj.interval = setInterval(function () {
	              var title = titleObj.titles[titleObj.titles.indexOf(window.document.title) ^ 1];
	              if (title) {
	                window.document.title = $('<div/>').html(title).text();
	              }
	            }, 2000);
	        });
	        
	      } else {
	        if (titleObj.interval) {
	          clearInterval(titleObj.interval);
	        }
	        if (titleObj.titles[0]) {
	          window.document.title = $('<div/>').html(titleObj.titles[0]).text();
	        }
	      }
	    },

	    refreshTitle : function (title) {
	        var self = this,
	            translate = this.option("i18n.translate"),
	            titleObj = this._titleObj;

	        translate(title, function (translated) {
	          titleObj.titles[0] = translated;
	          self.alternatingTitle('');
	        });
	    },


	    /*
	     * Manipulatethe favicon, in particular adding alert bubbles and changing images. 
	     */
	    tinycon : function(bubble,options) {

	    	if (langx.isUndefined(options)){
	    		if (langx.isPlainObject(bubble))	{
	    			options = bubble;
	    			bubble = undefined;
	    		}
	    	} 

	    	if (langx.isDefined(options)) {
	    		Tinycon.setOptions(options)
	    	}
	    	if (langx.isDefined(bubble)) {
	    		Tinycon.setBubble(bubble);
	    	}

	    },


		reskin : function (skinName,cssUrl,clientEl) {

			if (!clientEl) {
				clientEl = document.getElementById("skinSheet");
				if (!clientEl) {
					return;
				}
			}

			var currentSkinClassName = $('body').attr('class').split(/\s+/).filter(function (className) {
				return className.startsWith('skin-');
			});
			var currentSkin = currentSkinClassName[0].slice(5);
			currentSkin = currentSkin !== 'noskin' ? currentSkin : '';

			// Stop execution if skin didn't change
			if (skinName === currentSkin) {
				return;
			}

			var linkEl = document.createElement('link');
			linkEl.rel = 'stylesheet';
			linkEl.type = 'text/css';
			linkEl.href = cssUrl;
			linkEl.onload = function () {
				clientEl.parentNode.removeChild(clientEl);

				// Update body class with proper skin name
				$('body').removeClass(currentSkinClassName.join(' '));
				$('body').addClass('skin-' + (skinName || 'noskin'));
			};

			document.head.appendChild(linkEl);
		},


		loadStyleSheet : function(url,options,loadedCallback, errorCallback) {
			return css.loadStyleSheet(url,options,loadedCallback, errorCallback);

		},

		removeStyleSheet : function(id) {
			return css.removeStyleSheet(id);

		},

		loadScript : function(url, loadedCallback, errorCallback) {
			return scripter.loadJavaScript(url,loadedCallback,errorCallback);
		},

		removeScript : function(id) {
			return scripter.deleteJavaScript(id);
		}


	});


	return Shell;

});
