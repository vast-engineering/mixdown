var BasePlugin = require('mixdown-app').Plugin;

module.exports = BasePlugin.extend({
  _namespace_default: 'hello',
  sayHello: function() {
    return this._options.hello;
  },
  initialized: false,
  _setup: function(done) {
    this.initialized = true;
    done();
  }
});