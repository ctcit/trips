
(function () {
    'use strict';

    angular.module('tripApp').factory('tripsService',
        ['site', '$http', '$q', 'Group', 'Trip', 'TripDetail', 'Participant', 'TripEmail', 'EditSession', 'Change',
        function (site, $http, $q, Group, Trip, TripDetail, Participant, TripEmail, EditSession, Change) {

            //---------------------------------
            // Following variables are obtained as side-effects of getting trips
            // They are cached in this service 
            // (I suggest they be put into their own API methods)

            var config = {};
            var metadata = undefined;
            var members = [];
            var userId = undefined;

            var trip = undefined;

            var editSession = undefined;


            //---------------------------------

            function getTripGroups() {

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
                            members = response.members ? response.members : [];
                            userId = response.userid;

                            // Trip
                            var tripDetail = new TripDetail(response.trip, response.metadata.trips);
                            var tripEmail = new TripEmail();
                            tripEmail.setSubject("RE: " + tripDetail.title + " trip on " + tripDetail.FullDate());
                            var participants = response.participants ? response.participants.map(function (participant) {
                                return new Participant(participant, response.metadata.participants);
                            }) : [];
                            var nonmembers = response.nonmembers ? response.nonmembers : [];
                            trip = new Trip(tripDetail, tripEmail, participants, nonmembers);
                            
                            // EditSession
                            var editId = response.editid;
                            var changes = !response.changes ? [] :
                                response.changes.map(function (group) {
                                    return group.map(function (change) {
                                        return new Change(change);
                                    })
                                });
                            var edits = response.edits ? response.edits : [];
                            var modifications = response.modifications ? response.modifications : [];
                            editSession = new EditSession(editId, changes, edits, modifications);

                            // resolve on this value
                            return trip;
                        }
                    });
            }

            function getConfig() {
                return $q.when(config);
            }

            function getMetadata() {
                return $q.when(metadata);
            }

            function getMembers() {
                return $q.when(members);
            }

            function getUserId() {
                return $q.when(userId);
            }



            function getEditSession() {
                return $q.when(editSession);
            }

            //---------------------------------

            function putTrip(tripId, diffs) {
                return $http.post("api.post.php", { tripid: tripId, diffs: diffs })
                    .then(function (response) {
                        if (ValidateResponse(result)) {
                            return getTrip(tripid, editId);
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
                getMembers: getMembers,
                getUserId: getUserId,

                getEditSession: getEditSession,

                putTrip: putTrip,

                closeEditSession: closeEditSession
            }
        }]
    );

}());
