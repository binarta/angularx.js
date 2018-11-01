angular.module('i18n', []).service('i18nLocation', [I18nLocationService]);

function I18nLocationService() {
    this.path = jasmine.createSpy('i18nLocation.path');
}