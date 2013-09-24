module.exports = function(namespace) {
  namespace = namespace || 'namespace-not-defined';

  this.attach = function(options) {

    this[namespace] = {
      initialized: false,
      hello: options.hello,
      sayHello: function() {
        return options.hello;
      }
    };

  };

  this.init = function(done) {
    this[namespace].initialized = true;
    done();
  };
};