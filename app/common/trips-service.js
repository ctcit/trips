
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('tripsService',
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
            var tripeditable = false;

            var editSession = undefined;

            var lastResponseMessage = undefined;

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
                var queryString = "?action=gettrip&tripid=" + tripId + (editId != undefined ? ("&editid=" + editId) : "");

                return $http.get(site.getresturl + queryString)
                    .then(function (response) {

                        if (ValidateResponse(response)) {
                            var data = response.data;

                            //------------------
                            // cache these values

                            config = data.config;
                            metadata = data.metadata;
                            members = data.members ? data.members : [];
                            userId = data.userid.toString(); // all other member ids are string

                            //------------------
                            // Trip
                            var tripDetail = new TripDetail(data.trip, data.metadata.trips);

                            var tripEmail = new TripEmail();
                            tripEmail.setSubject("RE: " + tripDetail.title + " trip on " + tripDetail.FullDate());

                            var participants = data.participants ? data.participants.map(function (participant) {
                                return new Participant(participant, data.metadata.participants);
                            }) : [];
                            // add additional particpant lines; also preserve participants in their original line position
                            var maxLine = participants
                                .map(function (participant) { return participant.line; })
                                .reduce(function (previous, current) { return Math.max(previous, current); }, 0);
                            var maxLength = Math.max(maxLine + 1, participants.length) + (config.AdditionalLines ? config.AdditionalLines : 0);
                            var tempParticipants = participants.slice(); //shallow copy
                            for (var i = 0; i < maxLength ; i++) {
                                participants[i] = new Participant({ isNew: true, line: i });
                            }
                            tempParticipants.forEach(function (participant) {
                                participants[participant.line] = participant;
                            })


                            tripeditable = false;
                            members.some(function (member) {
                                if (member.id == userId) {
                                    tripeditable = member.role != null;
                                    return true;
                                }
                                return false;
                            });
                            tripeditable = tripeditable || participants.some(function (participant) {
                                return participant.memberid == userId && participant.isLeader;
                            })
                            participants.forEach(function (participant, i) {
                                participant.nameui = (tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
                            })

                            var nonmembers = [];
                            if (data.nonmembers) {
                                for (var i in data.nonmembers) {
                                    nonmembers.push(data.nonmembers[i]);
                                }
                            }

                            trip = new Trip(tripDetail, tripEmail, participants, nonmembers);
                            
                            //------------------
                            // EditSession
                            var editId = data.editid;

                            var changes = !data.changes ? [] :
                                data.changes.map(function (group) {
                                    return group.map(function (change) {
                                        return new Change(change);
                                    })
                                });

                            editSession = new EditSession(editId, changes, [], []);

                            //------------------

                            editSession.changes.forEach(function (group) {
                                return group.forEach(function (change) {
                                    if (change.line != null && participants[change.line]) {
                                        trip.participants[change.line].iseditable = change.memberid == userId;
                                    }
                                })
                            });

                            //------------------

                            // resolve on this value
                            return trip;
                        }
                    });
            }

            function getTripEdits(tripId, editId) {
                var queryString = "?action=editrefresh&tripid=" + tripId + "&editid=" + editId;

                return $http.get(site.getresturl + queryString)
                    .then(function (response) {

                        if (ValidateResponse(response)) {
                            var data = response.data;
                            editSession.edits = data.edits ? data.edits : [];
                            editSession.modifications = data.modifications ? data.modifications : [];
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

            function putTrip(tripId, editId, diffs) {
                return $http.post(site.postresturl, { tripid: tripId, diffs: diffs })
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            lastResponseMessage = response.data.result ? response.data.result : undefined;
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
                return response && response.data && typeof (response.data) == "object";
            }

            //---------------------------------

            return {
                getTripGroups: getTripGroups,

                getTrip: getTrip,
                tripeditable: function () { return tripeditable; },

                getConfig: getConfig,
                getMetadata: getMetadata,
                getMembers: getMembers,
                getUserId: getUserId,

                getEditSession: getEditSession,
                getTripEdits: getTripEdits,

                putTrip: putTrip,

                closeEditSession: closeEditSession,

                lastResponseMessage: function () { return lastResponseMessage; }
            }
        }]
    );

}());
