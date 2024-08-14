define([
	"./slax"
],function(slax){
	var services = {};

	defien("services",[],function(){
		return services;
	});

	return slax.services = services;
});