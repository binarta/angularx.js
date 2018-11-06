describe('<bin-action></bin-action>', function () {
    var $ctrl, binActions, binActionsGroup;

    beforeEach(module('angularx'));

    beforeEach(inject(function($componentController, i18nLocation) {
        this.i18nLocation = i18nLocation;
        this.binActions = {
            showActionsFor: jasmine.createSpy(),
            startWorking: jasmine.createSpy(),
            stopWorking: jasmine.createSpy()
        };
        this.binActionsGroup = {
            increaseActionCount: jasmine.createSpy(),
            decreaseActionCount: jasmine.createSpy()
        };
        this.bindings = {};
        this.$onInit = function() {
            this.$ctrl = $componentController('binAction', null, this.bindings);
            this.$ctrl.binActions = this.binActions;
            this.$ctrl.binActionsGroup = this.binActionsGroup;
            this.$ctrl.$onInit();
        }
    }));

    describe('with type selector', function () {
        beforeEach(function() {
            this.bindings.selector = 'foo';
            this.bindings.type = 'selector';
            this.$onInit();
        });

        it('on execute', function () {
            this.$ctrl.execute();
            expect(this.binActions.showActionsFor).toHaveBeenCalledWith('foo');
        });

        it('action is registered to binActionsGroup', function () {
            expect(this.binActionsGroup.increaseActionCount).toHaveBeenCalled();
        });

        describe('on destroy', function () {
            beforeEach(function () {
                this.$ctrl.$destroy();
            });

            it('action is unregistered', function () {
                expect(this.binActionsGroup.decreaseActionCount).toHaveBeenCalled();
            });
        });
    });

    describe('with type link', function() {
        beforeEach(function() {
            this.bindings.type = 'link';
            this.bindings.link = '/path/to/go/to';
            this.$onInit();
        });

        it('navigates to the link on execute', function() {
            this.$ctrl.execute();
            expect(this.i18nLocation.path).toHaveBeenCalledWith(this.bindings.link);
        })
    });
    
    describe('with type expression', function() {
        beforeEach(function() {
            this.expressionSpy = jasmine.createSpy('expression');
            this.bindings.expression = this.expressionSpy;
            this.bindings.type = 'expression';
            this.$onInit();
        });

        it('action is registered to binActionsGroup', function () {
            expect(this.binActionsGroup.increaseActionCount).toHaveBeenCalled();
        });

        describe('on execute action', function () {
            beforeEach(function () {
                this.$ctrl.execute();
            });

            it('is executed', function () {
                expect(this.expressionSpy).toHaveBeenCalled();
            });

            describe('and action returns an object with a finally callback', function () {
                var deferred;

                beforeEach(function () {
                    deferred = {
                        finally: jasmine.createSpy()
                    };
                    this.expressionSpy.and.returnValue(deferred);
                    this.$ctrl.execute();
                });

                it('is executed', function () {
                    expect(this.expressionSpy).toHaveBeenCalled();
                });

                it('is working', function () {
                    expect(this.$ctrl.working).toBeTruthy();
                    expect(this.binActions.startWorking).toHaveBeenCalled();
                });

                describe('on finally', function () {
                    beforeEach(function () {
                        deferred.finally.calls.mostRecent().args[0]();
                    });

                    it('is not working', function () {
                        expect(this.$ctrl.working).toBeFalsy();
                        expect(this.binActions.stopWorking).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('when working', function () {
            beforeEach(function () {
                this.$ctrl.working = true;
            });

            describe('on execute action', function () {
                beforeEach(function () {
                    this.$ctrl.execute();
                });

                it('is not executed', function () {
                    expect(this.expressionSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe('when disabled', function () {
            beforeEach(function () {
                this.$ctrl.disabled = true;
            });

            describe('on execute action', function () {
                beforeEach(function () {
                    this.$ctrl.execute();
                });

                it('is not executed', function () {
                    expect(this.expressionSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe('on destroy', function () {
            beforeEach(function () {
                this.$ctrl.$destroy();
            });

            it('action is unregistered', function () {
                expect(this.binActionsGroup.decreaseActionCount).toHaveBeenCalled();
            });
        });
    })
});