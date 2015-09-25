if (angular.isUndefined(angular.merge)) angular.merge = merge;
angular.module('angularx', ['notifications', 'config', 'checkpoint', 'angular.usecase.adapter'])
    .directive('binSplitInRows', binSplitInRowsDirectiveFactory)
    .directive('binSplitInColumns', binSplitInColumnsDirectiveFactory)
    .directive('binGroupBy', binGroupByDirectiveFactory)
    .directive('binSelectTextOnClick', binSelectTextOnClick)
    .directive('binExposeBoxWidth', binExposeBoxWidth)
    .directive('binToggle', binToggle)
    .directive('binBack', ['$window', BinBackDirectiveFactory])
    .service('resourceLoader', ['$rootScope', '$document', '$compile', ResourceLoaderService])
    .service('binTemplate', ['config', 'activeUserHasPermission', BinTemplateService])
    .service('binDateController', [BinDateController])
    .factory('openCloseMenuFSMFactory', [OpenCloseMenuFSMFactoryFactory])
    .controller('OpenCloseMenuController', ['$scope', 'openCloseMenuFSMFactory', OpenCloseMenuController])
    .factory('applicationMenuFSM', ['openCloseMenuFSMFactory', ApplicationMenuFSMFactory])
    .controller('ApplicationMenuController', ['$scope', 'applicationMenuFSM', ApplicationMenuController])
    .provider('optionsMenuFactory', OptionsMenuFactoryProvider)
    .controller('optionsMenuController', ['$scope', 'optionsMenuFactory', 'usecaseAdapterFactory', OptionsMenuController])
    .factory('predicatedBarrier', ['$q', '$timeout', 'binDateController', PredicatedBarrierFactory])
    .run(['topicMessageDispatcher', EndOfPageListener])
    .config(['$provide', function($provide) {
        /*
        * Bugfix for infinite digest loop on location change on IOS 9 using UIWebView
        * https://github.com/angular/angular.js/issues/12241
        *
        * Patch taken from https://gist.github.com/IgorMinar/863acd413e3925bf282c
        */
        $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {
            if (isIOS9UIWebView($window.navigator.userAgent)) {
                return applyIOS9Shim($delegate);
            }

            return $delegate;

            function isIOS9UIWebView(userAgent) {
                return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
            }

            function applyIOS9Shim(browser) {
                var pendingLocationUrl = null;
                var originalUrlFn= browser.url;

                browser.url = function() {
                    if (arguments.length) {
                        pendingLocationUrl = arguments[0];
                        return originalUrlFn.apply(browser, arguments);
                    }

                    return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
                };

                window.addEventListener('popstate', clearPendingLocationUrl, false);
                window.addEventListener('hashchange', clearPendingLocationUrl, false);

                function clearPendingLocationUrl() {
                    pendingLocationUrl = null;
                }

                return browser;
            }
        }]);
    }]);

function BinDateController() {
    this.now = function() {
        var d = new Date();
        if(this.lockedAt) d.setTime(this.lockedAt);
        return d;
    };

    this.freeze = function() {
        this.lockedAt = new Date().getTime();
    };

    this.resume = function() {
        this.lockedAt = undefined;
    };

    this.jump = function(ms) {
        if(this.lockedAt) this.lockedAt += ms;
    }
}

function binSplitInRowsDirectiveFactory() {
    return function ($scope, el, attrs) {
        function splitInRows(items, columns) {
            var columnCount = parseInt(columns);
            if (columnCount <= 0) return [];
            var rows = [], index = 0;
            for (var i = 0; i <= (items.length - 1); i = i + columnCount) {
                rows.push({
                    id: index++,
                    items: items.slice(i, i + columnCount)
                });
            }
            return rows;
        }

        $scope.$watchCollection(attrs.binSplitInRows, function (newItems) {
            if (newItems) $scope.rows = splitInRows(newItems, attrs.columns);
        });
    }
}

function binSplitInColumnsDirectiveFactory() {
    return function ($scope, el, attrs) {
        function splitInColumns(items, columns) {
            var cols = [];
            for (var c = 0; c <= columns - 1; c++) {
                var it = [];
                for (var i = c; i <= items.length - 1; i += columns) {
                    it.push(items[i]);
                }
                cols.push({id: c, items: it});
            }
            return cols;
        }

        $scope.$watchCollection(attrs.binSplitInColumns, function (newItems) {
            if (newItems) $scope.columns = splitInColumns(newItems, $scope.$eval(attrs.columns));
        });
    }
}

