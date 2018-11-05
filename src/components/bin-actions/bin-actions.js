(function(angular) {
    angular.module('angularx').component('binActions', new BinActionsComponent());

    function BinActionsComponent() {
        this.templateUrl = 'bin-actions.html';
        this.transclude = {
            'group': 'binActionGroup'
        };
        this.controller = BinActionsController;
    }

    function BinActionsController() {
        var $ctrl = this;
        var actionsListeners = [];
        var mainActions = 0;
        var states = {
            hidden: function () {
                this.name = 'hidden';
                this.close = function () {}
            },
            closed: function (fsm) {
                this.name = 'closed';
                $ctrl.showActionsFor();
                this.toggle = function () {
                    fsm.state = new states.opened(fsm);
                };
                this.close = function () {}
            },
            opened: function (fsm) {
                this.name = 'opened';
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