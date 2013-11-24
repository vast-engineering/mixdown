var _ = require('lodash');
var bucker = require('bucker');

module.exports.create = function(options) {
	var logger = null;

	options = _.defaults(options || {}, {
		"handleExceptions": false,
		"console":{
			'color':true
		},
	  "level": "error"
	});

	//due to the way bucker Handles uncaught exceptions we need to overload that option
	//THIS IS A REALLY NASTY HACK, WE SHOULD SUBMIT A PATCH TO BUCKER.
	var buckerOptions = _.clone(options,true);
	buckerOptions.handleExceptions = false;

	// create logger instance
	logger = bucker.createLogger(buckerOptions);
	
	//TODO::FIND A BETTER WAY TO DO THIS! We should use domains or something
	if(options.handleExceptions) {
		logger.options.handleExceptions = true;
		var exHandler = function(err) {
	  	message = "uncaught exception: " + err.message;
	  	logger.error(message);
		}

		process.on('uncaughtException', exHandler);

		logger.clear = function(){
			process.removeListender('uncaughtException',exHandler);
		}

	}

	logger.clear = function(){};

	return logger;
};