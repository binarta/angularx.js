angular.module('bootstrap.ex', [])
    .service('binModal', function () {
        this.open = jasmine.createSpy('open');
        this.close = jasmine.createSpy('close');
    });