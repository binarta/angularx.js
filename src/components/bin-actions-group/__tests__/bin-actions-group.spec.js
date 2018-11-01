describe('binEditActions component', function () {
    beforeEach(module('angularx'));
    beforeEach(inject(function ($componentController) {
        this.binActions = {
            onShowActionsFor: jasmine.createSpy(),
            setButtonCode: jasmine.createSpy(),
            increaseMainActionCount: jasmine.createSpy(),
            decreaseMainActionCount: jasmine.createSpy()
        };
        this.bindings = {};
        this.$onInit = function() {
            this.$ctrl = $componentController('binActionsGroup', null, this.bindings);
            this.$ctrl.binActions = this.binActions;
            this.$ctrl.$onInit();
        }
    }));

    describe('when for is not defined', function () {
        beforeEach(function() {
            this.$onInit();
        });

        it('actions are visible', function () {
            expect(this.$ctrl.visible).toBeTruthy();
        });

        describe('on show other actions', function () {
            beforeEach(function () {
                this.binActions.onShowActionsFor.calls.mostRecent().args[0]('other');
            });

            it('actions are hidden', function () {
                expect(this.$ctrl.visible).toBeFalsy();
            });
        });

        describe('on show no specific actions', function () {
            beforeEach(function () {
                this.binActions.onShowActionsFor.calls.mostRecent().args[0]();
            });

            it('actions are visible', function () {
                expect(this.$ctrl.visible).toBeTruthy();
            });

            it('set button text', function () {
                expect(this.binActions.setButtonCode).toHaveBeenCalledWith(undefined);
            });
        });

        it('on increase action count', function () {
            this.$ctrl.increaseActionCount();
            expect(this.binActions.increaseMainActionCount).toHaveBeenCalled();
        });

        it('on decrease action count', function () {
            this.$ctrl.decreaseActionCount();
            expect(this.binActions.decreaseMainActionCount).toHaveBeenCalled();
        });
    });

    describe('when for is defined', function () {
        beforeEach(function() {
            this.bindings = {
                for: 'for'
            };
            this.$onInit();
        });

        it('actions are hidden', function () {
            expect(this.$ctrl.visible).toBeFalsy();
        });

        describe('on show other actions', function () {
            beforeEach(function () {
                this.binActions.onShowActionsFor.calls.mostRecent().args[0]('other');
            });

            it('actions are still hidden', function () {
                expect(this.$ctrl.visible).toBeFalsy();
            });
        });

        describe('on show actions', function () {
            beforeEach(function () {
                this.binActions.onShowActionsFor.calls.mostRecent().args[0]('for');
            });

            it('actions are visible', function () {
                expect(this.$ctrl.visible).toBeTruthy();
            });

            it('set button text', function () {
                expect(this.binActions.setButtonCode).toHaveBeenCalledWith(undefined);
            });
        });

        it('on increase action count', function () {
            this.$ctrl.increaseActionCount();
            expect(this.binActions.increaseMainActionCount).not.toHaveBeenCalled();
        });

        it('on decrease action count', function () {
            this.$ctrl.decreaseActionCount();
            expect(this.binActions.decreaseMainActionCount).not.toHaveBeenCalled();
        });
    });

    describe('when buttonI18nCode is defined', function () {
        beforeEach(function() {
            this.bindings = {
                for: 'for',
                buttonI18nCode: 'code'
            };
            this.$onInit();
        });

        describe('on show actions', function () {
            beforeEach(function () {
                this.binActions.onShowActionsFor.calls.mostRecent().args[0]('for');
            });

            it('set button text', function () {
                expect(this.binActions.setButtonCode).toHaveBeenCalledWith('code');
            });
        });
    });
});