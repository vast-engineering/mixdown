var util = require('util');
var events = require('events');
var _ = require('lodash');
var broadway = require('broadway');
var pluginUtil = require('./pluginutil.js');

/**
* Returns a list of parents sorted by oldest generation to newest.
* @param config {SiteConfiguration} The site config to use when creating the app.
**/
var App = function(config) {
  this.id = config.id;
  this.config = config;
  this.plugins = new broadway.App();
};

util.inherits(App, events.EventEmitter);

App.prototype.init = function(callback) {
  var plugins = this.plugins;
  var app = this;

  _.each(this.config.plugins, function(pluginConfig, namespace) {
    pluginUtil.use({
      plugin: pluginConfig,
      app: app,
      namespace: namespace
    });
  });

  // now run broadway's init so that the plugins can perform any custom setup.
  app.plugins.init(callback);
};

module.exports = App;



