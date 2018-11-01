(function (angular) {
    var NAME = 'binActionsGroupAction';

    angular.module('angularx')
        .component(NAME, new BinActionsGroupActionComponent());

    function BinActionsGroupActionComponent() {
        this.templateUrl = 'bin-actions-group-action.html';
        this.bindings = {
            danger: '@' + NAME + 'Danger',
            iconClass: '@' + NAME + 'IconClass',
            disabled: '<' + NAME + 'Disabled',
            i18nCode: '@' + NAME + 'I18nCode',
            type: '@' + NAME + 'Type',
            action: '&' + NAME + 'Action',
            selector: '@' + NAME + 'Selector',
            link: '<' + NAME + 'Link'
        };
        this.require = {
            binActions: '^^binActions',
            binActionsGroup: '^^binActionsGroup'
        };
        this.transclude = true;
        this.controller = ['i18nLocation', BinActionsGroupActionController];
    }

    function BinActionsGroupActionController(i18nLocation) {
        var $ctrl = this;
        var decorators = {
            'link': function() {
                this.execute = function() {
                    i18nLocation.path(this.link);
                }
            }.bind(this),
            'action': function () {
                this.execute = function() {
                    if (!$ctrl.working && !$ctrl.disabled) {
                        var result = $ctrl.action();
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