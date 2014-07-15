var _ = require('lodash');
var assert = require('assert');
var Mixdown = require('../../index.js');

suite('Test mixdown loading - Simple example', function() {

  test('Load configuration', function(done) {

    var simpleApp = require('../../example/web/simple/mixdown.json');
    var mixdown = new Mixdown(simpleApp);

    assert.deepEqual(mixdown.config, simpleApp, 'Mixdown Instance should have its config set');

    mixdown.init(function(err) {

      assert.ifError(err);
      assert.ok(global.logger, 'Logger should be attached to global namespace');
      assert.equal(Object.keys(mixdown.apps).length, 1, 'Mixdown should have generated 1 app');

      var app = mixdown.apps['default'];
      assert.ok(app['hello-world'], 'Namespace should be initialized properly.');
      assert.equal(app['hello-world'].sayHello(), 'bonjour', 'App should say hello.');

      done();
    });

  });

});