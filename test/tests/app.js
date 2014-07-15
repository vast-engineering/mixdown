var _ = require('lodash');
var assert = require('assert');
var MixdownApp = require('../../lib/app.js');

suite('Test application loading', function() {

  test('Test new() and init()', function(done) {
    var app = new MixdownApp({
      id: 'testapp',
      plugins: {
        'hello-world': {
          module: '/test/fixtures/testPlugin.js',
          options: {
            hello: 'bonjour'
          }
        }
      }
    });


    assert.ok(app, 'Instance of app should exist.');
    assert.ok(app, 'Instance of plugins should exist on app.');
    assert.ok(app['hello-world'], 'Namespace should be initialized properly.');
    assert.ok(app['hello-world'].initialized === false, 'Should not be initialized yet.');

    app.setup(function(err) {

      assert.ifError(err);
      assert.ok(app['hello-world'], 'Namespace should be initialized properly.');
      assert.ok(app['hello-world'].initialized === true, 'Should be initialized now.');
      assert.equal(app['hello-world'].sayHello(), 'bonjour', 'Plugin should say hello.');

      done();
    });

  });

});