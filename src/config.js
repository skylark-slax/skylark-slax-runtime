define([],function(){
	var config = {
	  "name": "chaptersApp",
	  "title": "A exmaple with navbar and a welcome view and three chapter views",
	  "baseUrl" : "",
	  "runtime": {
	    "skylarkjs": {
	      "version": "0.9.1"
	    },
	    "paths": {
	      "server": "scripts/services/server",
	      "text": "https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text",
	      "lodash": "https://cdn.bootcss.com/lodash.js/4.17.4/lodash.min",
	      "i18n": "scripts/i18n/i18n",
	      "i18nExt": "scripts/i18n",
	      "skylark-jquery": "/lib/skylark-jquery",
	      "jsoneditor": "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/5.32.0/jsoneditor.min"
	    }
	  },
	  "apps" : [
	    {"/"  : "home"},
	    {"/admin" : "admin"}
	  ]

	};

	return {

	};
});