angular.module('config', [])
    .factory('config', function () {
        return {};
    });

angular.module('checkpoint', [])
    .factory('activeUserHasPermission', ['activeUserHasPermissionHelper', function (activeUserHasPermissionHelper) {
        return function (response, permission) {
            if (permission == 'unauthorized') response.no();
            if (permission == 'authorized') response.yes();
            activeUserHasPermissionHelper.scope = response.scope;
        };
    }])
    .factory('activeUserHasPermissionHelper', function () {
        return {};
    });

describe('angularx', function () {
    beforeEach(module('angularx'));

    describe('binSplitInRows directive', function () {
        var $compile, element, html, scope, viewport, viewportListenerIsDestroyed;

        beforeEach(inject(function ($rootScope, _$compile_, _viewport_) {
            $compile = _$compile_;
            scope = $rootScope.$new();
            scope.collection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            viewport = _viewport_;
            viewport.onChange = function (callback) {
                callback('xs');
                return function () {
                    viewportListenerIsDestroyed = true;
                };
            };
            viewportListenerIsDestroyed = false;
        }));

        [
            {
                attrs: 'columns="0"',
                expected: []
            },
            {
                attrs: 'columns="1"',
                expected: [
                {id: 0, items: [1]},
                {id: 1, items: [2]},
                {id: 2, items: [3]},
                {id: 3, items: [4]},
                {id: 4, items: [5]},
                {id: 5, items: [6]},
                {id: 6, items: [7]},
                {id: 7, items: [8]},
                {id: 8, items: [9]},
                {id: 9, items: [10]}
            ]
            },
            {
                attrs: 'columns="2"',
                expected: [
                {id: 0, items: [1, 2]},
                {id: 1, items: [3, 4]},
                {id: 2, items: [5, 6]},
                {id: 3, items: [7, 8]},
                {id: 4, items: [9, 10]}
            ]
            },
            {
                attrs: 'columns="3"',
                expected: [
                {id: 0, items: [1, 2, 3]},
                {id: 1, items: [4, 5, 6]},
                {id: 2, items: [7, 8, 9]},
                {id: 3, items: [10]}
            ]
            },
            {
                attrs: 'columns="4"',
                expected: [
                {id: 0, items: [1, 2, 3, 4]},
                {id: 1, items: [5, 6, 7, 8]},
                {id: 2, items: [9, 10]}
            ]
            },
            {
                attrs: 'columns="5"',
                expected: [
                {id: 0, items: [1, 2, 3, 4, 5]},
                {id: 1, items: [6, 7, 8, 9, 10]}
            ]
            },
            {
                attrs: 'columns="6"',
                expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6]},
                {id: 1, items: [7, 8, 9, 10]}
            ]
            },
            {
                attrs: 'columns="7"',
                expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7]},
                {id: 1, items: [8, 9, 10]}
            ]
            },
            {
                attrs: 'columns="8"',
                expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8]},
                {id: 1, items: [9, 10]}
            ]
            },
            {
                attrs: 'columns="9"',
                expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9]},
                {id: 1, items: [10]}
            ]
            },
            {
                attrs: 'columns="10"',
                expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            ]
            }
        ].forEach(function (value) {
                describe('creates rows for collection', function () {
                    beforeEach(inject(function ($rootScope) {
                        html = '<div bin-split-in-rows="collection" ' + value.attrs + '></div>';
                        element = angular.element(html);
                        $compile(element)(scope);
                        scope.$digest();
                    }));

                    it('given column attributes: ' + value.attrs, function () {
                        expect(scope.rows).toEqual(value.expected);
                    });
                });
            });

        describe('with column count of 3', function () {
            beforeEach(function () {
                html = '<div bin-split-in-rows="collection" columns="3"></div>';
                element = angular.element(html);
                $compile(element)(scope);
            });

            describe('when the collection changes', function () {
                beforeEach(function () {
                    scope.$digest();
                    scope.collection.push(11);
                    scope.collection.push(12);
                    scope.collection.push(13);
                    scope.$digest();
                });

                it('update rows', function () {
                    expect(scope.rows).toEqual([
                        {id: 0, items: [1, 2, 3]},
                        {id: 1, items: [4, 5, 6]},
                        {id: 2, items: [7, 8, 9]},
                        {id: 3, items: [10, 11, 12]},
                        {id: 4, items: [13]}
                    ]);
                });

                it('previous viewport listener is unregistered', function () {
                    expect(viewportListenerIsDestroyed).toBeTruthy();
                });
            });

            it('when the collection is undefined', function () {
                scope.collection = undefined;
                scope.$digest();

                expect(scope.rows).toBeUndefined();
            });
        });

        describe('responsive columns', function () {
            beforeEach(function () {
                html = '<div bin-split-in-rows="collection" col-xs="1" col-sm="2" col-md="3" col-lg="4"></div>';
                element = angular.element(html);
                $compile(element)(scope);
            });

            it('with viewport xs', function () {
                viewport.onChange = function (callback) {
                    callback('xs');
                };
                scope.$digest();

                expect(scope.rows).toEqual([
                    {id: 0, items: [1]},
                    {id: 1, items: [2]},
                    {id: 2, items: [3]},
                    {id: 3, items: [4]},
                    {id: 4, items: [5]},
                    {id: 5, items: [6]},
                    {id: 6, items: [7]},
                    {id: 7, items: [8]},
                    {id: 8, items: [9]},
                    {id: 9, items: [10]}
                ]);
                expect(scope.columns).toEqual(1);
            });

            it('with viewport sm', function () {
                viewport.onChange = function (callback) {
                    callback('sm');
                };
                scope.$digest();

                expect(scope.rows).toEqual([
                    {id: 0, items: [1, 2]},
                    {id: 1, items: [3, 4]},
                    {id: 2, items: [5, 6]},
                    {id: 3, items: [7, 8]},
                    {id: 4, items: [9, 10]}
                ]);
                expect(scope.columns).toEqual(2);
            });

            it('with viewport md', function () {
                viewport.onChange = function (callback) {
                    callback('md');
                };
                scope.$digest();

                expect(scope.rows).toEqual([
                    {id: 0, items: [1, 2, 3]},
                    {id: 1, items: [4, 5, 6]},
                    {id: 2, items: [7, 8, 9]},
                    {id: 3, items: [10]}
                ]);
                expect(scope.columns).toEqual(3);
            });

            it('with viewport lg', function () {
                viewport.onChange = function (callback) {
                    callback('lg');
                };
                scope.$digest();

                expect(scope.rows).toEqual([
                    {id: 0, items: [1, 2, 3, 4]},
                    {id: 1, items: [5, 6, 7, 8]},
                    {id: 2, items: [9, 10]}
                ]);
                expect(scope.columns).toEqual(4);
            });
        });

        it('fallback to 1 column', function () {
            html = '<div bin-split-in-rows="collection"></div>';
            element = angular.element(html);
            $compile(element)(scope);
            scope.$digest();

            expect(scope.rows).toEqual([
                {id: 0, items: [1]},
                {id: 1, items: [2]},
                {id: 2, items: [3]},
                {id: 3, items: [4]},
                {id: 4, items: [5]},
                {id: 5, items: [6]},
                {id: 6, items: [7]},
                {id: 7, items: [8]},
                {id: 8, items: [9]},
                {id: 9, items: [10]}
            ]);
        });

        describe('on destroy', function () {
            beforeEach(function () {
                html = '<div bin-split-in-rows="collection"></div>';
                element = angular.element(html);
                $compile(element)(scope);
                scope.$digest();
            });

            it('viewport listener is unregistered', function () {
                scope.$destroy();

                expect(viewportListenerIsDestroyed).toBeTruthy();
            });
        });
    });

    describe('binSplitInColumns directive', function () {
        var element, html, scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.collection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            scope.cols = 3;
            html = '<div bin-split-in-columns="collection" columns="cols"></div>';
            element = angular.element(html);
            $compile(element)(scope);
        }));

        [
            {columns: 0, expected: []},
            {
                columns: 1, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            ]
            },
            {
                columns: 2, expected: [
                {id: 0, items: [1, 3, 5, 7, 9]},
                {id: 1, items: [2, 4, 6, 8, 10]}
            ]
            },
            {
                columns: 3, expected: [
                {id: 0, items: [1, 4, 7, 10]},
                {id: 1, items: [2, 5, 8]},
                {id: 2, items: [3, 6, 9]}
            ]
            },
            {
                columns: 4, expected: [
                {id: 0, items: [1, 5, 9]},
                {id: 1, items: [2, 6, 10]},
                {id: 2, items: [3, 7]},
                {id: 3, items: [4, 8]}
            ]
            },
            {
                columns: 5, expected: [
                {id: 0, items: [1, 6]},
                {id: 1, items: [2, 7]},
                {id: 2, items: [3, 8]},
                {id: 3, items: [4, 9]},
                {id: 4, items: [5, 10]}
            ]
            },
            {
                columns: 6, expected: [
                {id: 0, items: [1, 7]},
                {id: 1, items: [2, 8]},
                {id: 2, items: [3, 9]},
                {id: 3, items: [4, 10]},
                {id: 4, items: [5]},
                {id: 5, items: [6]}
            ]
            },
            {
                columns: 7, expected: [
                {id: 0, items: [1, 8]},
                {id: 1, items: [2, 9]},
                {id: 2, items: [3, 10]},
                {id: 3, items: [4]},
                {id: 4, items: [5]},
                {id: 5, items: [6]},
                {id: 6, items: [7]}
            ]
            },
            {
                columns: 8, expected: [
                {id: 0, items: [1, 9]},
                {id: 1, items: [2, 10]},
                {id: 2, items: [3]},
                {id: 3, items: [4]},
                {id: 4, items: [5]},
                {id: 5, items: [6]},
                {id: 6, items: [7]},
                {id: 7, items: [8]}
            ]
            }
        ].forEach(function (value) {
                describe('creates columns for collection', function () {
                    beforeEach(inject(function ($rootScope, $compile) {
                        html = '<div bin-split-in-columns="collection" columns="' + value.columns + '"></div>';
                        element = angular.element(html);
                        $compile(element)(scope);
                        scope.$digest();
                    }));

                    it('given column count ' + value.columns, function () {
                        expect(scope.columns).toEqual(value.expected);
                    });
                });
            });

        it('when the collection is undefined', function () {
            scope.collection = undefined;
            scope.$digest();

            expect(scope.columns).toBeUndefined();
        });

        it('when the collection changes', function () {
            scope.collection.push(11);
            scope.collection.push(12);
            scope.collection.push(13);
            scope.$digest();

            expect(scope.columns).toEqual([
                {id: 0, items: [1, 4, 7, 10, 13]},
                {id: 1, items: [2, 5, 8, 11]},
                {id: 2, items: [3, 6, 9, 12]}
            ]);
        });
    });

    describe('binGroupBy directive', function () {
        var element, html, scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.collection = [
                {field: 1},
                {field: 2},
                {field: 1}
            ];
            html = '<div bin-group-by="field" on="collection"></div>';
            element = angular.element(html);
            $compile(element)(scope);
        }));

        it('creates groups', function () {
            scope.$digest();

            expect(scope.groups).toEqual([
                {
                    items: [
                        {field: 1},
                        {field: 1}
                    ], id: 0
                },
                {
                    items: [
                        {field: 2}
                    ], id: 1
                }
            ]);
        });

        it('when the collection is undefined', function () {
            scope.collection = undefined;
            scope.$digest();

            expect(scope.groups).toBeUndefined();
        });

        it('when the collection changes', function () {
            scope.collection.push({field: 3});
            scope.$digest();

            expect(scope.groups).toEqual([
                {
                    items: [
                        {field: 1},
                        {field: 1}
                    ], id: 0
                },
                {
                    items: [
                        {field: 2}
                    ], id: 1
                },
                {
                    items: [
                        {field: 3}
                    ], id: 2
                }
            ]);
        });
    });

    describe('binExposeBoxWidth directive', function () {
        var scope, $rootScope;

        beforeEach(inject(function (_$rootScope_, $compile) {
            var element = angular.element('<div style="width: 100px;" bin-expose-box-width></div>');
            $rootScope = _$rootScope_;
            $compile(element)($rootScope);
            scope = element.scope();
        }));

        it('test', function () {
            expect(scope.boxWidth).toEqual(100);
        });

        it('uses child scope', function () {
            expect(scope.$parent).toEqual($rootScope);
        });
    });

    describe('resourceLoader service', function () {
        var loader, document, scope, ajaxDeferred, logger;

        beforeEach(inject(function ($document, resourceLoader, $rootScope, $q, $log) {
            $document.find('head').empty();
            document = $document;
            scope = $rootScope;
            loader = resourceLoader;
            logger = $log;

            ajaxDeferred = $q.defer();
            jQuery.ajax = jasmine.createSpy('ajax').and.returnValue(ajaxDeferred.promise);
        }));

        describe('on getScript', function () {
            var loaded, failed;

            beforeEach(function () {
                loaded = false;
                failed = false;

                loader.getScript('test.js').then(function () {
                    loaded = true;
                }, function () {
                    failed = true;
                });
            });

            it('do a cached ajax request for the script', function () {
                expect(jQuery.ajax).toHaveBeenCalledWith({
                    url: 'test.js',
                    dataType: 'script',
                    cache: true
                });
            });

            describe('on success', function () {
                beforeEach(function () {
                    ajaxDeferred.resolve();
                    scope.$digest();
                });

                it('promise is resolved', function () {
                    expect(loaded).toBeTruthy();
                });

                it('getting the same script again does not do new request', function () {
                    loader.getScript('test.js');

                    expect(jQuery.ajax.calls.count()).toEqual(1);
                });

                it('getting another script does new request', function () {
                    loader.getScript('new.js');

                    expect(jQuery.ajax.calls.count()).toEqual(2);
                });
            });

            describe('on failed', function () {
                beforeEach(function () {
                    ajaxDeferred.reject();
                    scope.$digest();
                });

                it('promise is rejected', function () {
                    expect(failed).toBeTruthy();
                });

                it('log a warning', function () {
                    expect(logger.warn.logs[0]).toEqual(['Failed to load script: test.js']);
                });

                it('getting the same script again does new request', function () {
                    loader.getScript('test.js');

                    expect(jQuery.ajax.calls.count()).toEqual(2);
                });
            });
        });

        it('service uses a new child scope', function () {
            expect(scope.resources).toEqual([]);
        });

        it('add a stylesheet to the dom', function () {
            loader.add('test.css');

            expect(document.find('head').html()).toContain('<link rel="stylesheet" type="text/css" href="test.css" class="ng-scope">');
            expect(scope.resources['test.css']).toBeDefined();
        });

        it('add a script to the dom', function () {
            loader.add('/base/test/test.js');

            expect(document.find('head').html()).toContain('<script src="/base/test/test.js" async="" class="ng-scope"></script>');
            expect(scope.resources['/base/test/test.js']).toBeDefined();
        });

        it('add a script that does not end with js-extension to the dom', function () {
            loader.addScript('/base/test/test.txt');

            expect(document.find('head').html()).toContain('<script src="/base/test/test.txt" async="" class="ng-scope"></script>');
            expect(scope.resources['/base/test/test.txt']).toBeDefined();
        });

        it('avoid the same stylesheet to be added', function () {
            loader.add('test.css');
            loader.add('test.css');

            var occurrences = document.find('head').html().split("test.css").length - 1;

            expect(occurrences).toEqual(1);
        });

        it('avoid the same script to be added', function () {
            loader.add('/base/test/test.js');
            loader.add('/base/test/test.js');

            var occurrences = document.find('head').html().split("/base/test/test.js").length - 1;

            expect(occurrences).toEqual(1);
        });

        it('remove a stylesheet', function () {
            loader.add('test.css');
            loader.remove('test.css');

            expect(document.find('head').html()).not.toContain('<link rel="stylesheet" type="text/css" href="test.css" class="ng-scope">');
            expect(scope.resources['test.css']).toBeUndefined();
        });

        it('remove a script', function () {
            loader.add('/base/test/test.js');
            loader.remove('/base/test/test.js');

            expect(document.find('head').html()).not.toContain('<script src="/base/test/test.js" class="ng-scope"></script>');
            expect(scope.resources['/base/test/test.js']).toBeUndefined();
        });
    });

    describe('binTemplate service', function () {
        var binTemplate, scope, config;

        beforeEach(inject(function (_binTemplate_, $rootScope, _config_) {
            binTemplate = _binTemplate_;
            scope = $rootScope.$new();
            config = _config_;
        }));

        describe('when setting the templateUrl to scope', function () {
            it('default template url', function () {
                binTemplate.setTemplateUrl({
                    scope: scope,
                    module: 'test',
                    name: 'test.html'
                });

                expect(scope.templateUrl).toEqual('bower_components/binarta.test.angular/template/test.html');
            });

            it('template url with specific styling', function () {
                config.styling = 'styling';

                binTemplate.setTemplateUrl({
                    scope: scope,
                    module: 'test',
                    name: 'test.html'
                });

                expect(scope.templateUrl).toEqual('bower_components/binarta.test.angular/template/styling/test.html');
            });

            it('template url with specific components dir', function () {
                config.componentsDir = 'components';

                binTemplate.setTemplateUrl({
                    scope: scope,
                    module: 'test',
                    name: 'test.html'
                });

                expect(scope.templateUrl).toEqual('components/binarta.test.angular/template/test.html');
            });

            describe('when given a permission', function () {
                it('scope is given to authorize usecase', inject(function (activeUserHasPermissionHelper) {
                    binTemplate.setTemplateUrl({
                        scope: scope,
                        module: 'test',
                        name: 'test.html',
                        permission: 'test'
                    });

                    expect(activeUserHasPermissionHelper.scope).toEqual(scope);
                }));

                it('unauthorized', function () {
                    binTemplate.setTemplateUrl({
                        scope: scope,
                        module: 'test',
                        name: 'test.html',
                        permission: 'unauthorized'
                    });

                    expect(scope.templateUrl).toBeUndefined();
                });

                it('authorized', function () {
                    binTemplate.setTemplateUrl({
                        scope: scope,
                        module: 'test',
                        name: 'test.html',
                        permission: 'authorized'
                    });

                    expect(scope.templateUrl).toEqual('bower_components/binarta.test.angular/template/test.html');
                });
            });
        });
    });

    describe('binToggle directive', function () {
        var $scope;

        describe('when linked without arguments', function () {
            beforeEach(inject(function ($rootScope, $compile) {
                var element = angular.element('<div bin-toggle></div>');
                $compile(element)($rootScope);
                $scope = element.scope();
            }));

            it('then toggle starts out disabled', function () {
                expect($scope.toggleDisabled).toEqual(true);
                expect($scope.toggleEnabled).toEqual(false);
            });

            describe('and calling toggle', function () {
                beforeEach(function () {
                    $scope.toggle();
                });

                it('then toggle is enabled', function () {
                    expect($scope.toggleDisabled).toEqual(false);
                    expect($scope.toggleEnabled).toEqual(true);
                });

                describe('and calling toggle again', function () {
                    beforeEach(function () {
                        $scope.toggle();
                    });

                    it('then toggle is disabled again', function () {
                        expect($scope.toggleDisabled).toEqual(true);
                        expect($scope.toggleEnabled).toEqual(false);
                    });
                });
            });
        });
    });

    describe('predicated barrier', function () {
        var barrier, clock, success, args;

        beforeEach(inject(function (predicatedBarrier, binDateController) {
            barrier = predicatedBarrier;
            clock = binDateController;
            clock.freeze();
            success = jasmine.createSpy('successHandler');
            args = {};
        }));

        afterEach(function() {
            clock.resume();
        });

        function execute() {
            return barrier(args);
        }

        it('when no predicate then auto complete', inject(function ($rootScope) {
            execute().then(success);
            $rootScope.$apply();
            expect(success.calls.count()).toEqual(1);
        }));

        describe('given predicate', function () {
            var predicate, d;
            var count = 0;

            beforeEach(inject(function ($q) {
                d = $q.defer();
                predicate = function() {
                    count++;
                    return d.promise;
                };
                args.predicate = predicate;
            }));

            function testPredicateFor(args) {
                return inject(function ($rootScope) {
                    args.resolvesTo ? d.resolve() : d.reject();
                    $rootScope.$apply();
                    execute().then(success);
                    $rootScope.$apply();
                    expect(success.calls.count()).toEqual(args.resolvesTo ? 1 : 0);
                })
            }

            it('when false then prevent success handler execution', testPredicateFor({resolvesTo: false}));

            it('when true execute success handler', testPredicateFor({resolvesTo: true}));

            describe('and rejection handler', function () {
                var rejected;

                beforeEach(function () {
                    rejected = jasmine.createSpy('rejectionHandler');
                });

                it('when false execute rejection handler', inject(function ($rootScope) {
                    d.reject();
                    $rootScope.$apply();
                    execute().then(success, rejected);
                    $rootScope.$apply();
                    expect(rejected.calls.count()).toEqual(1);
                    expect(rejected.calls.first().args[0]).toEqual('timeout');
                }));

                describe('and timeout', function() {
                    var count = 10;
                    var duration = 1000;
                    var now;

                    beforeEach(function() {
                        now = new Date();
                        args.timeout = count * duration;
                        args.now = now;
                    });

                    it('then retries until timeout reached', inject(function($rootScope, $timeout) {
                        d.reject();
                        execute();
                        $timeout.flush();
                        expect(count).toEqual(10);
                    }));

                    it('when timeout reached then execute rejection handler', inject(function($timeout) {
                        d.reject();
                        execute().then(success, rejected);
                        clock.jump(clock.now().getTime()  + count * duration + 1);
                        //now.setTime(now.getTime() + count * duration);
                        //now.setTime(now.getTime() + 1);
                        $timeout.flush();
                        $timeout.flush();
                        expect(rejected.calls.count()).toEqual(1);
                        expect(rejected.calls.first().args[0]).toEqual('timeout');
                    }));

                    it('when true before timeout reached then execute success handler', inject(function($timeout) {
                        d.resolve();
                        execute().then(success, rejected);
                        $timeout.flush();
                        expect(success.calls.count()).toEqual(1);
                    }));
                });
            });
        });
    });

    describe('binBack', function() {
        var element, $compile, $rootScope;
        var path = 'P';

        beforeEach(inject(function(_$compile_, _$rootScope_, $window) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;

            $window.history = {
                back: function() {
                    path = 'B';
                }
            };
        }));

        describe('when element is clicked, go to previous path', function () {
            it('as attribute', function () {
                element = $compile('<div bin-back></div>')($rootScope);

                element.click();

                expect(path).toEqual('B');
            });

            it('as class', function () {
                element = $compile('<div class="bin-back"></div>')($rootScope);

                element.click();

                expect(path).toEqual('B');
            });
        });
    });

    describe('binClickOutside', function () {
        var scope, element, $compile, $rootScope, $document, $timeout;

        beforeEach(inject(function(_$compile_, _$rootScope_, _$document_, _$timeout_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $document = _$document_;
            $timeout = _$timeout_;

            scope = $rootScope.$new();
            scope.execute = jasmine.createSpy('execute');

            element = $compile('<div bin-click-outside="execute()"><div id="inside"></div></div>')(scope);
        }));

        describe('on click event', function () {
            it('if clicked inside element, do nothing', function () {
                element.find('#inside').trigger('click');
                $timeout.verifyNoPendingTasks();
                expect(scope.execute).not.toHaveBeenCalled();
            });

            it('if clicked on element, do nothing', function () {
                element.trigger('click');
                $timeout.verifyNoPendingTasks();
                expect(scope.execute).not.toHaveBeenCalled();
            });

            it('if clicked outside element, execute handler. ' +
                'Handler is wrapped inside $timeout to execute it safely in a new digest cycle.', function () {
                $document.trigger('click');
                $timeout.flush();
                expect(scope.execute).toHaveBeenCalled();
            });
        });

        describe('when touch device', function () {
            it('if tapped inside element, do nothing', function () {
                element.find('#inside').trigger('touchstart');
                element.find('#inside').trigger('touchend');
                $timeout.verifyNoPendingTasks();
                expect(scope.execute).not.toHaveBeenCalled();
            });

            it('if tapped on element, do nothing', function () {
                element.trigger('touchstart');
                element.trigger('touchend');
                $timeout.verifyNoPendingTasks();
                expect(scope.execute).not.toHaveBeenCalled();
            });

            it('if tapped outside element, execute handler', function () {
                $document.trigger('touchstart');
                $document.trigger('touchend');
                $timeout.flush();
                expect(scope.execute).toHaveBeenCalled();
            });

            it('when moved touch started, do nothing', function () {
                $document.trigger('touchstart');
                $document.trigger('touchmove');
                $document.trigger('touchend');
                $timeout.verifyNoPendingTasks();
                expect(scope.execute).not.toHaveBeenCalled();
            });
        });

        it('remove listener when element is destroyed', function () {
            scope.$destroy();
            $document.trigger('click');
            $document.trigger('touchstart');
            $document.trigger('touchmove');
            $document.trigger('touchend');
            $timeout.verifyNoPendingTasks();
            expect(scope.execute).not.toHaveBeenCalled();
        });
    });

    describe('autofocus directive', function () {
        var scope, element, $timeout;

        beforeEach(inject(function ($compile, $rootScope, _$timeout_) {
            $timeout = _$timeout_;
            scope = $rootScope.$new();
            element = angular.element('<div autofocus></div>');
            element[0].focus = jasmine.createSpy('focus');
            $compile(element)(scope);
        }));

        describe('after timeout', function () {
            beforeEach(function () {
                $timeout.flush();
            });

            it('set focus on element', function () {
                expect(element[0].focus).toHaveBeenCalled();
            });
        });
    });

    describe('ngClickConfirm directive', function () {
        var element, scope, modal;

        beforeEach(inject(function($rootScope, $compile, binModal) {
            modal = binModal;
            element = $compile('<div ng-click-confirm="test()"></div>')($rootScope);
            scope = element.scope();
            scope.test = jasmine.createSpy('spy');
        }));

        describe('when element is clicked', function () {
            beforeEach(function () {
                element[0].click();
            });

            it('modal is opened', function () {
                expect(modal.open).toHaveBeenCalledWith({
                    templateUrl: 'bin-click-confirm.html',
                    $ctrl: {
                        message: 'Are you sure?',
                        yes: jasmine.any(Function),
                        no: jasmine.any(Function)
                    }
                });
            });

            it('no handler, modal is closed', function () {
                modal.open.calls.mostRecent().args[0].$ctrl.no();
                expect(modal.close).toHaveBeenCalled();
            });

            describe('yes handler', function () {
                beforeEach(function () {
                    modal.open.calls.mostRecent().args[0].$ctrl.yes();
                });

                it('click handler is executed', function () {
                    expect(scope.test).toHaveBeenCalled();
                });

                it('modal is closed', function () {
                    expect(modal.close).toHaveBeenCalled();
                });
            });
        });

        describe('when confirm message is given', function () {
            beforeEach(inject(function ($compile, $rootScope) {
                element = $compile('<div ng-click-confirm="test()" confirm-message="message"></div>')($rootScope);
            }));

            describe('when element is clicked', function () {
                beforeEach(function () {
                    element[0].click();
                });

                it('modal is opened', function () {
                    expect(modal.open).toHaveBeenCalledWith({
                        templateUrl: 'bin-click-confirm.html',
                        $ctrl: {
                            message: 'message',
                            yes: jasmine.any(Function),
                            no: jasmine.any(Function)
                        }
                    });
                });
            });
        });
    });

    describe('OpenCloseMenuFSM', function() {
        var fsm, ctrl, scope;

        beforeEach(inject(function(openCloseMenuFSMFactory, $controller, $rootScope) {
            scope = $rootScope.$new();
            fsm = openCloseMenuFSMFactory({id:'x'});
            ctrl = $controller('OpenCloseMenuController', {$scope:scope});
            scope.connect({id:'x'})
        }));

        it('starts out closed', function() {
            expect(fsm.status()).toEqual('closed');
        });

        it('closing has no effect', function() {
            fsm.close();
            expect(fsm.status()).toEqual('closed');
        });

        it('toggle opens', function() {
            fsm.toggle();
            expect(fsm.status()).toEqual('opened');
        });

        describe('when opening', function() {
            beforeEach(function() {
                fsm.open();
            });

            it('then menu is opened', function() {
                expect(fsm.status()).toEqual('opened');
            });

            it('and opening again has no effect', function() {
                fsm.open();
                expect(fsm.status()).toEqual('opened');
            });

            it('and closing again', function() {
                fsm.close();
                expect(fsm.status()).toEqual('closed');
            });

            it('toggle closes', function() {
                fsm.toggle();
                expect(fsm.status()).toEqual('closed');
            });

            it('creating an fsm with the same id returns the existing fsm', inject(function(openCloseMenuFSMFactory) {
                expect(openCloseMenuFSMFactory({id:'x'}).status()).toEqual('opened');
            }));

            it('creating an fsm with a different id', inject(function(openCloseMenuFSMFactory) {
                expect(openCloseMenuFSMFactory({id:'y'}).status()).toEqual('closed');
            }));
        });
    });

    describe('OptionsMenu', function() {
        var factory, menu;

        describe('optional configuration', function() {
            beforeEach(inject(function(optionsMenuFactory) {
                factory = optionsMenuFactory;
                menu = optionsMenuFactory({id:'MNO'});
            }));

            it('is empty', function() {
                expect(menu.options()).toEqual([]);
            });
        });

        describe('with configured options', function() {
            angular.module('MWO', ['angularx']).config(['optionsMenuFactoryProvider', function(config) {
                config.installOptions({
                    id:'MWO',
                    options:[{id:'O1'}, {id:'O2'}]
                });
            }]);

            beforeEach(module('MWO'));

            beforeEach(inject(function(optionsMenuFactory) {
                factory = optionsMenuFactory;
                menu = optionsMenuFactory({id:'MWO'});
            }));

            it('not empty', function() {
                expect(menu.options().length).toEqual(2);
            });

            it('no option is pre selected', function() {
                expect(menu.currentSelection()).toBeUndefined();
            });

            it('select an option', function() {
                menu.options()[0].select();
                expect(menu.currentSelection().id()).toEqual('O1');
            });
        });

        describe('with default option', function() {
            angular.module('MWDO', ['angularx']).config(['optionsMenuFactoryProvider', function(config) {
                config.installOptions({
                    id:'MWDO',
                    options:[{id:'O1'}, {id:'O2'}],
                    default:'O2'
                });
            }]);

            beforeEach(module('MWDO'));

            beforeEach(inject(function(optionsMenuFactory) {
                factory = optionsMenuFactory;
                menu = optionsMenuFactory({id:'MWDO'});
            }));

            it('option is pre selected', function() {
                expect(menu.currentSelection().id()).toEqual('O2');
            });

            it('select an option', function() {
                menu.options()[0].select();
                expect(menu.currentSelection().id()).toEqual('O1');
            });
        });

        describe('with callbacks', function() {
            var persistedOption = 'O2';
            var capturedResponseHandlers;

            var reader = function(response) {
                response.success(persistedOption);
            };
            var writer = function(option, response) {
                persistedOption = option;
                capturedResponseHandlers = response;
            };

            angular.module('MWC', ['angularx'])
                .config(['optionsMenuFactoryProvider', function(config) {
                    config.installOptions({
                        id:'MWC',
                        options:[{id:'O1'}, {id:'O2'}],
                        default:'O1'
                    });
                }])
                .run(['optionsMenuFactory', function(factory) {
                    factory({id:'MWC'}).installIOHandlers({
                        reader:reader,
                        writer:writer
                    });
                }]);

            beforeEach(module('MWC'));
            beforeEach(inject(function(optionsMenuFactory) {
                factory = optionsMenuFactory;
                menu = optionsMenuFactory({id:'MWC'});
            }));

            it('reader overrides default option', function() {

                expect(menu.currentSelection().id()).toEqual('O2');
            });

            describe('save currently selected option', function() {
                beforeEach(function() {
                    menu.options()[0].select();
                    menu.saveCurrentSelection('response handlers');
                });

                it('captured currently selected option', function() {
                    expect(persistedOption).toEqual('O1');
                });

                it('captured response handlers', function() {
                    expect(capturedResponseHandlers).toEqual('response handlers');
                });
            });
        });
    });

    describe('angular.merge', function() {
        it('merge 2 maps', function() {
            var left = {a:'a'};
            var right = {b:'b'};
            expect(angular.merge(left, right)).toEqual({a:'a',b:'b'});
        });

        it('right side overwrites left side', function() {
            var left = {a:'a', b:'b'};
            var right = {b:'c'};
            expect(angular.merge(left, right)).toEqual({a:'a', b:'c'});
        });

        it('merge into a destination', function() {
            var dst = {};
            var left = {a:'a'};
            var right = {b:'b'};
            angular.merge(dst, left, right);
            expect(dst).toEqual({a:'a', b:'b'})
        })
    });

    describe('binTruncate filter', function () {
        var filter;

        beforeEach(inject(function (binTruncateFilter) {
            filter = binTruncateFilter;
        }));

        it('no input', function () {
            expect(filter()).toBeUndefined();
        });

        it('and basic string with undefined length', function () {
            expect(filter('some words to truncate')).toEqual('some words to truncate');
        });

        it('default to a length of 50 chars', function () {
            expect(filter('some words to truncate and see if by default only 50 chars are shown.'))
                .toEqual('some words to truncate and see if by default only \u2026');
        });

        it('and basic string with no length', function () {
            expect(filter('some words to truncate', 0)).toEqual('\u2026');
        });

        describe('given a length', function () {
            it('and empty string', function () {
                expect(filter('', 2)).toBeUndefined();
            });

            it('and basic string', function () {
                expect(filter('some words to truncate', 11)).toEqual('some words \u2026');
            });

            it('and string contains html', function () {
                expect(filter('<strong>some words to</strong> truncate', 11)).toEqual('<strong>some words \u2026</strong>');
                expect(filter('<p>foo</p> <p>bar</p>', 3)).toEqual('\u2026');
                expect(filter('<p><a href="http://www.xyz.com/aaaaaaaaaaaaaaaaaaa.html" target="_blank">aaaaaaaaaaaaaaaaaa</a></p> <ul> <li>bbbbbbbb</li> <li>cccccccccccc</li> </ul> <p><a href="http://www.xyz.com/abc.html" target="_blank">dddddddddddd</a></p>'))
                    .toEqual('<p><a href="http://www.xyz.com/aaaaaaaaaaaaaaaaaaa.html" target="_blank">aaaaaaaaaaaaaaaaaa</a></p> <ul> <li>bbbbbbbb</li> <li>cccccccccccc</li> </ul> \u2026');
            });

            [
                {
                    length: 0,
                    expected: '\u2026'
                }, {
                    length: 1,
                    expected: '\u2026'
                }, {
                    length: 2,
                    expected: '\u2026'
                }, {
                    length: 3,
                    expected: '\u2026'
                }, {
                    length: 4,
                    expected: '\u2026'
                }, {
                    length: 5,
                    expected: 'some \u2026'
                }, {
                    length: 6,
                    expected: 'some \u2026'
                }, {
                    length: 7,
                    expected: 'some \u2026'
                }, {
                    length: 8,
                    expected: 'some \u2026'
                }, {
                    length: 9,
                    expected: 'some \u2026'
                }, {
                    length: 10,
                    expected: 'some \u2026'
                }, {
                    length: 11,
                    expected: 'some <a href="http://test.com">words \u2026</a>'
                }, {
                    length: 12,
                    expected: 'some <a href="http://test.com">words \u2026</a>'
                }, {
                    length: 13,
                    expected: 'some <a href="http://test.com">words \u2026</a>'
                }, {
                    length: 14,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 15,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 16,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 16,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 17,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 18,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 19,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 20,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 21,
                    expected: 'some <a href="http://test.com">words to</a> \u2026'
                }, {
                    length: 22,
                    expected: 'some <a href="http://test.com">words to</a> <ul><li>truncate</li></ul>'
                }, {
                    length: 50,
                    expected: 'some <a href="http://test.com">words to</a> <ul><li>truncate</li></ul>'
                }
            ].forEach(function (test) {
                    it('with length ' + test.length, function () {
                        var actual = 'some <a href="http://test.com">words to</a> <ul><li>truncate</li></ul>';

                        expect(filter(actual, test.length)).toEqual(test.expected);
                    });
                });

        });
    });

    describe('binTruncate filter', function () {
        var filter;

        beforeEach(inject(function (binStripHtmlTagsFilter) {
            filter = binStripHtmlTagsFilter;
        }));

        it('no input', function () {
            expect(filter()).toBeUndefined();
        });

        it('no tags in string', function () {
            expect(filter('The quick brown fox jumps over the lazy dog'))
                .toEqual('The quick brown fox jumps over the lazy dog');
        });

        it('basic tags in string', function () {
            expect(filter('<p>The <strong>quick</strong> brown fox <i>jumps</i> over the lazy dog</p>'))
                .toEqual('The quick brown fox jumps over the lazy dog');
        });

        it('more advanced tags with attributes', function () {
            expect(filter('<p style="text-align: center;">The <strong foo>quick</strong> brown fox <i class="bar">jumps</i> over the lazy dog</p>'))
                .toEqual('The quick brown fox jumps over the lazy dog');
        });
    });

    describe('binEncodeUri filter', function () {
        var filter, $window;

        beforeEach(inject(function (binEncodeUriComponentFilter, _$window_) {
            $window = _$window_;
            filter = binEncodeUriComponentFilter;
        }));

        it('encode string', function () {
            var string = 'test string with some spaces and a http://url';

            expect(filter(string)).toEqual($window.encodeURIComponent(string));
        });
    });

    describe('binDebounce', function () {
        var $timeout, binDebounce, called;
        var callback = function (){
            called++;
        };
        
        beforeEach(inject(function (_$timeout_, _binDebounce_) {
            $timeout = _$timeout_;
            binDebounce = _binDebounce_;

            called = 0;
        }));

        it('callback is debounced', function () {
            var debounced = binDebounce(callback);
            debounced();
            debounced();

            $timeout.flush(199);
            expect(called).toEqual(0);
            $timeout.flush(200);
            expect(called).toEqual(1);
        });
        
        it('with custom delay', function () {
            var debounced = binDebounce(callback, 500);
            debounced();
            debounced();

            $timeout.flush(499);
            expect(called).toEqual(0);
            $timeout.flush(500);
            expect(called).toEqual(1);
        });

        it('call immediately', function () {
            var debounced = binDebounce(callback, 200, true);
            debounced();
            debounced();

            $timeout.flush(1);
            expect(called).toEqual(1);
            $timeout.flush(200);
            expect(called).toEqual(2);
        });
    });

    describe('binSanitizeUrl filter', function () {
        var filter;

        beforeEach(inject(function ($location, binSanitizeUrlFilter) {
            $location.path('test');
            filter = binSanitizeUrlFilter;
        }));

        [
            {actual: 'test', expected: 'test'},
            {actual: '/test', expected: 'test'},
            {actual: '#!/test', expected: 'test'},
            {actual: '/#!/test', expected: 'test'},
            {actual: 'www.test.com', expected:'http://www.test.com'},
            {actual: 'www.test.com/#!/test', expected: 'http://www.test.com/test'},
            {actual: 'test.com/#!/test', expected: 'http://test.com/test'},
            {actual: 'other.domain.com/#!/test', expected: 'http://other.domain.com/test'},
            {actual: 'http://test', expected: 'http://test'},
            {actual: 'http://test.com', expected: 'http://test.com'},
            {actual: 'https://test.com', expected: 'https://test.com'},
            {actual: 'ftp://test.com', expected: 'ftp://test.com'},
            // testing relative paths
            {actual: 'http://server', expected: ''},
            {actual: 'http://server/', expected: ''},
            {actual: 'http://server/test', expected: 'test'},
            {actual: 'http://server/test/', expected: 'test/'},
            {actual: 'http://server/#!/test', expected: 'test'},
            {actual: 'http://server/#!/test/with/longer/path', expected: 'test/with/longer/path'}
        ].forEach(function (link) {
            it('when link is "' + link.actual + '", expect "' + link.expected + '"', function () {
                expect(filter(link.actual)).toEqual(link.expected);
            });
        });
    });

    describe('binLink service', function () {
        var sut, editModeRendererMock, onSubmitSpy, onRemoveSpy;

        beforeEach(inject(function (binLink, editModeRenderer) {
            editModeRendererMock = editModeRenderer;
            onSubmitSpy = jasmine.createSpy('submit');
            onRemoveSpy = jasmine.createSpy('remove');
            sut = binLink;
        }));

        describe('on open', function () {
            beforeEach(function () {
                sut.open({
                    onSubmit: onSubmitSpy,
                    onRemove: onRemoveSpy
                });
            });

            it('edit-mode renderer is opened', function () {
                expect(editModeRendererMock.open).toHaveBeenCalledWith({
                    templateUrl: 'bin-link-edit.html',
                    id: 'popup',
                    scope: jasmine.any(Object)
                });
            });

            describe('with edit-mode renderer scope', function () {
                var scope;

                beforeEach(function () {
                    scope = editModeRendererMock.open.calls.mostRecent().args[0].scope;
                });

                it('default link values', function () {
                    expect(scope.link).toEqual({
                        href: 'http://',
                        text: '',
                        target: true
                    });
                });

                it('text field is not visible', function () {
                    expect(scope.allowText).toBeFalsy();
                });

                it('remove is not available', function () {
                    expect(scope.remove).toBeUndefined();
                });

                it('on cancel, close the renderer', function () {
                    scope.cancel();
                    expect(editModeRendererMock.close).toHaveBeenCalledWith({id: 'popup'});
                });

                describe('on submit', function () {
                    beforeEach(function () {
                        scope.submit();
                    });

                    it('is working', function () {
                        expect(scope.working).toBeTruthy();
                        expect(scope.submitting).toBeTruthy();
                        expect(scope.removing).toBeFalsy();
                    });

                    it('onSubmit callback is executed', function () {
                        expect(onSubmitSpy).toHaveBeenCalledWith({
                            href: 'http://',
                            text: '',
                            target: '_blank',
                            success: jasmine.any(Function),
                            error: jasmine.any(Function)
                        });
                    });

                    it('on success', function () {
                        onSubmitSpy.calls.mostRecent().args[0].success();
                        expect(editModeRendererMock.close).toHaveBeenCalledWith({id: 'popup'});
                    });

                    it('on error', function () {
                        onSubmitSpy.calls.mostRecent().args[0].error();
                        expect(scope.violation).toBeTruthy();
                        expect(scope.working).toBeFalsy();
                        expect(scope.submitting).toBeFalsy();
                        expect(scope.removing).toBeFalsy();
                    });
                });
            });
        });

        describe('on open with values', function () {
            beforeEach(function () {
                sut.open({
                    href: 'test',
                    text: 'foo',
                    allowText: true,
                    target: '_blank',
                    onSubmit: onSubmitSpy,
                    onRemove: onRemoveSpy
                });
            });

            it('edit-mode renderer is opened', function () {
                expect(editModeRendererMock.open).toHaveBeenCalledWith({
                    templateUrl: 'bin-link-edit.html',
                    id: 'popup',
                    scope: jasmine.any(Object)
                });
            });

            describe('with edit-mode renderer scope', function () {
                var scope;

                beforeEach(function () {
                    scope = editModeRendererMock.open.calls.mostRecent().args[0].scope;
                });

                it('link values', function () {
                    expect(scope.link).toEqual({
                        href: 'test',
                        text: 'foo',
                        target: true
                    });
                });

                it('text field is visible', function () {
                    expect(scope.allowText).toBeTruthy();
                });

                it('remove is available', function () {
                    expect(scope.remove).toBeDefined();
                });

                describe('on remove', function () {
                    beforeEach(function () {
                        scope.remove();
                    });

                    it('is working', function () {
                        expect(scope.working).toBeTruthy();
                        expect(scope.removing).toBeTruthy();
                        expect(scope.submitting).toBeFalsy();
                    });

                    it('onRemove callback is executed', function () {
                        expect(onRemoveSpy).toHaveBeenCalledWith({
                            success: jasmine.any(Function),
                            error: jasmine.any(Function)
                        });
                    });

                    it('on success', function () {
                        onRemoveSpy.calls.mostRecent().args[0].success();
                        expect(editModeRendererMock.close).toHaveBeenCalledWith({id: 'popup'});
                    });

                    it('on error', function () {
                        onRemoveSpy.calls.mostRecent().args[0].error();
                        expect(scope.violation).toBeTruthy();
                        expect(scope.working).toBeFalsy();
                        expect(scope.submitting).toBeFalsy();
                        expect(scope.removing).toBeFalsy();
                    });
                });
            });
        });

        describe('when target is null', function () {
            beforeEach(function () {
                sut.open({
                    target: null,
                    onSubmit: onSubmitSpy,
                    onRemove: onRemoveSpy
                });
            });

            it('edit-mode renderer is opened', function () {
                expect(editModeRendererMock.open).toHaveBeenCalledWith({
                    templateUrl: 'bin-link-edit.html',
                    id: 'popup',
                    scope: jasmine.any(Object)
                });
            });

            describe('with edit-mode renderer scope', function () {
                var scope;

                beforeEach(function () {
                    scope = editModeRendererMock.open.calls.mostRecent().args[0].scope;
                });

                it('default link values', function () {
                    expect(scope.link).toEqual({
                        href: 'http://',
                        text: '',
                        target: true
                    });
                });
            });
        });
    });
});