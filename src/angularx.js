angular.module('angularx', [])
    .directive('binSplitInRows', binSplitInRowsDirectiveFactory)
    .directive('binGroupBy', binGroupByDirectiveFactory);

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