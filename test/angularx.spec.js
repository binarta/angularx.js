var $ = function () {
    return {
        scroll: function () {
        }
    }
};

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
        var element, html, scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.collection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            html = '<div bin-split-in-rows="collection" columns="3"></div>';
            element = angular.element(html);
            $compile(element)(scope);
        }));

        [
            {columns: 0, expected: []},
            {
                columns: 1, expected: [
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
                columns: 2, expected: [
                {id: 0, items: [1, 2]},
                {id: 1, items: [3, 4]},
                {id: 2, items: [5, 6]},
                {id: 3, items: [7, 8]},
                {id: 4, items: [9, 10]}
            ]
            },
            {
                columns: 3, expected: [
                {id: 0, items: [1, 2, 3]},
                {id: 1, items: [4, 5, 6]},
                {id: 2, items: [7, 8, 9]},
                {id: 3, items: [10]}
            ]
            },
            {
                columns: 4, expected: [
                {id: 0, items: [1, 2, 3, 4]},
                {id: 1, items: [5, 6, 7, 8]},
                {id: 2, items: [9, 10]}
            ]
            },
            {
                columns: 5, expected: [
                {id: 0, items: [1, 2, 3, 4, 5]},
                {id: 1, items: [6, 7, 8, 9, 10]}
            ]
            },
            {
                columns: 6, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6]},
                {id: 1, items: [7, 8, 9, 10]}
            ]
            },
            {
                columns: 7, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7]},
                {id: 1, items: [8, 9, 10]}
            ]
            },
            {
                columns: 8, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8]},
                {id: 1, items: [9, 10]}
            ]
            },
            {
                columns: 9, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9]},
                {id: 1, items: [10]}
            ]
            },
            {
                columns: 10, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            ]
            }
        ].forEach(function (value) {
                describe('creates rows for collection', function () {
                    beforeEach(inject(function ($rootScope, $compile) {
                        html = '<div bin-split-in-rows="collection" columns="' + value.columns + '"></div>';
                        element = angular.element(html);
                        $compile(element)(scope);
                        scope.$digest();
                    }));

                    it('given column count ' + value.columns, function () {
                        expect(scope.rows).toEqual(value.expected);
                    });
                });
            });

        it('when the collection is undefined', function () {
            scope.collection = undefined;
            scope.$digest();

            expect(scope.rows).toBeUndefined();
        });

        it('when the collection changes', function () {
            scope.collection.push(11);
            scope.collection.push(12);
            scope.collection.push(13);
            scope.$digest();

            expect(scope.rows).toEqual([
                {id: 0, items: [1, 2, 3]},
                {id: 1, items: [4, 5, 6]},
                {id: 2, items: [7, 8, 9]},
                {id: 3, items: [10, 11, 12]},
                {id: 4, items: [13]}
            ]);
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
        var loader, document, scope;

        beforeEach(inject(function ($document, resourceLoader, $rootScope) {
            $document.find('head').empty();
            document = $document;
            scope = $rootScope;
            loader = resourceLoader;
        }));

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

            expect(document.find('head').html()).toContain('<script src="/base/test/test.js" class="ng-scope"></script>');
            expect(scope.resources['/base/test/test.js']).toBeDefined();
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
            expect(success.calls.length).toEqual(1);
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
                    expect(success.calls.length).toEqual(args.resolvesTo ? 1 : 0);
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
                    expect(rejected.calls.length).toEqual(1);
                    expect(rejected.calls[0].args[0]).toEqual('timeout');
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
                        expect(rejected.calls.length).toEqual(1);
                        expect(rejected.calls[0].args[0]).toEqual('timeout');
                    }));

                    it('when true before timeout reached then execute success handler', inject(function($timeout) {
                        d.resolve();
                        execute().then(success, rejected);
                        $timeout.flush();
                        expect(success.calls.length).toEqual(1);
                    }));
                });
            });
        });
    });

    describe('binBack', function() {
        var evt, cb;
        var sut;
        var element = {
            on: function(_evt, _cb) {
                evt = _evt;
                cb = _cb;
            }
        };
        var path = 'P';
        var window = {
            history: {
                back: function() {
                    path = 'B';
                }
            }
        };

        beforeEach(function() {
            sut = BinBackDirectiveFactory(window);
        });

        it('is exposed as class and attribute', function() {
            expect(sut.restrict).toEqual('CA');
        });

        describe('upon link', function() {
            beforeEach(function() {
                sut.link({}, element);
            });

            it('on click event is registered', function() {
                expect(evt).toEqual('click');
            });

            describe('and event is fired', function() {
                beforeEach(function() {
                    cb();
                });

                it('window history goes back one iteration', function() {
                    expect(path).toEqual('B');
                })
            });
        });
    });

    describe('ApplicationMenuFSM', function() {
        var fsm, ctrl, scope;

        beforeEach(inject(function(applicationMenuFSM, $controller, $rootScope) {
            scope = $rootScope.$new();
            fsm = applicationMenuFSM;
            ctrl = $controller(ApplicationMenuController, {$scope:scope});
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
        });
    });
});