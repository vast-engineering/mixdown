module.exports = function(namespace) {
  namespace = namespace || 'namespace-not-defined';

  this.attach = function(options) {

    this[namespace] = {
      hello: options.hello,
      sayHello: function() {
        return options.hello;
      }
    };

  };
};