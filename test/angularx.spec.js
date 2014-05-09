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
            {columns: 1, expected: [
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
            ]},
            {columns: 2, expected: [
                {id: 0, items: [1, 2]},
                {id: 1, items: [3, 4]},
                {id: 2, items: [5, 6]},
                {id: 3, items: [7, 8]},
                {id: 4, items: [9, 10]}
            ]},
            {columns: 3, expected: [
                {id: 0, items: [1, 2, 3]},
                {id: 1, items: [4, 5, 6]},
                {id: 2, items: [7, 8, 9]},
                {id: 3, items: [10]}
            ]},
            {columns: 4, expected: [
                {id: 0, items: [1, 2, 3, 4]},
                {id: 1, items: [5, 6, 7, 8]},
                {id: 2, items: [9, 10]}
            ]},
            {columns: 5, expected: [
                {id: 0, items: [1, 2, 3, 4, 5]},
                {id: 1, items: [6, 7, 8, 9, 10]}
            ]},
            {columns: 6, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6]},
                {id: 1, items: [7, 8, 9, 10]}
            ]},
            {columns: 7, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7]},
                {id: 1, items: [8, 9, 10]}
            ]},
            {columns: 8, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8]},
                {id: 1, items: [9, 10]}
            ]},
            {columns: 9, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9]},
                {id: 1, items: [10]}
            ]},
            {columns: 10, expected: [
                {id: 0, items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            ]}
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

    describe('binGroupBy directive', function () {
        var element, html, scope;

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.collection = [{field: 1}, {field: 2}, {field: 1}];
            html = '<div bin-group-by="field" on="collection"></div>';
            element = angular.element(html);
            $compile(element)(scope);
        }));

        it('creates groups', function () {
            scope.$digest();

            expect(scope.groups).toEqual([
                {items: [{field: 1}, {field: 1}], id: 0},
                {items: [{field: 2}], id: 1}
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
                {items: [{field: 1}, {field: 1}], id: 0},
                {items: [{field: 2}], id: 1},
                {items: [{field: 3}], id: 2}
            ]);
        });
    });
});