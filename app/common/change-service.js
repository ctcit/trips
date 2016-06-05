
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('changeService',
        ['membersService', 'metadataService',
        function (membersService, metadataService) {

            //---------------------------------
            function changeTimestamp(change) {
                var date = new Date(change.timestamp.replace(" ", "T") + "Z");  // "2016-05-14 22:17:38 UTC" won't work on IE; "2016-05-14T22:17:38Z" is equivalent
                return dow[date.getDay()] + " " + date.getDate() + " " + moy[date.getMonth()] + " " + date.toISOString().substr(11, 5);
            }

            function changeName(memberid) {
                return membersService.getMember(memberid) ? membersService.getMember(memberid).name : "blank";
            }

            function changeTable(change) {
                return change.table || (change.line == null ? "trips" : "participants");
            }

            function changeColName(change) {
                return metadataService.getMetadataForTable(changeTable(change))[change.column].Display;
            }

            function changeDescription(change) {
                return change.action == "email"
                        ? "Sent email Subject: " + change.subject :
                    change.line == null
                        ? change.verb + " " + changeColName(change) + " from '" + change.before + "' to '" + change.after + "'" :
                    change.column == "memberid"
                        ? change.verb + " line " + (change.line + 1) + " Member from '" +
                                    changeName(change.before || -1) + "' to '" + changeName(change.after || -1) + "'" :
                    metadataService.getMetadataForTable(changeTable(change))[change.column].Type == "tinyint(1)"
                        ? change.verb + " line " + (change.line + 1) + " " + changeColName(change) + " from " +
                                    (change.before == true ? "yes" : "no") + " to " + (change.after == true ? "yes" : "no")
                        : change.verb + " line " + (change.line + 1) + " " + changeColName(change) + " from '" +
                                    change.before + "' to '" + change.after + "'";
            }

            //---------------------------------

            var highlights = {};

            //---------------------------------

            return {
                changeTimestamp: changeTimestamp,
                changeName: changeName,
                changeDescription: changeDescription,

                highlights: highlights
            }
        }]
    );

}());
