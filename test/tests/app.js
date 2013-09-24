var _ = require('lodash');
var assert = require('assert');
var MixdownApp = require('../../lib/app.js');

suite('Test application loading', function () {

  test('Test new() and init()', function (done) {
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
    assert.ok(app.plugins, 'Instance of plugins should exist on app.');

    app.init(function(err) {

      assert.ifError(err);
      assert.ok(app.plugins['hello-world'], 'Namespace should be initialized properly.');
      assert.equal(app.plugins['hello-world'].hello, 'bonjour', 'An interface attr should be specified.');
      assert.equal(app.plugins['hello-world'].sayHello(), 'bonjour', 'An interface attr should be specified.');

      done();
    });

  });

});