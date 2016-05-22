
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
            var participants = [];
            var members = [];
            var nonmembers = [];
            var edits = [];
            var modifications = [];
            var changes = [];


            //---------------------------------

            function getTripGroups() {
                // BSJ -todo
                return $http.get(site.getresturl + "?action=gettrips")
                    .then(function (response) {

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

                return $http.get(site.getresturl + queryString)
                    .then(function (response) {

                        if (ValidateResponse(response)) {
                            // cache these values
                            config = response.config;
                            metadata = response.metadata;
                            userId = response.userid;
                            editId = response.editid;
                            participants = response.participants ? response.participants.map(function (participant) {
                                return new Participant(participant, response.metadata.participants);
                            }) : [];
                            members = response.members ? response.members : [];
                            nonmembers = response.nonmembers ? response.nonmembers : [];

                            edits = response.edits ? response.edits : [];
                            modifications = response.modifications ? response.modifications : [];
                            changes = response.changes ? response.changes : [];

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

            function getEdits() {
                return $q.when(edits);
            }

            function getModifications() {
                return $q.when(modifications);
            }

            //---------------------------------

            function putTrip(tripId, diffs) {
                return $http.post("api.post.php", { tripid: tripId, diffs: diffs })
                    .then(function (response) {
                        if (ValidateResponse(result)) {
                            return $http.get("api.get.php?action=gettrip&editid=" + editid + "&tripid=" + tripid)
                                .then(function (response) {
                                    if (ValidateResponse(response)) {
                                        return new Trip(response.trip, response.metadata.trips);
                                    }
                                });
                        }
                    });
            };


            //---------------------------------

            function closeEditSession(editId) {
                return $http.get("api.get.php?action=editend&editid=" + editId);
            };

            //---------------------------------

            function ValidateResponse(response) {
                if (typeof (response) == "string") {
                    state.savestate = response;
                    state.$timeout(function () { state.$scope.$apply(); }, 0);
                }
                return typeof (response) == "object";
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
                getEdits: getEdits,
                getModifications: getModifications,

                putTrip: putTrip,

                closeEditSession: closeEditSession
            }
        }]
    );

}());
