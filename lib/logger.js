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

	// create logger instance
	logger = bucker.createLogger(options);
	
	//TODO::FIND A BETTER WAY TO DO THIS! We should use domains or something
	process.on('uncaughtException', function(err) {
  	message = "uncaught exception: " + err.message;
  	logger.error(message);
	});

	return logger;
};