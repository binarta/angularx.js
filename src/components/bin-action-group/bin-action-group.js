(function(angular) {
    angular.module('angularx').component('binActionGroup', new BinActionGroup());

    function BinActionGroup() {
        this.template = '<div ng-show="$ctrl.visible" ng-transclude></div>';
        this.bindings = {
            for: '@?binActionGroupFor',
            buttonI18nCode: '@?binActionGroupButtonI18nCode'
        };
        this.require = {
            binActions: '^^binActions'
        };
        this.transclude = true;
        this.controller = BinActionGroupController;
    }
    
    function BinActionGroupController() {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            if (!$ctrl.for) $ctrl.visible = true;
            $ctrl.binActions.onShowActionsFor(function (id) {
                $ctrl.visible = $ctrl.for === id;
                if ($ctrl.visible) $ctrl.binActions.setButtonCode($ctrl.buttonI18nCode);
            });

            $ctrl.increaseActionCount = function () {
                if (!$ctrl.for) $ctrl.binActions.increaseMainActionCount();
            };

            $ctrl.decreaseActionCount = function () {
                if (!$ctrl.for) $ctrl.binActions.decreaseMainActionCount();
            };
        };    
    }
})(angular);