function binGroupByDirectiveFactory() {
    return function ($scope, el, attrs) {
        function group(source, filterKey) {
            var groups = [];
            var filters = getUniqueFilters(source, filterKey);
            filters.forEach(function (filterValue, index) {
                groups.push({items: getItemsByFilter(source, filterKey, filterValue), id: index});
            });
            return groups;
        }

        function getUniqueFilters(source, filterKey) {
            var filters = [];
            source.forEach(function (el) {
                if (filters.indexOf(el[filterKey]) == -1) filters.push(el[filterKey]);
            });
            return filters
        }

        function getItemsByFilter(source, filterKey, filterValue) {
            var items = [];
            source.forEach(function (item) {
                if (filterValue == item[filterKey]) items.push(item);
            });
            return items;
        }

        $scope.$watchCollection(attrs.on, function (newItems) {
            if (newItems) $scope.groups = group(newItems, attrs.binGroupBy);
        });
    }
}

function binSelectTextOnClick() {
    return {
        restrict: 'A',
        link: function ($scope, el) {
            el.on('click', function () {
                this.select();
            });
        }
    };
}

function EndOfPageListener(topicMessageDispatcher) {
    $(window).scroll(function () {
        if ($(document).height() <= $(window).scrollTop() + $(window).height())
            topicMessageDispatcher.fire('end.of.page', 'reached');
    });
}

function binExposeBoxWidth() {
    return {
        scope: true,
        restrict: 'A',
        link: function ($scope, el) {
            $scope.boxWidth = el.width();
        }
    }
}

function binToggle() {
    return {
        restrict: 'A',
        scope: true,
        link: function ($scope) {
            $scope.toggleDisabled = true;
            $scope.toggleEnabled = false;
            $scope.toggle = function () {
                $scope.toggleDisabled = !$scope.toggleDisabled;
                $scope.toggleEnabled = !$scope.toggleEnabled;
            }
        }
    }
}

function ResourceLoaderService($rootScope, $document, $compile) {
    var head = $document.find('head');
    var scope = $rootScope;
    scope.resources = [];

    function addResourceToDom(href) {
        var element = getElement(href);
        scope.resources[href] = element;
        head.append(element);
    }

    function addScriptResourceToDom(href) {
        var element = getScriptElement(href);
        scope.resources[href] = element;
        head.append(element);
    }

    function getElement(href) {
        if (href.slice(-4) == '.css') return getStylesheetElement(href);
        else if (href.slice(-3) == '.js') return getScriptElement(href);
    }

    function getStylesheetElement(href) {
        return $compile('<link rel="stylesheet" type="text/css" href="' + href + '">')(scope);
    }

    function getScriptElement(href) {
        return $compile('<script src="' + href + '">')(scope);
    }

    function removeResourceFromDom(href) {
        scope.resources[href].remove();
        delete scope.resources[href];
    }

    return {
        add: function (href) {
            if (!scope.resources[href]) addResourceToDom(href);
        },
        addScript: function (href) {
            if (!scope.resources[href]) addScriptResourceToDom(href);
        },
        remove: function (href) {
            if (scope.resources[href]) removeResourceFromDom(href);
        }
    };
}

function BinTemplateService(config, activeUserHasPermission) {
    this.setTemplateUrl = function (args) {
        var scope = args.scope;

        function setTemplateUrlToScope() {
            var componentsDir = config.componentsDir || 'bower_components';
            var styling = config.styling ? config.styling + '/' : '';
            scope.templateUrl = componentsDir + '/binarta.' + args.module + '.angular/template/' + styling + args.name;
        }

        if (args.permission) {
            activeUserHasPermission({
                yes: function () {
                    setTemplateUrlToScope();
                },
                no: function () {
                    delete scope.templateUrl;
                },
                scope: args.scope
            }, args.permission);
        } else {
            setTemplateUrlToScope();
        }
    };
}

function PredicatedBarrierFactory($q, $timeout, clock) {
    var duration = 1000;

    function waitFor(args) {
        if (args.timeout != undefined && args.now.getTime() > args.timeout) args.deferred.reject('timeout');
        else {
            args.predicate().then(args.deferred.resolve, function() {
                if (args.timeout != undefined)
                    $timeout(function () {
                        args.now = clock.now();
                        waitFor(args);
                    }, duration);
                else args.deferred.reject('timeout')
            });
        }
    }

    return function (args) {
        var d = $q.defer();
        var now = clock.now();
        if (args.predicate) waitFor({
            predicate: args.predicate,
            deferred: d,
            now: now,
            timeout: args.timeout ? now.getTime() + args.timeout : undefined
        });
        else d.resolve();
        return d.promise;
    }
}

function BinBackDirectiveFactory($window) {
    return {
        restrict: 'CA',
        link: function(scope, element) {
            element.on('click', function() {
                $window.history.back();
            });
        }
    }
}

function OpenCloseMenuFSM() {
    var self = this;

    function ClosedState() {
        this.status = 'closed';
        this.close = function(fsm) {};
        this.open = function(fsm) {
            fsm.currentState = new OpenedState();
        };
        this.toggle = function(fsm) {
            this.open(fsm);
        }
    }

    function OpenedState() {
        this.status = 'opened';
        this.open = function(fsm) {};
        this.close = function(fsm) {
            fsm.currentState = new ClosedState();
        };
        this.toggle = function(fsm) {
            this.close(fsm);
        }
    }

    this.currentState = new ClosedState();

    this.status = function() {
        return self.currentState.status;
    };
    this.close = function() {
        self.currentState.close(self);
    };
    this.open = function() {
        self.currentState.open(self);
    };
    this.toggle = function() {
        self.currentState.toggle(self);
    }
}

