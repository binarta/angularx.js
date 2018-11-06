(function(angular) {
    angular.module('angularx').component('binActions', new BinActionsComponent());

    function BinActionsComponent() {
        this.templateUrl = 'bin-actions.html';
        this.transclude = {
            'group': 'binActionGroup'
        };
        this.controller = ['$scope', BinActionsController];
    }

    /**
     * This component's controller is an orchestrator to which child components subscribe.
     *
     * Special note: Currently we expose the opened/closed events through AngularJS' $scope events mechanism. While
     * component bindings are a preferred way of doing this because this component is currently used in a transclusion
     * context we cannot always use bindings. This is the only way (that I could think of) of exposing the state to parent components.
     *
     * @param $scope
     * @constructor
     */
    function BinActionsController($scope) {
        var ON_OPENED_EVENT = 'bin.actions.opened';
        var ON_CLOSED_EVENT = 'bin.actions.closed';

        var $ctrl = this;
        var actionsListeners = [];
        var mainActions = 0;
        var states = {
            closed: function (fsm) {
                this.name = 'closed';
                $ctrl.showActionsFor();
                $scope.$emit(ON_CLOSED_EVENT);
                this.toggle = function () {
                    fsm.state = new states.opened(fsm);
                };
                this.close = function () {}
            },
            opened: function (fsm) {
                this.name = 'opened';
                $scope.$emit(ON_OPENED_EVENT);
                this.toggle = function () {
                    fsm.state = new states.closed(fsm);
                };
                this.close = function () {
                    fsm.state = new states.closed(fsm);
                };
            }
        };

        $ctrl.$onInit = function () {
            $ctrl.state = new states.closed($ctrl);
        };

        $ctrl.close = function () {
            $ctrl.state.close();
        };

        $ctrl.toggle = function () {
            $ctrl.state.toggle();
        };

        $ctrl.startWorking = function () {
            $ctrl.working = true;
        };

        $ctrl.stopWorking = function () {
            $ctrl.working = false;
        };

        $ctrl.showActionsFor = function (id) {
            actionsListeners.forEach(function (cb) {
                cb(id);
            });
        };

        $ctrl.onShowActionsFor = function (cb) {
            actionsListeners.push(cb);
        };

        $ctrl.setButtonCode = function (code) {
            $ctrl.buttonCode = code;
        };

        $ctrl.increaseMainActionCount = function () {
            mainActions += 1;
        };

        $ctrl.decreaseMainActionCount = function () {
            mainActions -= 1;
        };

        $ctrl.hasMainActions = function () {
            return mainActions > 0;
        };
    }
})(angular);