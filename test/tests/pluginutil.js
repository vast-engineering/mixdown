var _ = require('lodash');
var assert = require('assert');
var pluginUtil = require('../../lib/pluginutil.js');
var App = require('mixdown-app').App;

suite('Test pluginutil', function() {

  test('Test require()', function(done) {

    var Module = pluginUtil.require({
      plugin: {
        module: '/test/fixtures/testPlugin.js'
      }
    });
    assert.ok(_.isFunction(Module), 'Module should exist.');
    done();

  });

  test('Test use() with namspace', function(done) {
    var app = new App();

    pluginUtil.use({
      app: app,
      namespace: 'hello-world',
      plugin: {
        module: '/test/fixtures/testPlugin.js',
        options: {
          hello: 'bonjour'
        }
      }
    });

    assert.ok(app['hello-world'], 'Namespace should be initialized properly.');
    assert.equal(app['hello-world'].sayHello(), 'bonjour', 'Plugin should say hello.');
    done();

  });

});