mixdown
=======

Mixdown is a plugin based approach to node.js application development.  Mixdown started as a way to manage literally hundreds of websites in a small number of node processes.  

* Rich configuration interface for dependency injection.  
* Plugins are preferred over middleware, though existing connect/express middleware can be used.  (Utilizes [broadway](https://github.com/flatiron/broadway) for plugin patterns)
* Production ready components including logging, server with tcp and socket transports, http and cli interfaces, distributed config with hot reload, and more.
* Logging is pluggable, but you should just stick with the default [winston](https://github.com/flatiron/winston) logger b/c it is very popular and well-supported.  We use syslog in production and console transports for dev.
* Distributed configuration (store your sites plugin properties anywhere) with hot-reload is first class citizen.  Default provider is file system for simple installs.  CouchDB and Zoo Keeper are available for complex multi-site deployments.

![travis-ci status](https://travis-ci.org/mixdown/mixdown.png)


