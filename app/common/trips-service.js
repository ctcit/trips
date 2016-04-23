
(function () {
    'use strict';

    angular.module('tripApp').factory('tripsService',
        ['site', '$http', '$q', 'Group', 'Trip', 'Participant',
        function (site, $http, $q, Group, Trip, Participant) {

            //---------------------------------
            // Following variables are obtained as side-effects of getting trips
            // They are cached in this service 
            // (I suggest they be put into their own API methods)

            var config = {};
            var metadata = undefined;
            var userId = undefined;
            var editId = undefined;
            var changes = [];
            var participants = [];
            var members = [];
            var nonmembers = [];


            //---------------------------------

            function getTripGroups() {
                // BSJ -todo
                return $http.get(site.getresturl + "?action=gettrips")
                //return $q.when()
                    .then(function (response) {

                        // BSJ -todo


                        if (ValidateResponse(response)) {
                            // cache these values
                            config = response.config;
                            metadata = response.metadata;
                            userId = response.userid;

                            // resolve on this value
                            return response.groups.map(function (groupData) {
                                return new Group(groupData, response.metadata.trips);
                            });
                        }
                    });
            }

            function getTrip(tripId, editId) {
                var queryString = "?action=gettrip&tripid=" + tripId + (editId != undefined ? ("&editid=" + editid) : "");


                // BSJ -todo
                return $http.get(site.getresturl + queryString)
                //return $q.when()
                    .then(function (response) {



                        // BSJ -todo



                        if (ValidateResponse(response)) {
                            // cache these values
                            config = response.config;
                            metadata = response.metadata;
                            userId = response.userid;
                            editId = response.editid;
                            participants = response.participants.map(function (participant) {
                                return new Participant(participant, response.metadata.participants);
                            });
                            members = response.members;
                            nonmembers = response.nonmembers;

                            // resolve on this value
                            return new Trip(response.trip, response.metadata.trips);
                        }
                    });
            }

            function getConfig() {
                return $q.when(config);
            }

            function getMetadata() {
                return $q.when(metadata);
            }

            function getUserId() {
                return $q.when(userId);
            }

            function getEditId() {
                return $q.when(editId);
            }

            function getParticipants() {
                return $q.when(participants);
            }

            function getChanges() {
                return $q.when(changes);
            }

            function getMembers() {
                return $q.when(members);
            }

            function getNonmembers() {
                return $q.when(nonmembers);
            }


            //---------------------------------

            function ValidateResponse(response) {
                if (typeof (response) == "string") {
                    state.savestate = response;
                    state.$timeout(function () { state.$scope.$apply(); }, 0);
                }
                return typeof (response) == "object";
            }

            //---------------------------------

            // bsj - todo 
            function putTrip(includeEmail) {
                var diffs = calculateDiffs(this.original);

                if (includeEmail) {
                    diffs.splice(0, 0, this.$scope.email);
                }

                // Weed out superfluous diffs
                for (var i = 0; i < diffs.length; i++) {
                    var diff = diffs[i];
                    var participants = this.trip.participants;

                    if (diff.line != null && participants[diff.line].isNew &&
                        state.membersById[participants[diff.line].memberid] &&
                        state.membersById[participants[diff.line].memberid][diff.column] &&
                        state.membersById[participants[diff.line].memberid][diff.column] == diff.after) {
                        diffs.splice(i--, 1);
                    }
                }

                this.savestate = "Saving";
                this.$http.post("api.post.php", { tripid: tripid, diffs: diffs }).success(function (result) {
                    if (ValidateResponse(result)) {
                        $timeout(function () {
                            state.$http.get("api.get.php?action=gettrip&editid=" + editid + "&tripid=" + tripid).success(function (response) {
                                if (ValidateResponse(response)) {
                                    state.savestate = "Saved " + result.result;
                                    state.$scope.trip = state.trip = new Trip(response);
                                    $timeout(function () { state.$scope.$apply(); }, 0);
                                }
                            });
                        }, 1000);
                    }
                }).error(function (data, status) {
                    state.savestate = "FAILED " + data + " " + status;
                    $timeout(function () { state.$scope.$apply(); }, 0);
                });
            };

            //---------------------------------


            function calculateDiffs(currentState, refState) {

                var diffs = [], diff = {};

                for (diff.column in metadata.trips) {
                    diff.before = ToSql(refState.trip[diff.column], metadata.trips[diff.column]);
                    diff.after = ToSql(currentState.trip[diff.column], metadata.trips[diff.column]);
                    if (diff.before != diff.after) {
                        diff.action = "updatetrip";
                        diffs.push(angular.copy(diff));
                    }
                }

                for (diff.line in this.participants) {
                    for (diff.column in metadata.participants) {
                        diff.before = ToSql(refState.participants[diff.line][diff.column], metadata.participants[diff.column]);
                        diff.after = ToSql(currentState.participants[diff.line][diff.column], metadata.participants[diff.column]);
                        if (diff.before != diff.after) {
                            diff.action = currentState.participants[diff.line].isNew ? "insertparticipant" : "updateparticipant";
                            diffs.push(angular.copy(diff));
                        }
                    }
                }

                return diffs;
            }




            //---------------------------------

            return {
                getTripGroups: getTripGroups,

                getTrip: getTrip,
                getConfig: getConfig,
                getMetadata: getMetadata,
                getUserId: getUserId,
                getEditId: getEditId,
                getParticipants: getParticipants,
                getChanges: getChanges,
                getMembers: getMembers,
                getNonmembers: getNonmembers,

                putTrip: putTrip,
                
                calculateDiffs: calculateDiffs
            }
        }]
    );

}());
