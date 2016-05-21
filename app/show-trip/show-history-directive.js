(function () {
    'use strict';

    angular.module('tripApp').directive('showHistory', [function () {

        var controller = ['membersService', 'metadataService',
            function (membersService, metadataService) {

                var showHistoryController = this;

                showHistoryController.changeTimestamp = function changeTimestamp(change) {
                    var date = new Date(change.timestamp.replace(" ", "T") + "Z");  // "2016-05-14 22:17:38 UTC" won't work on IE; "2016-05-14T22:17:38Z" is equivalent
                    return dow[date.getDay()] + " " + date.getDate() + " " + moy[date.getMonth()] + " " + date.toISOString().substr(11, 5);
                };

                showHistoryController.changeName = function changeName(memberid) {
                    return membersService.getMember(memberid) ? membersService.getMember(memberid).name : "blank";
                };

                showHistoryController.changeTable = function changeTable(change) {
                    return change.table || (change.line == null ? "trips" : "participants");
                };

                showHistoryController.changeColName = function changeColName(change) {
                    return metadataService.getMetadataForTable(showHistoryController.changeTable(change))[change.column].Display;
                };

                showHistoryController.changeDescription = function changeDescription(change) {
                    return change.action == "email"
                            ? "Sent email Subject: " + change.subject :
                        change.line == null
                            ? change.verb + " " + showHistoryController.changeColName(change) + " from '" + change.before + "' to '" + change.after + "'" :
                        change.column == "memberid"
                            ? change.verb + " line " + (parseInt(change.line) + 1) + " Member from '" +
                                        showHistoryController.changeName(change.before || -1) + "' to '" + showHistoryController.changeName(change.after) + "'" :
                        metadataService.getMetadataForTable(showHistoryController.changeTable(change))[change.column].Type == "tinyint(1)"
                            ? change.verb + " line " + (parseInt(change.line) + 1) + " " + showHistoryController.changeColName(change) + " from " +
                                        (change.before == true ? "yes" : "no") + " to " + (change.after == true ? "yes" : "no")
                            : change.verb + " line " + (parseInt(change.line) + 1) + " " + showHistoryController.changeColName(change) + " from '" +
                                        change.before + "' to '" + change.after + "'";
                };

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
