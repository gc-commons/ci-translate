(function() {
  'use strict';

  /**
   * {Factory} translateSrv
   * @fileOverview Service for translate
   */
  angular
    .module('ci_translate', [
      'pascalprecht.translate', // angular-translate
      'ci_http',
      'ci_call2api',
      'ngCookies'
    ])

    // Initial configuration for ng-translate
    .config(['$translateProvider', function($translateProvider) {
      $translateProvider
        // Log missing keys
        .useMissingTranslationHandlerLog()
        // Escaping of variable content
        .useSanitizeValueStrategy('sanitizeParameters')
        // Default lang
        .determinePreferredLanguage();
    }])


  /**
   * @name ciTranslationLoader
   * @typedef {Factory}
   * @description Custom ng-translate loader for CI
   * @see https://github.com/angular-translate/angular-translate/wiki/Asynchronous-loading#using-custom-loader-service
   */
    .factory('ciTranslationLoader', [
      '$cookies',
      '$window',
      'paramsSrv',
      'httpSrv',
      'call2ApiSrv',
      '$q',
      function($cookies, $window, paramsSrv, httpSrv, call2ApiSrv, $q) {
        var prom;
        return function(options) {
          var defer = $q.defer(),
            requestConfig = {
              url: options.url,
              method: 'GET',
              responseType: 'json'
            };
          (prom || (prom =
            (options.apiCall ?
              call2ApiSrv.makeGetSignCall(options.url, {}, 'json') :
              httpSrv.request(requestConfig)
            )
          ))
            .then(function(data) {
              // Save the data in a cookie;
              angular.forEach(paramsSrv, function(value, key) {
                $cookies[key] = value;
              });

              data = data || {};
              // Regular translation structure
              if (data[options.key]) {
                defer.resolve(data[options.key])
              }
              // IFE structure: TranslationKeyValuePairs
              // TODO: improve this setting up in options to make it generic
              else if (data.hasOwnProperty('TranslationKeyValuePairs')) {
                var keys = data.TranslationKeyValuePairs,
                  len = keys.length,
                  map = {};
                // Fastest loop
                do { if(keys[len]) {
                  // Map translation keys
                  map[keys[len].Key] = keys[len].Value;
                } } while (len--);
                defer.resolve(map)
              }
              // Error
              else {
                defer.reject('Error in ciTranslationLoader');
              }
            }, function(error) {
              var notRedirected = ['ciapipreprod', 'ciapiqat', 'staging', 'advantagelite', 'advantageweb', 'localhost', 'lite'];
              var thisHostname = $window.location.hostname.split('.')[0].toLowerCase();
              if(_.indexOf(notRedirected, thisHostname) == -1) {
                $window.location = "https://" + $window.location.hostname + '/login/';
              } else {
                $window.location = "https://" + $window.location.hostname + '/web/loginwlite/';
              }
              defer.reject(error);
            });
          return defer.promise;
        }
      }
    ])


  /**
   * @name translateSrv
   * @typedef {Factory}
   * @description Core service
   */
    .factory('translateSrv', [
      '$q',
      '$translate',
      '$rootScope',

      function($q, $translate, $rootScope) {
        var self = {},
          currentCode,
          cultures,
          srvReady = false,
          srvPending = [];

        /**
         * @name init
         * @description Trigger initial.
         */
        self.init = function init() {
          // Set by default until async call
          var code = $translate.proposedLanguage() || $translate.use() || 'en';
          currentCode = code.split('_')[0];

          $rootScope.$on('$translateChangeSuccess', function(evt, data) {
            var lang = data.language;
            // Set "lang" attr to HTML Tag
            document.documentElement.setAttribute('lang', lang);
            // Trigger custom event
            $rootScope.$broadcast('translateSrv::ready', self);
            srvReady = true;
            _.each(srvPending,function(func){
              func();
            });
          });
        };


        /**
         * @name onReady
         * @description Fallback for the event
         */
        self.onReady = function() {
          console.log('on ready');
          var deferred = $q.defer();

          if(srvReady) {
            deferred.resolve();
          } else {
            srvPending.push(function(){
              deferred.resolve();
            });
          }

          return deferred.promise;
        };


        /**
         * @name t
         * @description Synchronous method for instant translation. To use this
         *   method asynchronously, use it inside of translateSrv::ready event.
         * @returns {String}
         */
        self._ = function() {
          return $translate.instant.apply($translate, arguments);
        };


        /**
         * @name setConfigCultures
         * @description Configures this services with culture one.
         * @param configCultures {Object}
         */
        self.setConfigCultures = function(configCultures) {
          if (!configCultures) {
            throw new Error('configCultures must be defined');
          } else {
            cultures = configCultures;
          }
        };


        /**
         * @name setLanguage
         * @description Set a new language from the directive.
         * @param selectedCode {String}
         * @returns promise {Object}
         */
        self.setLanguage = function(selectedCode) {
          currentCode = selectedCode;
          return $translate.use(selectedCode);
        };


        /**
         * @name getCurrentLang
         * @description Gets the selected culture object.
         * @returns formatted {Object}
         */
        self.getCurrentLang = function(config) {
          config = config || {};
          return (
            _.find(cultures, { code: currentCode }) ||
            cultures[config.missing]
          );
        };

        return self;
      }
    ]);
})();
