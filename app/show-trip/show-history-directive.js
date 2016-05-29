(function () {
    'use strict';

    angular.module('tripApp').directive('showHistory', [function () {

        var controller = ['changeService',
        function (changeService) {

                var showHistoryController = this;

                showHistoryController.changeTimestamp = changeService.changeTimestamp;

                showHistoryController.changeName = changeService.changeName;

                showHistoryController.changeDescription = changeService.changeDescription;

                showHistoryController.changeDetailToggle = function changeDetailToggle(change) {
                    var g, c;
                    var classnames = { highlight5: 1, highlight4: 1, highlight3: 1, highlight2: 1, highlight1: 1 };

                    change.classname = "";
                    change.showdetail = !change.showdetail;

                    if (change.showdetail) {

                        for (g in showHistoryController.changes) {
                            delete classnames[showHistoryController.changes[g][0].classname];
                        }

                        for (change.classname in classnames) {
                        }
                    }

                    showHistoryController.highlights = {};
                    for (g in showHistoryController.changes) {
                        var group = showHistoryController.changes[g][0];
                        if (group.classname != "") {
                            for (c in showHistoryController.changes[g]) {
                                var change = showHistoryController.changes[g][c];
                                showHistoryController.highlights[(change.action == "insert" ? "" : change.column) +
                                         (change.line == null ? "" : change.line)] = group.classname;
                            }
                        }
                    }
                };

            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showhistory: '=',
                changes: '=',
                highlights: '='
            },
            controller: controller,
            controllerAs: 'showHistoryController',
            templateUrl: 'app/show-trip/show-history.html'
        };
    }]);

}());
