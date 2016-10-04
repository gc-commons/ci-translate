describe(':: translateSrv', function() {
  var translateSrv,
    cultures,
    $rootScope,
    $httpBackend,
    $translate;

  beforeEach(module('ci_translate'));

  beforeEach(function() {
    module(function($translateProvider) {
      $translateProvider
        .useLoader('ciTranslationLoader', { url: 'translations.json' })
        .preferredLanguage('en');
    });

    inject(function(_translateSrv_, _$translate_, _$rootScope_, _$httpBackend_) {
      translateSrv = _translateSrv_;
      $rootScope = _$rootScope_.$new();
      $httpBackend = _$httpBackend_;
      $translate = _$translate_;
      cultures = window.translateMock.cultureData;
      spyOn($rootScope, '$broadcast');

      $httpBackend.whenGET(/.*\/.*locale.*\.js/).respond(201, {});
      translateSrv.setConfigCultures(cultures);
    })
  });

  describe(':: Success GET translation.json', function() {
    beforeEach(function() {
      $httpBackend.whenGET('translations.json').respond(201, {
        en: { lgn_username: 'Account Number' }
      });
      $httpBackend.flush();
    });

    it(':: $translateChangeSuccess event', function() {
      $rootScope.$broadcast('$translateChangeSuccess');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('$translateChangeSuccess');
    });

    it(':: setConfigCultures() -> Fails when is not defined', function() {
      expect(function() { translateSrv.setConfigCultures(); })
        .toThrow(new Error('configCultures must be defined'));
    });

    it(':: setLanguage()', function() {
      translateSrv.setLanguage('de');
      expect(translateSrv.getCurrentLang())
        .toEqual({
          textDirection: 'leftToRight',
          cultureId: 7,
          code: 'de',
          name: 'German'
        });
    });

    it(':: getCurrentLang()', function() {
      translateSrv.setLanguage('unknown');
      expect(translateSrv.getCurrentLang()).toBeUndefined();
      expect(translateSrv.getCurrentLang({
        missing: 'es'
      })).toEqual({
        textDirection: 'leftToRight',
        cultureId: 85,
        code: 'es',
        name: 'Spanish'
      });
    });

    it(':: _()', function() {
      var text = translateSrv._('lgn_username');
      expect(typeof text).toBe('string');
      expect(text).toEqual('Account Number');
    });
  });

  describe(':: Fail GET translations.json', function() {
    beforeEach(function() {
      $httpBackend.whenGET('translations.json').respond(501, {});
      $httpBackend.flush();
    });

    it(':: ciTranslationLoader Factory', function() { });
  });
});
