var _ = require('lodash');
var path = require('path');
var util = require('util');

var pluginUtility = {


  require: function(options) {

    if (!options || !options.plugin) {
      throw new Error('No plugin was passed into require. Cannot require module.');
    }

    var Mod = null;
    var modulePath = (options.plugin.module || '').split('#');
    var requirePath = modulePath.length ? modulePath[0] : null;
    var prop = modulePath.length > 1 ? modulePath[1] : null;
    var err = [];

    var emitError = function() {
        var msg = _.map(err, function(e) { return e.message; }).join('\\n');
        throw new Error('Could not load plugin: ' + options.plugin.module + ', ' + msg);
    };

    if (requirePath) {
      try {
        Mod = require(requirePath);
      } catch (e) {
        err.push(e);
      }

      if (!Mod) {
        try {
          Mod = require(path.join(process.cwd(), requirePath));
        } catch (e) {
          e.message += ' ' + path.join(process.cwd(), requirePath);
          err.push(e);
        }
      }

      // Search for plugin in project root node_modules.
      if (!Mod) {
        try {
          Mod = require(path.join(process.cwd(), "node_modules", requirePath));
        } catch (e) {
          e.message += ' ' + path.join(process.cwd(), "node_modules", requirePath);
          err.push(e);
        }
      }


      if (Mod) {
        try {
          Mod = prop ? Mod[prop] : Mod;
        }
        catch (e) {
          err.push(e);
          emitError();
        }
      }
      else {
        emitError();
      }
    }

    return Mod;
  },

  use: function(options) {

    if (!options || !options.plugin) {
      throw new Error('No plguin was passed into resolve. Cannot require module.');
    }

    if (!options || !options.app) {
      throw new Error('No app was passed into resolve. Cannot attach plugin');
    }

    var Mod = pluginUtility.require(options);
    var app = options.app;

    try {
      app.plugins.use(new Mod(options.namespace), _.extend({ app: app }, options.plugin.options || {}));
    } catch (e) {
      e.message += 'plugin configuration: ' + util.inspect(options);
      throw e;
    }

    return app;
  }
};

module.exports = pluginUtility;
