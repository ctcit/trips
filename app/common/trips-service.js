
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('tripsService',
        ['site', '$http', '$q', 'configService', 'currentUserService', 'metadataService', 'membersService', 'Group', 'Trip', 'TripDetail', 'Participant', 'TripEmail', 'EditSession', 'Change',
        function (site, $http, $q, configService, currentUserService, metadataService, membersService, Group, Trip, TripDetail, Participant, TripEmail, EditSession, Change) {

            //---------------------------------

            var trip = undefined;
            var tripeditable = false;
			var allowNewTrips = false;

            var editSession = undefined;

            var lastResponseMessage = undefined;

            //---------------------------------

            function getTripGroups() {

				allowNewTrips = membersService.getMembers().some(function (member) {
					return member.id == currentUserService.getUserId() && member.role != null;
				});

                return $http.get(site.restUrl('trips', 'get'))
                    .then(function (response) {

						if (ValidateResponse(response)) {
                            var data = response.data;

                            // resolve on this value
                            return data.groups.map(function (groupData) {
                                return new Group(groupData, metadataService.getTripsMetadata());
                            });
                        }
                    });
            }

            function getTrip(tripId, editId) {
                var queryString = "?tripid=" + tripId + (editId != undefined ? ("&editid=" + editId) : "");

                return $q.all([
                    $http.get(site.restUrl('trip', 'get') + queryString),

                    $http.get(site.restUrl('tripchanges', 'get') + queryString),

                    $http.get(site.restUrl('nonmembers', 'get')) // always re-get nonmembers for every trip
                ])
                    .then(function (responses) {
                        var tripResponse = responses[0];
                        var tripChangesResponse = responses[1];
                        var nonmembersResponse = responses[2];
                        if (ValidateResponse(tripResponse) &&
                            ValidateResponse(tripChangesResponse) && 
                            ValidateResponse(nonmembersResponse)) {

                            var data = tripResponse.data;

                            //------------------
                            // Trip
                            var tripDetail = new TripDetail(data.trip, metadataService.getTripsMetadata());

                            var tripEmail = new TripEmail();
                            tripEmail.setSubject("RE: " + tripDetail.title + " trip on " + tripDetail.FullDate());

                            var participants = data.participants ? data.participants.map(function (participant) {
                                return new Participant(participant, metadataService.getParticipantsMetadata());
                            }) : [];
                            // add additional particpant lines; also preserve participants in their original line position
                            var maxLine = participants
                                .map(function (participant) { return participant.line; })
                                .reduce(function (previous, current) { return Math.max(previous, current); }, 0);
                            var maxLength = Math.max(maxLine + 1, participants.length) + (configService.additionalLines() ? configService.additionalLines() : 0);
                            var tempParticipants = participants.slice(); //shallow copy
                            for (var i = 0; i < maxLength ; i++) {
                                participants[i] = new Participant({ isNew: true, line: i });
                            }
                            tempParticipants.forEach(function (participant) {
                                participants[participant.line] = participant;
                            })


                            tripeditable = false;
                            membersService.getMembers().some(function (member) {
                                if (member.id == currentUserService.getUserId()) {
                                    tripeditable = member.role != null;
                                    return true;
                                }
                                return false;
                            });
                            tripeditable = tripeditable || (participants && participants.some(function (participant) {
                                return participant.memberid == currentUserService.getUserId() && participant.isLeader;
                            }));
                            participants.forEach(function (participant, i) {
                                participant.nameui = (tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
                            })

                            var nonmembers = [];
                            if (nonmembersResponse.data.nonmembers) {
                                for (var i in nonmembersResponse.data.nonmembers) {
                                    nonmembers.push(nonmembersResponse.data.nonmembers[i]);
                                }
                            }

                            trip = new Trip(tripDetail, tripEmail, participants, nonmembers);
                            
                            //------------------
                            // EditSession
                            var editId = data.editid;

                            var changes = !tripChangesResponse.data.changes ? [] :
                                tripChangesResponse.data.changes.map(function (group) {
                                    return group.map(function (change) {
                                        return new Change(change);
                                    })
                                });

                            editSession = new EditSession(editId, changes, [], []);

                            //------------------

                            editSession.changes.forEach(function (group) {
                                return group.forEach(function (change) {
                                    if (change.line != null && participants[change.line]) {
                                        trip.participants[change.line].iseditable = change.memberid == currentUserService.getUserId();
                                    }
                                })
                            });

                            //------------------

                            // resolve on this value
                            return trip;
                        }
                    });
            }

            function getTripEdits(tripId, editId, isDirty) {
                var queryString = "?tripid=" + tripId + "&editid=" + editId + "&isdirty=" + isDirty;

                return $http.get(site.restUrl('editrefresh', 'get') + queryString)
                    .then(function (response) {

                        if (ValidateResponse(response)) {
                            var data = response.data;
                            editSession.edits = data.edits ? data.edits : [];
                            editSession.modifications = data.modifications ? data.modifications : [];
                        }
                    });

            }

            function getEditSession() {
                return $q.when(editSession);
            }

            //---------------------------------

            function putTrip(tripId, editId, diffs) {

				var editinfo = "Edited by " + currentUserService.getUser().name + " at " +
								(new Date().toISOString().replace(/(T|\.\d+Z)/g, ' '));

                return $http.post(site.restUrl('trip', 'post'), { tripid: tripId, diffs: diffs, editinfo: editinfo })
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            lastResponseMessage = response.data.result ? response.data.result : undefined;
                        } else {
                            console.log(response.data);
                        }
                    });
            }

            //---------------------------------

            function putEmail(tripId, subject, body) {
                return $http.post(site.restUrl('email', 'post'), { tripid: tripId, subject: subject, body: body })
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            lastResponseMessage = response.data.result ? response.data.result : undefined;
                        } else {
                            console.log(response.data);
                        }
                    });
            };

			function newTrip() {
				return $http.post(site.restUrl('newtrip', 'post'));
			};

			function newTrips() {
				return $http.post(site.restUrl('newtrips', 'post'))
                    .then(function (response) {
                        return response.data;
                    });			
            };

            //---------------------------------

            function closeEditSession(editId) {
                return $http.get(site.restUrl('editend', 'get') + "?editid=" + editSession.editId);
            };
			
            //---------------------------------

            return {
                getTripGroups: getTripGroups,

                getTrip: getTrip,
                tripeditable: function () { return tripeditable; },
                allowNewTrips: function () { return allowNewTrips; },

                getEditSession: getEditSession,
                getTripEdits: getTripEdits,

                putTrip: putTrip,
				newTrip: newTrip,
				newTrips: newTrips,
				putEmail: putEmail,

                closeEditSession: closeEditSession,

                lastResponseMessage: function () { return lastResponseMessage; }
            }
        }]
    );

}());
