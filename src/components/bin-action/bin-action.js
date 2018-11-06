(function (angular) {
    var NAME = 'binAction';

    angular.module('angularx')
        .component(NAME, new BinActionComponent());

    function BinActionComponent() {
        this.templateUrl = 'bin-action.html';
        this.bindings = {
            danger: '@?' + NAME + 'Danger',
            iconClass: '@?' + NAME + 'IconClass',
            disabled: '<?' + NAME + 'Disabled',
            i18nCode: '@?' + NAME + 'I18nCode',
            type: '@' + NAME + 'Type',
            expression: '&?' + NAME + 'Expression',
            selector: '@?' + NAME + 'Selector',
            link: '<?' + NAME + 'Link'
        };
        this.require = {
            binActions: '^^binActions',
            binActionsGroup: '^^binActionGroup'
        };
        this.transclude = true;
        this.controller = ['i18nLocation', BinActionController];
    }

    function BinActionController(i18nLocation) {
        var $ctrl = this;
        var decorators = {
            'link': function() {
                this.execute = function() {
                    i18nLocation.path(this.link);
                }
            }.bind(this),
            'expression': function () {
                this.execute = function() {
                    if (!$ctrl.working && !$ctrl.disabled) {
                        var result = $ctrl.expression();
                        if (result && result.finally) {
                            startWorking();
                            result.finally(stopWorking);
                        }
                    }
                }
            }.bind(this),
            'selector': function() {
                this.execute = function() {
                    this.binActions.showActionsFor(this.selector);
                }
            }.bind(this)
        };

        $ctrl.$onInit = function () {
            $ctrl.binActionsGroup.increaseActionCount();
            (decorators[$ctrl.type] || angular.noop)()
        };

        $ctrl.execute = angular.noop;

        $ctrl.$destroy = function () {
            $ctrl.binActionsGroup.decreaseActionCount();
        };

        function startWorking() {
            $ctrl.binActions.startWorking();
            $ctrl.working = true;
        }

        function stopWorking() {
            $ctrl.binActions.stopWorking();
            $ctrl.working = false;
        }
    }
})(angular);