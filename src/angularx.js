angular.module('angularx', ['notifications'])
    .directive('binSplitInRows', binSplitInRowsDirectiveFactory)
    .directive('binSplitInColumns', binSplitInColumnsDirectiveFactory)
    .directive('binGroupBy', binGroupByDirectiveFactory)
    .directive('binSelectTextOnClick', binSelectTextOnClick)
    .directive('binExposeBoxWidth', binExposeBoxWidth)
    .service('cssLoader', ['$document', '$compile', CssLoaderService])
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
            if(newItems) $scope.columns = splitInColumns(newItems, $scope.$eval(attrs.columns));
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
                if(filters.indexOf(el[filterKey]) == -1) filters.push(el[filterKey]);
            });
            return filters
        }

        function getItemsByFilter(source, filterKey, filterValue) {
            var items = [];
            source.forEach(function (item) {
                if(filterValue == item[filterKey]) items.push(item);
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
        restrict:'A',
        link:function($scope, el) {
            el.on('click', function() {
                this.select();
            });
        }
    };
}

function EndOfPageListener(topicMessageDispatcher) {
    $(window).scroll(function() {
        if($(document).height() <= $(window).scrollTop() + $(window).height())
            topicMessageDispatcher.fire('end.of.page', 'reached');
    });
}

function binExposeBoxWidth() {
    return {
        restrict:'A',
        link:function($scope, el) {
            $scope.boxWidth = el.width();
        }
    }
}

function CssLoaderService($document, $compile) {
    var head = $document.find('head');
    var stylesheets = [];
    return {
        add: function(href) {
            if (stylesheets.indexOf(href) == -1) {
                stylesheets.push(href);
                head.append($compile('<link rel="stylesheet" type="text/css" href="' + href + '">')(stylesheets));
            }
        }
    };
}