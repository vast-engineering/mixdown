# Mixdown.js

Mixdown is a plugin based approach to application development.  Mixdown started as a way to manage literally hundreds of websites in a small number of processes.  

* Rich configuration interface for dependency injection.  
* Plugins are preferred over middleware, though existing connect/express middleware can be used.  (Utilizes [broadway](https://github.com/flatiron/broadway) for plugin patterns)
* Logging is provided by [bucker](https://github.com/nlf/bucker), your logger configuration in mixdown.json will be used as the options to initialize bucker.  We use syslog in production and console transports for dev.
* Distributed configuration (store your sites plugin properties anywhere) with hot-reload is first class citizen.  Default provider is file system for simple installs.  CouchDB and Zoo Keeper are available for complex multi-site deployments.


# Production Ready

Production ready components are built in.

* Logging
* Web server with tcp and socket transports
* Interfaces for http, https, and cli
* Scalable & clustered workers (mixdown exclusive: solved the worker load balance bug in 0.10.x)
* Distributed config with hot reload

** We use it to build web apps. **

** We use it to build distributed, fault tolerant systems of real time workers. **

![travis-ci status](https://travis-ci.org/mixdown/mixdown.png)

# Quick Start

There are 2 supported yeoman generators for mixdown:

## [Mixdown Web App Scaffold](https://github.com/mixdown/generator-mixdown)

```
$ npm i yo generator-mixdown -g
$ mkdir wobble
$ cd wobble
$ yo mixdown

# follow the prompts

$ npm start

# navigate to http://localhost:8081

```

Once you have an existing mixdown app, you can add a new http route like this:

```
$ yo mixdown:route

```


## [Mixdown CLI/Worker Scaffold](https://github.com/mixdown/generator-mixdown-cli)

```
$ npm i yo generator-mixdown-cli -g
$ mkdir wibble
$ cd wibble
$ yo mixdown-cli

# follow the prompts

$ npm start

# App will start, show your services, then stop b/c the work is done.

```

# Radical Reusability

Quotes below are copied from [substack](https://github.com/substack), originally posted [HERE](http://substack.net/node_aesthetic).

> Many modules on npm export only a single function by assigning onto module.exports such that require('modulename') returns just that single function of interest. It also helps that module names have a direct correspondence to the string that you put in your call to require() and that require() just returns the module instead of modifying the environment to include the module. 

Keep your plugins small, use npm to get them into your package/app, use broadway to pluginify them, then use mixdown to activate them and do dependency injection. 

> While the limited surface area approach can hurt extensibility, you can win a great deal of extensibility back by breaking up problems into lots of tiny modules. When you write a module for general enough consumption to put up on npm, you can't contaminate your own implementation with too many implementation-specific details. It's also much easier to test and iterate on code in complete isolation from your application business logic. Node and npm go to great lengths to help you do this.

Mixing chocolate and peanut butter was a brilliant mishap that resulted in yummy-ness.  However, mixing concerns in software is more akin to bleach and ammonia - poison.  Building plugins in isolation helps you keep your app code and business logic separated.  That separation yields a few extremely important advantages

1. Easier to unit test sections of the app
2. Easier to re-use (re-mix) the components

# Plugins

Mixdown uses [Broadway](https://github.com/flatiron/broadway) for the plugin interface.  It adds a declarative composable layer to your application (web, cli, whatever) to encourage these principles:

* Single-use and isomorphoic plugins/components
* Simple declarative design for plugin activation and dependency injection
* An app is a core thing (web server for example) that you decorate with functionality
* With a robust and simple pattern for decorating your app, you can develop much better code, much more quickly, and without refactoring.

# Remix over Refactor

Taking this a step further, loads of time has been wasted in software development re-factoring.  No one likes re-factoring.  Mixdown prefers re-mixing over re-factoring.  Here is the concept.

* Use plugins that do 1 thing very well (ex: queries a noSQL, renders a view)
* Decorate your app with them
* When you need to add, remove, or swap something then simply swap the plugin.  

# Anatomy of a Mixdown app

Example of some things you want in a web app. (shown in a mixdown configuration)

```javascript 
{
  "id": "wobble",

  "plugins": {

  	"render": {
      "module": "broadway-handlebars",
      "options": {
        "optimize": false,
        "development": true,
        "view": {
          "base": [
            "./views"
          ],
          "ext": "html"
        }
      }
    },

    "json": {
      "module": "mixdown-json",
      "options": {
        "jsonpEnabled": true
      }
    },

    "error": {
      "module": "mixdown-error"
    }
  }
}

```

The above configuration will yield an app with an id of "wobble" which is has the ability to render html using handlebars, stream json objects from the server, and return standard error responses to clients.

In a web app, you need a router so that you can interpret routes.  The [mixdown-router](https://github.com/mixdown/router) plugin allows you to declare a route table and map controllers.

If we added the following plugin config, now we have a a home page route defined which we can handle requests.

```javascript 

"router": {
  "module": "./router/router.js",
  "options": {
    "routes": {

    	"home": {
        "method": "GET",
        "name": "home",
        "path": "/",
        "description": "Home Page",
        "handler": "home",
        "params": {},
        "enabled": true
      }

    }
  }

```

The controller code to handle the request is neatly tucked away in its own file.  It looks like this:

```javascript

module.exports = function(httpContext) {
  var app = httpContext.app;
  var res = httpContext.response;

  // Get a view model, this is would typically come from a database or service.  
  var viewModel = {
  	title: 'Hello',
  	query: httpContext.url.query
  };

  // Pass the view model to the render function which knows how to fine the file "home.html" on the file system.
  app.plugins.render('home', viewModel, function(err, html) {

    if (err) {
      app.plugins.error.notFound(err, res);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);

  });

};

```
