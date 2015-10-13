'use strict';

/**
 * Persistent Request Intercept
 * @param {Window} scope
 * @param {Object} settings
 */
var pri = (function(undefined) {
  var activeRequests  = []
    , inactiveRequests= []
    , isDeployed      = false
    , defaultSettings = {
        allRequestsDone: null,
        load           : null,
        error          : null,
        beforeLoad     : null,
        close          : null
      }
    ;

  function pri(window, _settings) {
    if (window === undefined) throw new Error('window object is required so as to intercept');

    var XMLHttpRequest = window.XMLHttpRequest
      , settings = defaultSettings.extend(_settings)
      ;

    window.addEventListener('beforeunload', function() {
      //window is about to change into a new window
      setTimeout(function() {
        //window is now potentially new window
        if (window.window.onbeforeload) {
          window.window.onbeforeload();
        }
        if (settings.beforeLoad !== null) {
          settings.beforeLoad(window.window);
        }

        if (window.window && window.window.XMLHttpRequest) {
          //window is now a confirmed new window
          pri(window.window, settings);
        } else if (settings.close) {
          settings.close(window);
        }
      }, 0);
    });

    function RequestListener(objParameters) {
      var self = this
        , realRequest = this.realRequest = new XMLHttpRequest(objParameters)
        ;

      realRequest.onload = function() {
        self.removeActiveRequest();

        if (self.onload) {
          self.onload.apply(realRequest, arguments);
        }
        if (settings.load) {
          settings.load.apply(realRequest, arguments);
        }

        self.checkActiveRequestsState();

        return self;
      };

      realRequest.onerror = function() {
        if (self.onerror !== null) {
          self.onerror.apply(realRequest, arguments);
        }
        if (settings.error !== null) {
          settings.error.apply(realRequest, arguments);
        }

        return self;
      };
    }

    RequestListener.prototype = {
      get status() {
        return this.realRequest.status;
      },
      get statusText() {
        return this.realRequest.statusText;
      },
      get response() {
        return this.realRequest.response;
      },
      get responseText() {
        return this.realRequest.responseText;
      },
      get responseType() {
        return this.realRequest.responseType;
      },
      get responseXML() {
        return this.realRequest.responseXML;
      },
      get isDeployed() {
        return isDeployed || false;
      },
      send: function() {
        this
          .addActiveRequest()
          .realRequest.send();

        return this;
      },
      open: function(method, url, async, user, password) {
        this.realRequest.open(method, url, async, user, password);

        return this;
      },
      addActiveRequest: function() {
        activeRequests.push(this.realRequest);

        return this;
      },
      removeActiveRequest: function() {
        var i = activeRequests.indexOf(this.realRequest)
          , removed
          ;

        if (i > -1) {
          removed = activeRequests.splice(i, 1);
          inactiveRequests.push(removed.pop());
        }

        return this;
      },
      checkActiveRequestsState: function() {
        if (activeRequests.length < 1) {
          if (this.onallrequestsdone) {
            this.onallrequestsdone.call(this.realRequest, inactiveRequests, window);
          }
          if (settings.allRequestsDone) {
            settings.allRequestsDone.call(this.realRequest, inactiveRequests, window);
          }
        }

        return this;
      }
    };

    window.XMLHttpRequest = RequestListener;
  }

  defaultSettings.extend = function(settings) {
    settings = settings || {};

    var defaults = defaultSettings
      , i
      ;

    for (i in defaults) if (defaults.hasOwnProperty(i)) {
      settings[i] = settings.hasOwnProperty(i) ? settings[i] : defaults[i];
    }

    return settings;
  };

  pri.newWindow = function(url, settings) {
    var childWindow = window.open(url);
    setTimeout(function() {
      if (settings.beforeLoad) {
        settings.beforeLoad(childWindow);
      }
    }, 0);
    pri(childWindow, settings);
  };

  return pri;
})();