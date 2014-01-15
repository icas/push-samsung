

$(document).ready(function() {
	
	// PREVENT SCROLLING
	document.addEventListener("touchmove", function(e) {
		e.preventDefault();
	}, false);
	
	// LOADS THE CONFIG FILE
	var loadConfig = function(callback) {
		var configFile = $.url().param().config || 'config.json';
		$.getJSON(configFile, _.bind(function(data) {           

			// config is all of config.json file
			var config = data || {};

			// first separate top level config objects
			var env = config.env;
			var envs = config.envs;
			var global = config.global;         

			// second override/append env settings 
			var currentEnv = envs[env];
			_.extend(global, currentEnv);          

			// third override with any url parameters
			_.extend(global, $.url().param());

			// return just the merged/overridden "global" section of config
			callback(global);

		}, this));
	};  	

	loadConfig(function(config) {
		
		// Initialize the App
		App.initialize(config);
	});

});