function OpenCloseMenuFSMFactoryFactory() {
    var fsms = {};

    return function(args) {
        if(!fsms[args.id]) fsms[args.id] = new OpenCloseMenuFSM();
        return fsms[args.id];
    };
}

function ApplicationMenuFSMFactory(openCloseMenuFSMFactory) {
    return openCloseMenuFSMFactory({id:'application'});
}

function OpenCloseMenuController($scope, openCloseMenuFSMFactory) {
    var dummy = function() {};

    $scope.status = dummy;
    $scope.open = dummy;
    $scope.close = dummy;
    $scope.toggle = dummy;

    $scope.connect = function(args) {
        var fsm = openCloseMenuFSMFactory(args);

        $scope.status = fsm.status;
        $scope.open = fsm.open;
        $scope.close = fsm.close;
        $scope.toggle = fsm.toggle;
    }
}

function ApplicationMenuController($scope, applicationMenuFSM) {
    $scope.status = applicationMenuFSM.status;
    $scope.open = applicationMenuFSM.open;
    $scope.close = applicationMenuFSM.close;
    $scope.toggle = applicationMenuFSM.toggle;

    this.status = applicationMenuFSM.status;
    this.open = applicationMenuFSM.open;
    this.close = applicationMenuFSM.close;
    this.toggle = applicationMenuFSM.toggle;
}

function MenuOption(args) {
    var self = this;

    this.id = function() {return args.ctx.id};
    this.select = function() {
        args.menu.select(self);
    }
}
function OptionsMenu(args) {
    var self = this;
    var options = (args.options || []).map(function(it) {
        return new MenuOption({menu:self, ctx:it});
    });
    var reader = function() {};
    var writer = function() {};
    var currentSelection;

    this.options = function() {
        return options;
    };

    this.currentSelection = function() {
        return currentSelection;
    };

    var setCurrentSelectionTo = function(initialSelection) {
        if(initialSelection) currentSelection = options.reduce(function(p, c) {
            return p || (c.id() == initialSelection ? c : p);
        }, undefined);
    };
    setCurrentSelectionTo(args.default);

    this.installIOHandlers = function(args) {
        reader = args.reader;
        writer = args.writer;
        reader({
            success:setCurrentSelectionTo,
            notFound:function() {},
            error:function() {}
        });
    };

    this.select = function(option) {
        currentSelection = option;
    };

    this.saveCurrentSelection = function(response) {
        writer(currentSelection.id(), response);
    }
}
function OptionsMenuFactoryProvider() {
    var config = {};
    var menus = {};

    this.installOptions = function(args) {
        config[args.id] = args;
    };

    this.$get = [function() {
        return function(args) {
            if(!menus[args.id]) menus[args.id] = new OptionsMenu(config[args.id] || {});
            return menus[args.id];
        }
    }]
}
function OptionsMenuController($scope, optionsMenuFactory, usecaseAdapterFactory) {
    var dummy = function() {return {}};
    var originalSelection, saved;
    var self = this;

    $scope.init = function(args) {
        self.ctx = args;
    };

    $scope.options = dummy;
    $scope.currentSelection = dummy;
    $scope.pristine = function() {
        return !originalSelection;
    };
    $scope.saved = function() {
        return saved;
    };

    $scope.connect = function(args) {
        var menu = optionsMenuFactory(args);
        $scope.options = menu.options;
        $scope.currentSelection = menu.currentSelection;
        $scope.saveCurrentSelection = function() {
            menu.saveCurrentSelection(usecaseAdapterFactory($scope, function() {
                originalSelection = undefined;
                saved = true;
                if (self.ctx && self.ctx.success) self.ctx.success();
            }));
        }
    };

    $scope.select = function(option) {
        saved = undefined;
        if(!originalSelection) originalSelection = $scope.currentSelection();
        else if(option.id() == originalSelection.id()) originalSelection = undefined;
        option.select();
    }
}

function merge(dst){
    var slice = [].slice;
    var isArray = Array.isArray;
    function baseExtend(dst, objs, deep) {
        for (var i = 0, ii = objs.length; i < ii; ++i) {
            var obj = objs[i];
            if (!angular.isObject(obj) && !angular.isFunction(obj)) continue;
            var keys = Object.keys(obj);
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                var src = obj[key];
                if (deep && angular.isObject(src)) {
                    if (!angular.isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
                    baseExtend(dst[key], [src], true);
                } else {
                    dst[key] = src;
                }
            }
        }

        return dst;
    }
    return baseExtend(dst, slice.call(arguments, 1), true);
}