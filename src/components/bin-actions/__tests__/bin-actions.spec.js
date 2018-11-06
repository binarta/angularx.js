describe('<bin-actions></bin-actions>', function () {
    beforeEach(module('angularx'));
    beforeEach(inject(function ($componentController, $rootScope) {
        var self = this;
        this.events = '';
        $rootScope.$on('bin.actions.opened', function() {
            self.events += 'O';
        });
        $rootScope.$on('bin.actions.closed', function() {
            self.events += 'C';
        });
        this.$ctrl = $componentController('binActions');
        this.$ctrl.$onInit();
    }));

    it('component is in closed state', function () {
        expect(this.$ctrl.state.name).toEqual('closed');
        expect(this.events).toEqual('C');
    });

    it('on toggle menu', function () {
        this.$ctrl.toggle();

        expect(this.$ctrl.state.name).toEqual('opened');
        expect(this.events).toEqual('CO');

        this.$ctrl.toggle();

        expect(this.$ctrl.state.name).toEqual('closed');
        expect(this.events).toEqual('COC');
    });

    it('on close', function () {
        this.$ctrl.toggle();

        expect(this.$ctrl.state.name).toEqual('opened');

        this.$ctrl.close();

        expect(this.$ctrl.state.name).toEqual('closed');
        expect(this.events).toEqual('COC');
    });

    describe('when state is opened', function () {
        beforeEach(function () {
            this.$ctrl.toggle();
        });

        it('on start working', function () {
            this.$ctrl.startWorking();
            expect(this.$ctrl.working).toBeTruthy();
        });

        it('on stop working', function () {
            this.$ctrl.startWorking();
            this.$ctrl.stopWorking();
            expect(this.$ctrl.working).toBeFalsy();
        });

        describe('with actions listeners', function () {
            beforeEach(function () {
                this.$ctrl.onShowActionsFor(function (id) {
                    this.actionId = id;
                }.bind(this));
            });

            it('on show actions', function () {
                this.$ctrl.showActionsFor('foo');
                expect(this.actionId).toEqual('foo');
            });

            describe('on close', function () {
                beforeEach(function () {
                    this.$ctrl.close();
                });

                it('show main actions', function () {
                    expect(this.actionId).toBeUndefined();
                });
            });
        });

        it('on setButtonCode', function () {
            this.$ctrl.setButtonCode('code');
            expect(this.$ctrl.buttonCode).toEqual('code');
        });
    });

    it('when no main actions are subscribed', function () {
        expect(this.$ctrl.hasMainActions()).toBeFalsy();
    });

    describe('when main actions are subscribed', function () {
        beforeEach(function () {
            this.$ctrl.increaseMainActionCount();
        });

        it('has main actions to show', function () {
            expect(this.$ctrl.hasMainActions()).toBeTruthy();
        });

        it('when main action is unregistered', function () {
            this.$ctrl.decreaseMainActionCount();
            expect(this.$ctrl.hasMainActions()).toBeFalsy();
        });
    });

});