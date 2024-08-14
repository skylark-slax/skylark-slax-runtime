cdefine([
	"./slax"
],function(slax){
	var engines = {

	};

    function engine(ext,callback) {
    	if (callback !== undefined) {
    		engines[ext] = callback;
    	} else {
    		return engines[ext];
    	}

    } 

	return slax.templates = {
		engine
	};
})