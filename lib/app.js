var _ = require('lodash');
var MixdownApp = require('mixdown-app').App;
var pluginUtil = require('./pluginutil.js');

/**
 * Returns a list of parents sorted by oldest generation to newest.
 * @param config {SiteConfiguration} The site config to use when creating the app.
 **/
module.exports = MixdownApp.extend({
  init: function(config) {
    this._super();
    this.set_config(config);
  },
  set_config: function(config) {
    config = config || {};

    this.id = config.id;
    this._config = config;
    this.load();
  },
  load: function() {
    var plugins = this.plugins;
    var app = this;

    _.each(this._config.plugins, function(pluginConfig, namespace) {
      pluginUtil.use({
        plugin: pluginConfig,
        app: app,
        namespace: namespace
      });
    });
  }
});