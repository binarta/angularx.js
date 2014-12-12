angular.module('angularx', ['notifications', 'config', 'checkpoint'])
    .directive('binSplitInRows', binSplitInRowsDirectiveFactory)
    .directive('binSplitInColumns', binSplitInColumnsDirectiveFactory)
    .directive('binGroupBy', binGroupByDirectiveFactory)
    .directive('binSelectTextOnClick', binSelectTextOnClick)
    .directive('binExposeBoxWidth', binExposeBoxWidth)
    .directive('binToggle', binToggle)
    .directive('binBack', ['$window', BinBackDirectiveFactory])
    .service('resourceLoader', ['$rootScope', '$document', '$compile', ResourceLoaderService])
    .service('binTemplate', ['config', 'activeUserHasPermission', BinTemplateService])
    .factory('predicatedBarrier', ['$q', '$timeout', PredicatedBarrierFactory])
    .run(['topicMessageDispatcher', EndOfPageListener]);

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

function PredicatedBarrierFactory($q, $timeout) {
    var duration = 1000;

    function waitFor(args) {
        if (args.timeout != undefined && args.now.getTime() > args.timeout) args.deferred.reject('timeout');
        else {
            args.predicate().then(args.deferred.resolve, function() {
                if (args.timeout != undefined)
                    $timeout(function () {
                        waitFor(args);
                    }, duration);
                else args.deferred.reject('timeout')
            });
            //if (args.predicate()) args.deferred.resolve();
            //else {
            //    if (args.timeout != undefined)
            //        $timeout(function () {
            //            waitFor(args);
            //        }, duration);
            //    else args.deferred.reject('timeout')
            //}
        }
    }

    return function (args) {
        var d = $q.defer();
        var now = args.now || new Date();
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