(function (angular, jQuery) {
    if (angular.isUndefined(angular.merge)) angular.merge = merge;
    angular.module('angularx', ['angularx.templates', 'notifications', 'config', 'checkpoint', 'angular.usecase.adapter', 'viewport', 'bootstrap.ex', 'toggle.edit.mode'])
        .directive('binSplitInRows', ['viewport', binSplitInRowsDirectiveFactory])
        .directive('binSplitInColumns', binSplitInColumnsDirectiveFactory)
        .directive('binGroupBy', binGroupByDirectiveFactory)
        .directive('binSelectTextOnClick', binSelectTextOnClick)
        .directive('binExposeBoxWidth', binExposeBoxWidth)
        .directive('binToggle', binToggle)
        .directive('binBack', ['$window', BinBackDirectiveFactory])
        .directive('binClickOutside', ['$document', '$timeout', BinClickOutsideDirective])
        .directive('autofocus', ['$timeout', AutofocusDirective])
        .directive('ngClickConfirm', ['binModal', ngClickConfirmDirectiveFactory])
        .component('binListInline', new BinListInlineComponent())
        .component('binScrollToTop', new BinScrollToTopComponent())
        .filter('binTruncate', BinTruncateFilter)
        .filter('binStripHtmlTags', BinStripHtmlTagsFilter)
        .filter('binEncodeUriComponent', ['$window', function ($window) {
            return $window.encodeURIComponent;
        }])
        .filter('binSanitizeUrl', ['$location', sanitizeUrlFilter])
        .service('resourceLoader', ['$q', '$rootScope', '$document', '$compile', '$log', ResourceLoaderService])
        .service('binTemplate', ['$log', 'config', 'activeUserHasPermission', BinTemplateService])
        .service('binDateController', [BinDateController])
        .factory('openCloseMenuFSMFactory', [OpenCloseMenuFSMFactoryFactory])
        .controller('OpenCloseMenuController', ['$scope', 'openCloseMenuFSMFactory', OpenCloseMenuController])
        .factory('applicationMenuFSM', ['openCloseMenuFSMFactory', ApplicationMenuFSMFactory])
        .controller('ApplicationMenuController', ['$scope', 'applicationMenuFSM', ApplicationMenuController])
        .provider('optionsMenuFactory', OptionsMenuFactoryProvider)
        .controller('optionsMenuController', ['$scope', 'optionsMenuFactory', 'usecaseAdapterFactory', OptionsMenuController])
        .factory('predicatedBarrier', ['$q', '$timeout', 'binDateController', PredicatedBarrierFactory])
        .factory('binDebounce', ['$timeout', BinDebounceFactory])
        .factory('binResizeSensor', [BinResizeSensorFactory])
        .factory('binScrollTo', ['$document', BinScrollToFactory])
        .service('binLink', ['$rootScope', '$filter', 'editModeRenderer', BinLinkService])
        .run(['topicMessageDispatcher', EndOfPageListener]);

    function BinDateController() {
        this.now = function () {
            var d = new Date();
            if (this.lockedAt) d.setTime(this.lockedAt);
            return d;
        };

        this.freeze = function () {
            this.lockedAt = new Date().getTime();
        };

        this.resume = function () {
            this.lockedAt = undefined;
        };

        this.jump = function (ms) {
            if (this.lockedAt) this.lockedAt += ms;
        }
    }

    function binSplitInRowsDirectiveFactory(viewport) {
        return function (scope, el, attrs) {
            var destroy;
            var columns = attrs.columns;
            var xs = attrs.colXs;
            var sm = attrs.colSm;
            var md = attrs.colMd;
            var lg = attrs.colLg;

            function splitInRows(items) {
                if (destroy) destroy();
                destroy = viewport.onChange(function (size) {
                    var columnCount;
                    if (size == 'xs') columnCount = xs;
                    else if (size == 'sm') columnCount = sm || xs;
                    else if (size == 'md') columnCount = md || sm || xs;
                    else if (size == 'lg') columnCount = lg || md || sm || xs;
                    if (!columnCount) columnCount = columns || 1;
                    scope.columns = parseInt(columnCount);
                    var rows = [];
                    if (scope.columns > 0) {
                        var index = 0;
                        for (var i = 0; i <= (items.length - 1); i = i + scope.columns) {
                            rows.push({
                                id: index++,
                                items: items.slice(i, i + scope.columns)
                            });
                        }
                    }
                    scope.rows = rows;
                });
            }

            scope.$watchCollection(attrs.binSplitInRows, function (newItems) {
                if (newItems) {
                    if (newItems.length > 0) splitInRows(newItems);
                    else scope.rows = [];
                }
            });

            scope.$on('$destroy', function () {
                if (destroy) destroy();
            });
        }
    }

    function binSplitInColumnsDirectiveFactory() {
        return function ($scope, el, attrs) {
            function splitInColumns(items, columns) {
                var cols = [];
                for (var c = 0; c <= columns - 1; c++) {
                    var it = [];
                    for (var i = c; i <= items.length - 1; i += columns) {
                        it.push(items[i]);
                    }
                    cols.push({id: c, items: it});
                }
                return cols;
            }

            $scope.$watchCollection(attrs.binSplitInColumns, function (newItems) {
                if (newItems) $scope.columns = splitInColumns(newItems, $scope.$eval(attrs.columns));
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
                    if (filters.indexOf(el[filterKey]) == -1) filters.push(el[filterKey]);
                });
                return filters
            }

            function getItemsByFilter(source, filterKey, filterValue) {
                var items = [];
                source.forEach(function (item) {
                    if (filterValue == item[filterKey]) items.push(item);
                });
                return items;
            }

            $scope.$watchCollection(attrs.on, function (newItems) {
                if (newItems) $scope.groups = group(newItems, attrs.binGroupBy);
            });
        }
    }

    function binSelectTextOnClick() {
        return {
            restrict: 'A',
            link: function ($scope, el) {
                el.on('click', function () {
                    this.select();
                });
            }
        };
    }

    function EndOfPageListener(topicMessageDispatcher) {
        $(window).scroll(function () {
            if ($(document).height() <= $(window).scrollTop() + $(window).height())
                topicMessageDispatcher.fire('end.of.page', 'reached');
        });
    }

    function binExposeBoxWidth() {
        return {
            scope: true,
            restrict: 'A',
            link: function ($scope, el) {
                $scope.boxWidth = el.width();
            }
        }
    }

    function binToggle() {
        return {
            restrict: 'A',
            scope: true,
            link: function ($scope) {
                $scope.toggleDisabled = true;
                $scope.toggleEnabled = false;
                $scope.toggle = function () {
                    $scope.toggleDisabled = !$scope.toggleDisabled;
                    $scope.toggleEnabled = !$scope.toggleEnabled;
                }
            }
        }
    }

    function ResourceLoaderService($q, $rootScope, $document, $compile, $log) {
        var head = $document.find('head');
        var scope = $rootScope;
        scope.resources = [];
        var promises = [];

        function addResourceToDom(href) {
            var element = getElement(href);
            scope.resources[href] = element;
            head.append(element);
        }

        function addScriptResourceToDom(href) {
            var element = getScriptElement(href);
            scope.resources[href] = element;
            head.append(element);
        }

        function getElement(href) {
            if (href.slice(-4) == '.css') return getStylesheetElement(href);
            else if (href.slice(-3) == '.js') return getScriptElement(href);
        }

        function getStylesheetElement(href) {
            return $compile('<link rel="stylesheet" type="text/css" href="' + href + '">')(scope);
        }

        function getScriptElement(href) {
            return $compile('<script src="' + href + '" async>')(scope);
        }

        function removeResourceFromDom(href) {
            scope.resources[href].remove();
            delete scope.resources[href];
        }

        return {
            add: function (href) {
                $log.warn('Deprecation warning: use "getScript" instead of "add" to load "' + href + '".');
                if (!scope.resources[href]) addResourceToDom(href);
            },
            addScript: function (href) {
                $log.warn('Deprecation warning: use "getScript" instead of "addScript" to load "' + href + '".');
                if (!scope.resources[href]) addScriptResourceToDom(href);
            },
            remove: function (href) {
                $log.warn('Deprecation warning: "remove" is not supported anymore. Removing "' + href + '".');
                if (scope.resources[href]) removeResourceFromDom(href);
            },
            getScript: function (url) {
                if (!promises[url]) {
                    promises[url] = $q.when(jQuery.ajax({
                        url: url,
                        dataType: 'script',
                        cache: true
                    }));

                    promises[url].then(function () {
                    }, function () {
                        promises[url] = undefined;
                        $log.warn('Failed to load script: ' + url);
                    });
                }

                return promises[url];
            }
        };
    }

    // @deprecated
    function BinTemplateService($log, config, activeUserHasPermission) {
        this.setTemplateUrl = function (args) {
            var scope = args.scope;

            function setTemplateUrlToScope() {
                var componentsDir = config.componentsDir || 'bower_components';
                var styling = config.styling ? config.styling + '/' : '';
                scope.templateUrl = componentsDir + '/binarta.' + args.module + '.angular/template/' + styling + args.name;
                $log.warn('Deprecation warning: templates are now stored in templateCache. TemplateUrl: "' + scope.templateUrl + '"');
            }

            if (args.permission) {
                activeUserHasPermission({
                    yes: function () {
                        setTemplateUrlToScope();
                    },
                    no: function () {
                        delete scope.templateUrl;
                    },
                    scope: args.scope
                }, args.permission);
            } else {
                setTemplateUrlToScope();
            }
        };
    }

    function PredicatedBarrierFactory($q, $timeout, clock) {
        var duration = 1000;

        function waitFor(args) {
            if (args.timeout != undefined && args.now.getTime() > args.timeout) args.deferred.reject('timeout');
            else {
                args.predicate().then(args.deferred.resolve, function () {
                    if (args.timeout != undefined)
                        $timeout(function () {
                            args.now = clock.now();
                            waitFor(args);
                        }, duration);
                    else args.deferred.reject('timeout')
                });
            }
        }

        return function (args) {
            var d = $q.defer();
            var now = clock.now();
            if (args.predicate) waitFor({
                predicate: args.predicate,
                deferred: d,
                now: now,
                timeout: args.timeout ? now.getTime() + args.timeout : undefined
            });
            else d.resolve();
            return d.promise;
        }
    }

    function BinBackDirectiveFactory($window) {
        return {
            restrict: 'CA',
            link: function (scope, element) {
                element.on('click', function () {
                    $window.history.back();
                });
            }
        }
    }

    function BinClickOutsideDirective($document, $timeout) {
        return {
            restrict: 'A',
            scope: {
                callback: '&binClickOutside'
            },
            link: function (scope, element) {
                var click = 'click',
                    touchStart = 'touchstart',
                    touchEnd = 'touchend',
                    touchMove = 'touchmove',
                    events = click + ' ' + touchStart + ' ' + touchEnd + ' ' + touchMove,
                    moved = false,
                    isTouchDevice = false;

                $document.on(events, handler);

                function handler(event) {
                    if (event.type === touchStart) {
                        isTouchDevice = true;
                        moved = false;
                    }
                    if (event.type === touchMove) moved = true;
                    if ((event.type === touchEnd && !moved) || (event.type === click && !isTouchDevice)) execute(event);
                }

                function execute(event) {
                    if (scope.callback && !angular.element.contains(element[0], event.target)) $timeout(scope.callback);
                }

                scope.$on('$destroy', function () {
                    $document.off(events, handler);
                });
            }
        }
    }

    function AutofocusDirective($timeout) {
        return {
            restrict: 'A',
            link : function(scope, el) {
                $timeout(function() {
                    el[0].focus();
                });
            }
        }
    }

    function ngClickConfirmDirectiveFactory(modal) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.$apply(openModal);
                });

                function openModal() {
                    modal.open({
                        templateUrl: 'bin-click-confirm.html',
                        $ctrl: {
                            message: getMessage(),
                            yes: function () {
                                executeClickHandler();
                                modal.close();
                            },
                            no: function() {
                                modal.close()
                            },
                        }
                    });
                }

                function executeClickHandler() {
                    scope.$eval(attrs.ngClickConfirm);
                }

                function getMessage() {
                    return attrs.confirmMessage || 'Are you sure?';
                }
            }
        }
    }

    function BinListInlineComponent() {
        this.template = '<ul ng-transclude></ul>';

        this.transclude = true;

        this.controller = ['$element', 'topicRegistry', 'viewport', function ($element, topicRegistry, viewport) {
            var $ctrl = this;
            var lastItemClass = 'last-item';
            var emptyItemClass = 'empty-item';
            var list, listItems, editing;

            $ctrl.$postLink = function () {
                list = $element.find('ul');
                listItems = list.children();
                var listObserver;

                if (window.MutationObserver) {
                    listObserver = new MutationObserver(updateClasses);
                    listObserver.observe(list[0], {childList: true, subtree: true});
                } else {
                    //Fallback for browsers that don't support mutation observers.
                    list.on('DOMSubtreeModified', updateClasses);
                    listObserver = {
                        disconnect: function () {
                            list.off('DOMSubtreeModified', updateClasses);
                        }
                    };
                }

                var viewportObserver = viewport.onChange(updateClasses);
                topicRegistry.subscribe('edit.mode', editModeListener);

                $ctrl.$onDestroy = function () {
                    listObserver.disconnect();
                    viewportObserver();
                    topicRegistry.unsubscribe('edit.mode', editModeListener);
                };
            };

            function updateClasses() {
                var lastItem;
                angular.forEach(listItems, function (it) {
                    var item = angular.element(it);
                    if (!it.innerText && !editing) item.addClass(emptyItemClass);
                    else item.removeClass(emptyItemClass);
                    if (lastItem) {
                        if (lastItem.offset().top !== item.offset().top) lastItem.addClass(lastItemClass);
                        else lastItem.removeClass(lastItemClass);
                    }
                    lastItem = item;
                });
            }

            function editModeListener(e) {
                editing = e;
                updateClasses();
            }
        }];
    }

    function BinScrollToTopComponent() {
        this.template = '<button type="button" ng-click="$ctrl.scroll()"><i class="fa fa-angle-up"></i></button>';

        this.bindings = {
            to: '@'
        };

        this.controller = ['$timeout', '$document', '$element', 'binScrollTo', function ($timeout, $document, $element, binScrollTo) {
            var $ctrl = this;
            var scrollToElementName;
            var scrollToElement;
            var threshold = 2000;
            var isHidden, isVisible;

            $ctrl.$onInit = function () {
                scrollToElementName = $ctrl.to || 'body';
                scrollToElement = $document.find(scrollToElementName);
                $element.hide();
                isHidden = true;

                $document.on('scroll', onScroll);

                $ctrl.scroll = function () {
                    binScrollTo(scrollToElementName);
                };
            };

            function onScroll() {
                requestAnimationFrame(function () {
                    isBelowThreshold() ? show() : hide();
                });
            }

            function requestAnimationFrame(cb) {
                if (window.requestAnimationFrame) window.requestAnimationFrame(cb);
                else $timeout(cb, 20);
            }

            function isBelowThreshold() {
                if (!scrollToElement[0]) return false;
                var rect = scrollToElement[0].getBoundingClientRect();
                return rect.top < -threshold;
            }

            function show() {
                if (isHidden) {
                    $element.fadeIn();
                    isVisible = true;
                }
            }

            function hide() {
                if (isVisible) {
                    $element.fadeOut();
                    isHidden = true;
                }
            }
        }];
    }

    function OpenCloseMenuFSM() {
        var self = this;

        function ClosedState() {
            this.status = 'closed';
            this.close = function (fsm) {
            };
            this.open = function (fsm) {
                fsm.currentState = new OpenedState();
            };
            this.toggle = function (fsm) {
                this.open(fsm);
            }
        }

        function OpenedState() {
            this.status = 'opened';
            this.open = function (fsm) {
            };
            this.close = function (fsm) {
                fsm.currentState = new ClosedState();
            };
            this.toggle = function (fsm) {
                this.close(fsm);
            }
        }

        this.currentState = new ClosedState();

        this.status = function () {
            return self.currentState.status;
        };
        this.close = function () {
            self.currentState.close(self);
        };
        this.open = function () {
            self.currentState.open(self);
        };
        this.toggle = function () {
            self.currentState.toggle(self);
        }
    }

    function OpenCloseMenuFSMFactoryFactory() {
        var fsms = {};

        return function (args) {
            if (!fsms[args.id]) fsms[args.id] = new OpenCloseMenuFSM();
            return fsms[args.id];
        };
    }

    function ApplicationMenuFSMFactory(openCloseMenuFSMFactory) {
        return openCloseMenuFSMFactory({id: 'application'});
    }

    function OpenCloseMenuController($scope, openCloseMenuFSMFactory) {
        var dummy = function () {
        };

        $scope.status = dummy;
        $scope.open = dummy;
        $scope.close = dummy;
        $scope.toggle = dummy;

        $scope.connect = function (args) {
            var fsm = openCloseMenuFSMFactory(args);

            $scope.status = fsm.status;
            $scope.open = fsm.open;
            $scope.close = fsm.close;
            $scope.toggle = fsm.toggle;
        }
    }

    function ApplicationMenuController($scope, applicationMenuFSM) {
        $scope.status = applicationMenuFSM.status;
        $scope.open = applicationMenuFSM.open;
        $scope.close = applicationMenuFSM.close;
        $scope.toggle = applicationMenuFSM.toggle;

        this.status = applicationMenuFSM.status;
        this.open = applicationMenuFSM.open;
        this.close = applicationMenuFSM.close;
        this.toggle = applicationMenuFSM.toggle;
    }

    function MenuOption(args) {
        var self = this;

        this.id = function () {
            return args.ctx.id
        };
        this.select = function () {
            args.menu.select(self);
        }
    }

    function OptionsMenu(args) {
        var self = this;
        var options = (args.options || []).map(function (it) {
            return new MenuOption({menu: self, ctx: it});
        });
        var reader = function () {
        };
        var writer = function () {
        };
        var currentSelection;

        this.options = function () {
            return options;
        };

        this.currentSelection = function () {
            return currentSelection;
        };

        var setCurrentSelectionTo = function (initialSelection) {
            if (initialSelection) currentSelection = options.reduce(function (p, c) {
                return p || (c.id() == initialSelection ? c : p);
            }, undefined);
        };
        setCurrentSelectionTo(args.default);

        this.installIOHandlers = function (args) {
            reader = args.reader;
            writer = args.writer;
            reader({
                success: setCurrentSelectionTo,
                notFound: function () {
                },
                error: function () {
                }
            });
        };

        this.select = function (option) {
            currentSelection = option;
        };

        this.saveCurrentSelection = function (response) {
            writer(currentSelection.id(), response);
        }
    }

    function OptionsMenuFactoryProvider() {
        var config = {};
        var menus = {};

        this.installOptions = function (args) {
            config[args.id] = args;
        };

        this.$get = [function () {
            return function (args) {
                if (!menus[args.id]) menus[args.id] = new OptionsMenu(config[args.id] || {});
                return menus[args.id];
            }
        }]
    }

    function OptionsMenuController($scope, optionsMenuFactory, usecaseAdapterFactory) {
        var dummy = function () {
            return {}
        };
        var originalSelection, saved;
        var self = this;

        $scope.init = function (args) {
            self.ctx = args;
        };

        $scope.options = dummy;
        $scope.currentSelection = dummy;
        $scope.pristine = function () {
            return !originalSelection;
        };
        $scope.saved = function () {
            return saved;
        };

        $scope.connect = function (args) {
            var menu = optionsMenuFactory(args);
            $scope.options = menu.options;
            $scope.currentSelection = menu.currentSelection;
            $scope.saveCurrentSelection = function () {
                menu.saveCurrentSelection(usecaseAdapterFactory($scope, function () {
                    originalSelection = undefined;
                    saved = true;
                    if (self.ctx && self.ctx.success) self.ctx.success();
                }));
            }
        };

        $scope.select = function (option) {
            saved = undefined;
            if (!originalSelection) originalSelection = $scope.currentSelection();
            else if (option.id() == originalSelection.id()) originalSelection = undefined;
            option.select();
        }
    }

    function merge(dst) {
        var slice = [].slice;
        var isArray = Array.isArray;

        function baseExtend(dst, objs, deep) {
            for (var i = 0, ii = objs.length; i < ii; ++i) {
                var obj = objs[i];
                if (!angular.isObject(obj) && !angular.isFunction(obj)) continue;
                var keys = Object.keys(obj);
                for (var j = 0, jj = keys.length; j < jj; j++) {
                    var key = keys[j];
                    var src = obj[key];
                    if (deep && angular.isObject(src)) {
                        if (!angular.isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
                        baseExtend(dst[key], [src], true);
                    } else {
                        dst[key] = src;
                    }
                }
            }

            return dst;
        }

        return baseExtend(dst, slice.call(arguments, 1), true);
    }

    function BinTruncateFilter() {
        return function (value, length) {
            if (value) {
                var ellipsis = '\u2026';
                var shouldAddEllipsis = false;
                var limit = length || 50;
                if (length == 0) return ellipsis;
                else return truncate(angular.element('<div>' + value + '</div>')).html();

                function truncate(parent) {
                    return angular.forEach(parent, function (el) {
                        var element = angular.element(el);
                        var text = element.text();
                        var excess = text.length - limit;
                        if (excess > 0) {
                            shouldAddEllipsis = true;
                            excess = text.length - text.slice(0, limit).replace(/(\S+)$/, '').length;
                        }
                        if (excess < 0) return;
                        if (!excess) {
                            if (shouldAddEllipsis) element.append(ellipsis);
                            return;
                        }

                        var reversedChildNodes = element.contents().get().reverse();
                        for (var i = 0; i <= reversedChildNodes.length; i++) {
                            var childNode = reversedChildNodes[i];
                            var childElement = angular.element(childNode);
                            var childTextLength = childElement.text().length;

                            if (childTextLength <= excess) {
                                excess -= childTextLength;
                                if (excess > 0) childElement.remove();
                                else {
                                    childElement.replaceWith(ellipsis);
                                    break;
                                }
                            } else {
                                if (childNode.nodeType == 3) {
                                    angular.element(childNode.splitText(childTextLength - excess)).replaceWith(ellipsis);
                                    break;
                                }
                                limit = childTextLength - excess;
                                truncate(childElement);
                                break;
                            }
                        }
                    });
                }
            }
        };
    }

    function BinStripHtmlTagsFilter() {
        return function (value) {
            if (value) return value.replace(/(<([^>]+)>)/ig, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    function BinDebounceFactory($timeout) {
        return function (callback, delay, immediate) {
            var timeout;
            if (immediate) callback();
            return function () {
                if (timeout) $timeout.cancel(timeout);
                timeout = $timeout(function () {
                    callback();
                }, delay || 200);
            }
        };
    }

    function BinResizeSensorFactory() {
        return ResizeSensor;
    }

    function BinScrollToFactory($document) {
        var page = jQuery('body,html');

        return function (element, duration) {
            var el = $document.find(element);
            if (el) scrollTo(el.offset().top, duration);
        };

        function scrollTo(pos, duration) {
            page.animate({scrollTop: pos}, duration || 800);
        }
    }

    function sanitizeUrlFilter($location) {
        return function (value) {
            if (value) return sanitize(value);
        };

        function sanitize(url) {
            if (url.substr(0,1) !== '/') {
                if (!hasProtocol(url)) url = 'http://' + url;
                var parts = getParts(url);
                if (isRelative(parts.domain)) url = parts.path;
            }
            return stripHashbang(url);
        }

        function isRelative(domain) {
            if (angular.isUndefined(domain)) return true;
            return $location.absUrl().substr(0, domain.length) === domain;
        }

        function hasProtocol(link) {
            return link.search(/^[a-zA-Z]+:\/\//) != -1;
        }

        function getParts(link) {
            var parts = link.match(/^(([a-zA-Z]+:\/\/)[^\/]+)(.*)$/) || [];
            return {
                protocol: parts[2],
                domain: parts[1],
                path: parts[3] || '/'
            }
        }

        function stripHashbang(link) {
            return link.replace(/[\/]?#!/, '');
        }
    }

    function BinLinkService($rootScope, $filter, editModeRenderer) {
        this.open = function (args) {
            var rendererId = 'popup';
            var scope = $rootScope.$new();
            scope.link = {
                href: args.href || 'http://',
                text: args.text || '',
                target: args.target == undefined ? true : args.target === '_blank'
            };
            scope.allowText = args.allowText;
            scope.cancel = function () {
                editModeRenderer.close({id: rendererId})
            };

            scope.submit = function () {
                reset();
                startWorking('submit');
                scope.link.href = $filter('binSanitizeUrl')(scope.link.href);

                args.onSubmit({
                    href: scope.link.href || '',
                    text: scope.link.text || '',
                    target: scope.link.target ? '_blank' : '',
                    success: onSuccess,
                    error: onError
                });
            };

            if (args.onRemove && args.href) {
                scope.remove = function () {
                    reset();
                    startWorking('remove');
                    args.onRemove({
                        success: onSuccess,
                        error: onError
                    });
                };
            }

            function reset() {
                scope.violation = false;
            }

            function startWorking(ctx) {
                scope.working = true;
                scope.submitting = ctx === 'submit';
                scope.removing = ctx === 'remove';
            }

            function stopWorking() {
                scope.working = false;
                scope.submitting = false;
                scope.removing = false;
            }

            function onSuccess() {
                editModeRenderer.close({id: rendererId});
            }

            function onError() {
                scope.violation = true;
                stopWorking();
            }

            editModeRenderer.open({
                templateUrl: 'bin-link-edit.html',
                id: 'popup',
                scope: scope
            });
        };
    }
})(angular, jQuery);