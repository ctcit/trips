
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
                            var data = response.data;

                            // cache these values
                            config = data.config;
                            metadata = data.metadata;
                            userId = data.userid;

                            // resolve on this value
                            return data.groups.map(function (groupData) {
                                return new Group(groupData, data.metadata.trips);
                            });
                        }
                    });
            }

            function getTrip(tripId, editId) {
                var queryString = "?action=gettrip&tripid=" + tripId + (editId != undefined ? ("&editid=" + editid) : "");

                return $http.get(site.getresturl + queryString)
                    .then(function (response) {

                        if (ValidateResponse(response)) {
                            var data = response.data;

                            // cache these values

                            config = data.config;
                            metadata = data.metadata;
                            members = data.members ? data.members : [];
                            userId = data.userid;

                            // Trip
                            var tripDetail = new TripDetail(data.trip, data.metadata.trips);
                            var tripEmail = new TripEmail();
                            tripEmail.setSubject("RE: " + tripDetail.title + " trip on " + tripDetail.FullDate());
                            var participants = data.participants ? data.participants.map(function (participant) {
                                return new Participant(participant, data.metadata.participants);
                            }) : [];
                            var nonmembers = data.nonmembers ? data.nonmembers : [];
                            trip = new Trip(tripDetail, tripEmail, participants, nonmembers);
                            
                            // EditSession
                            var editId = data.editid;
                            var changes = !data.changes ? [] :
                                data.changes.map(function (group) {
                                    return group.map(function (change) {
                                        return new Change(change);
                                    })
                                });
                            var edits = data.edits ? data.edits : [];
                            var modifications = data.modifications ? data.modifications : [];
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
                return $http.post(site.postresturl, { tripid: tripId, diffs: diffs })
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            return getTrip(tripId, editId);
                        }
                    });
            };


            //---------------------------------

            function closeEditSession(editId) {
                return $http.get(site.getresturl + "?action=editend&editid=" + editId);
            };

            //---------------------------------

            function ValidateResponse(response) {
                if (typeof (response) == "string") {
// todo                    savestate = response;
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
