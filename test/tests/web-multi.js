var _ = require('lodash');
var assert = require('assert');
var Mixdown = require('../../index.js');

suite('Test mixdown loading - Multi-site example', function () {
  var simpleApp = require('../../example/web/multi-site/mixdown.json');
  var mixdown = new Mixdown(simpleApp);

  setup(function(done){
    mixdown.init(done);
  });


  test('Load configuration', function (done) {

    assert.deepEqual(mixdown.config, simpleApp, 'Mixdown Instance should have its config set');
    assert.ok(global.logger, 'Logger should be attached to global namespace');
    assert.equal(Object.keys(mixdown.apps).length, 2, 'Mixdown should have generated 2 app');
    done();
  });

  test('Test webapp1', function(done) {
    var app1 = mixdown.apps.webapp1;
    assert.ok(app1.plugins['hello-world'], 'Namespace should be initialized properly.');
    assert.equal(app1.plugins['hello-world'].hello, 'hola', 'An interface attr should be specified.');
    assert.equal(app1.plugins['hello-world'].sayHello(), 'hola', 'sayHello should return configured value.');
    done();
  });

  test('Test webapp2', function(done) {
    var app2 = mixdown.apps.webapp2;
    assert.ok(app2.plugins['hello-world'], 'Namespace should be initialized properly.');
    assert.equal(app2.plugins['hello-world'].hello, 'bonjour', 'An interface attr should be specified.');
    assert.equal(app2.plugins['hello-world'].sayHello(), 'bonjour', 'sayHello should return configured value.');
    done();
  });

});