var util = require('util');
var events = require('events');
var async = require('async');
var App = require('./lib/app.js');
var _ = require('lodash');
var pluginUtil = require('./lib/pluginutil.js');
var mixdownLogger = require('./lib/logger');

/**
 *  Mixdown - loads and manages configuration for environment and sites.
 *  @param config - Object containing the server configuration.
 **/
var Mixdown = function(config) {
  this.config = config;
  this._externalConfig = null;
  this.services = null;
  this.overlays = null;

  if (!this.config.app) {
    throw new Error('There is no default app to initialize.');
  }

  this.config.app.id = 'default';
};

util.inherits(Mixdown, events.EventEmitter);

Mixdown.prototype.init = function(callback) {
  this.initLogger();

  // initialize services (sites or cli apps)
  var self = this;

  this.getExternalConfig(function(err, _externalConfig) {

    if (err && typeof(callback) === 'function') {
      callback(err);
      return;
    } else if (err) {
      throw err;
    }

    _externalConfig.config.get(function(err, services) {

      // Do not bubble exception on error here.  Just log the error and continue.
      if (err && logger) {
        logger.error(err);
      }

      if (services && services.length) {
        self.overlays = _.filter(services, function(s) {
          return s.overlay === true;
        });
        self.services = _.reject(services, function(s) {
          return s.overlay === true;
        });
      } else {
        self.services = [self.config.app];
      }

      self.initServices(callback);
    });

  });
};

Mixdown.prototype.initLogger = function() {

  if (global.logger) {
    //gets rid of global exception catching
    global.logger.clear();
  }

  var loggerMixdown = this.config.logger || {
    "defaults": {
      "handleExceptions": true,
      "json": false,
      "timestamp": true,
      "colorize": true,
      "prettyPrint": true
    },
    "transports": [{
      "transport": "Console"
    }]
  };

  // Init logger: Need to move this to external place where is can be injected with
  // alpha, beta, and prod settings
  global.logger = mixdownLogger.create(this.config.logger);

  if (!logger) {
    console.error('There is no logger declared.');
  }

};

Mixdown.prototype.getExternalConfig = function(callback) {

  if (this.services && this._externalConfig) {
    typeof(callback) === 'function' ? callback(null, this._externalConfig) : null;
    return;
  }

  // setup an app to attach the external config plugin.
  this._externalConfig = new App();

  // ensure defaults for external config.
  _.defaults(this.config.services || {}, {
    module: "mixdown-config-filesystem"
  });

  // resolve and attach dist config module to external config instance
  pluginUtil.use({
    plugin: _.defaults(this.config.services || {}, {
      module: "mixdown-config-filesystem"
    }),
    app: this._externalConfig,
    namespace: 'config'
  });

  // initialize dist config module
  var self = this;

  this._externalConfig.setup(function(err) {
    typeof(callback) === 'function' ? callback(err, self._externalConfig) : null;
  });
};

Mixdown.prototype.initServices = function(callback) {
  var apps = {};
  var setups = [];
  var defaultApp = this.config.app;
  var main = this.config.main;
  var that = this;
  var appMixdown = _.cloneDeep(defaultApp);

  // enumerate and create the apps
  _.each(this.overlays, function(overlay) {
    _.bind(mergeSection, appMixdown, overlay, 'plugins')();
  });

  // enumerate and create the apps
  _.each(this.services, function(service) {

    _.bind(mergeSection, service, appMixdown, 'plugins')();
    var app = new App(service);

    app.main = main;
    app.vhosts = service.vhosts;
    app.on('error', function(err) {
      that.emit('error', err);
    });

    apps[service.id] = app;

    // enqueue the app init so we can attach a cb to the entire thing.
    setups.push(_.bind(app.setup, app));
  });

  // async the setups and notify when they are done.
  // TODO: see if a single app failure could cause all apps to fail.
  async.parallel(setups, function(err) {
    if (!err) {
      that.apps = apps;
    }
    typeof(callback) === 'function' ? callback(err, that) : null;
  });

};

/**
 * Applies the overrides from the env config.  Useful for setting a base config, then applying configuration overrides.
 * @param env - String representing the env overrides for this config.  This will load the config
 **/
Mixdown.prototype.env = function(env) {

  // apply merge of plugins at app level
  if (env && env.app) {

    // merge the core app
    _.bind(mergeSection, this.config.app, env.app, 'plugins', true)();

    // override the vhosts with the env specific hosts.
    if (env.app.vhosts) {
      this.config.app.vhosts = env.app.vhosts;
    }

    // logger does not get merged.
    if (env.logger) {
      this.config.logger = env.logger;
    }

    // main does not get merged.
    if (env.main) {
      this.config.main = env.main;
    }

    // services plugin config does not get merged.
    if (env.services) {
      this.config.services = env.services;
    }
  }

};

Mixdown.prototype.stop = function(callback) {

  if (this.main) {
    this.main.stop(callback);
  }

  return this;
};

Mixdown.prototype.start = function(callback) {
  var mainMixdown = this.config.main;

  // resolve main module.
  var mainFactory = pluginUtil.require({
    plugin: mainMixdown
  });

  // Main modules are factories so call create()
  var main = this.main = mainFactory.create(this, mainMixdown.options);

  this.init(function(errInit) {
    if (errInit) {
      _.isFunction(callback) ? callback(errInit) : null;
      return;
    }

    // app  is ready and initialized, call start
    main.start(callback);

  });

  return this;
};

// This is a custom merge which causes arrays in config to be replaced instead of merged.
// http://lodash.com/docs#merge
var mixdownPluginOptionsMerge = function(a, b) {
  return _.isArray(a) ? b : undefined;
};

// create local utility function to apply the merge.
var mergeSection = function(parent, section, reverse) {
  var that = this,
    parentSection = parent[section] || {},
    thisSection = this[section] || {},
    keys = _.keys(parentSection).concat(_.keys(thisSection)),
    newSection = {};

  _.each(keys, function(key) {
    var thisThing = (thisSection[key] || {}),
      parentThing = (parentSection[key] || {});

    // if the property explicitly exists, but is null then do not pull the parent version and do not add to object
    if (thisSection.hasOwnProperty(key) && thisSection[key] === null) {
      // do nothing.
    }
    // when the section/key prop exists, but is not explicitly null then we want to merge the props.
    else if (reverse) {
      newSection[key] = _.clone(parentThing);
      newSection[key].module = newSection[key].module || thisThing.module;
      newSection[key].options = _.merge(_.cloneDeep(thisThing.options) || {}, newSection[key].options, mixdownPluginOptionsMerge);
    } else {
      newSection[key] = _.clone(thisThing);
      newSection[key].module = newSection[key].module || parentThing.module;
      newSection[key].options = _.merge(_.cloneDeep(parentThing.options) || {}, newSection[key].options, mixdownPluginOptionsMerge);
    }

  });

  this[section] = newSection;

};

module.exports = Mixdown;
