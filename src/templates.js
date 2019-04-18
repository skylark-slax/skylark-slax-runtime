define([
	"./slax"
],function(slax){

        // Already loaded templates
    var cache =  {};
        

	var templates = {
        // Base loading template URL
        baseUrl: '/templates/{name}',
        
        // Templates that are currently loading
        loadings: new Array(),
        
        // Save current rendered views
        currentViews: {},
        
        // Waiting defereds
        queues: {},
        
        set: function (name, data) {
            this.templates[name] = data;
            
            // Resolve queues
            var queue = this.queues[name];
            if (queue) {
                for (var i = 0; i < queue.length; i++) {
                    queue[i].dfd.resolveWith(queue[i].context, [data]);
                }
            }
            this.queues[name] = new Array();
        },
        
        notLoading: function (name) {
            var index = this.loadings.indexOf(name);
            if (index != -1) {
                var rest = this.loadings.slice(index + 1 || this.loadings.length);
                this.loadings.length = index < 0 ? this.loadings.length + index : index;
                return this.loadings.push.apply(this, rest);
            }
        },
        
        get: function(name, context) 
        {
            if (name == null) {
                throw "Template name must be defined";
            }
            
            var dfd = $.Deferred();
            
            // If the template is already loaded, resolve immediately
            if (this.templates[name]) {
                dfd.resolveWith(context, [this.templates[name]]);
            } else {
                // Add this request to queue
                if (!this.queues[name]) {
                    this.queues[name] = new Array();
                }
                this.queues[name].push({dfd: dfd, context: context});
                
                // Is this template loading ?
                if (this.loadings.indexOf(name) == -1) {
                    this.loadings.push(name);
                    
                    // Compute template URL
                    var url = Backbone.TemplateManager.baseUrl.replace('{name}', name);
                
                    // Start template loading
                    $.get(url, function (data) {
                        // Compute template
                        var template = _.template(data);
                        
                        // Save template in "cache"
                        Backbone.TemplateManager.notLoading(name);
                        Backbone.TemplateManager.set(name, template);
                    }).error(function(){
                        Backbone.TemplateManager.notLoading(name);
                    });
                }
            }
            
            return dfd.promise();
        }

	};
	return slax.templates = templates;
})