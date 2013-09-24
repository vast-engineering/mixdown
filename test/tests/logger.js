var _ = require('lodash');
var assert = require('assert');
var mixdownLogger = require('../../lib/logger');

suite('Logger init', function () {

  test('Test null config logger', function (done) {
    var logger = mixdownLogger.create();

    assert.ok(_.isFunction(logger.debug), "Should contain log level debug");
    assert.ok(_.isFunction(logger.info), "Should contain log level info");
    assert.ok(_.isFunction(logger.error), "Should contain log level error");
    assert.equal(Object.keys(logger.transports).length, 1, "Logger should have 1 transport");
    assert.equal(logger.transports[logger._names[0]].handleExceptions, false, "Logger should not be set to handle exceptions");

    done();
  });

  test('Test custom config logger', function (done) {
    var logger = mixdownLogger.create({
      "defaults": {
        "handleExceptions": true,
      },
      "transports": [{ "transport": "Console" }
      ]
    });
    console.error(require('util').inspect(logger));

    assert.ok(_.isFunction(logger.debug), "Should contain log level debug");
    assert.ok(_.isFunction(logger.info), "Should contain log level info");
    assert.ok(_.isFunction(logger.error), "Should contain log level error");
    assert.equal(Object.keys(logger.transports).length, 1, "Logger should have 1 transport");
    assert.equal(logger.transports[logger._names[0]].handleExceptions, true, "Logger should be set to handle exceptions");

    done();
  });

});