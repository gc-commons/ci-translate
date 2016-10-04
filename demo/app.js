(function() {
  'use strict';

  angular
    .module('DemoApp', ['ci_translate'])

    // Required config for angular-translate / ci_translate modules
    .config(function($translateProvider) {
      $translateProvider
        .useLoader('ciTranslationLoader', { url: 'translations.json' })
        .preferredLanguage('en');
    })

    .controller('DemoCtrl', [
      '$log',
      '$scope',
      'translateSrv',

      function($log, $scope, translateSrv) {
        $scope.$on('translateSrv::ready', function(evt, t) {
          // t is a reference of translateSrv
          $log.debug('with _() -> lgn_remember:', t._('lgn_remember'));
        });

        translateSrv.setConfigCultures({
          de: {
            'textDirection': "leftToRight",
            'cultureId': 7,
            'code': "de",
            'name': "German"
          },
          he: {
            'textDirection': "rightToLeft",
            'cultureId': 12,
            'code': "he",
            'name': "Hebrew"
          },
          hu: {
            'textDirection': "leftToRight",
            'cultureId': 13,
            'code': "hu",
            'name': "Hungarian"
          },
          ru: {
            'textDirection': "leftToRight",
            'cultureId': 23,
            'code': "ru",
            'name': "Russian"
          },
          pl: {
            'textDirection': "leftToRight",
            'cultureId': 20,
            'code': "pl",
            'name': "Polish"
          },
          en: {
            'textDirection': "leftToRight",
            'cultureId': 69,
            'code': "en",
            'name': "English"
          },
          es: {
            'textDirection': "leftToRight",
            'cultureId': 85,
            'code': "es",
            'name': "Spanish"
          },
          zh: {
            'textDirection': "leftToRight",
            'cultureId': 161,
            'code': "zh",
            'name': "Simplified Chinese"
          },
          ar: {
            'textDirection': "rightToLeft",
            'cultureId': 162,
            'code': "ar",
            'name': "Modern Standard Arabic"
          }
        });
      }
    ]);
})();