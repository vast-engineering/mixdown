var _ = require('lodash');
var assert = require('assert');
var pluginUtil = require('../../lib/pluginutil.js');

suite('Test pluginutil', function () {

  test('Test require()', function (done) {
    
    var Module = pluginUtil.require({
      plugin: {
        module: '/test/fixtures/testPlugin.js'
      }
    });
    assert.ok(_.isFunction(Module), 'Module should exist.');
    done();

  });

  test('Test use() with namspace', function (done) {
    var app = require('../fixtures/app.js')();

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

    assert.ok(app.plugins['hello-world'], 'Namespace should be initialized properly.');
    assert.equal(app.plugins['hello-world'].hello, 'bonjour', 'An interface attr should be specified.');
    assert.equal(app.plugins['hello-world'].sayHello(), 'bonjour', 'An interface attr should be specified.');
    done();

  });

});