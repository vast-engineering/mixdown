var _ = require('lodash');
var assert = require('assert');
var mixdownLogger = require('../../lib/logger');

suite('Logger init', function () {

  test('Test null config logger', function (done) {
    var logger = mixdownLogger.create();

    assert.ok(_.isFunction(logger.info), "Should contain log level info");
    assert.ok(_.isFunction(logger.error), "Should contain log level error");

    assert.equal(logger.options.handleExceptions, false, "Logger should not be set to handle exceptions");

    done();
  });

  test('Test custom config logger', function (done) {
    var logger = mixdownLogger.create({
      "handleExceptions":true,
      "console":{
        "color":true
      }
    });

    assert.ok(_.isFunction(logger.info), "Should contain log level info");
    assert.ok(_.isFunction(logger.error), "Should contain log level error");
    assert.equal(logger.options.handleExceptions, true, "Logger should not be set to handle exceptions");
    done();
  });

});