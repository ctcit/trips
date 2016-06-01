// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripApp').controller("showTripController",
        ['$window', '$q', '$timeout', '$stateParams', 'site', 'configService', 'membersService', 'metadataService', 'currentUserService', 'tripsService', 'changeService', 'State', 'TripDetail', 'TripEmail', 'Participant', 'Change',
        function ($window, $q, $timeout, $stateParams, site, configService, membersService, metadataService, currentUserService, tripsService, changeService, State, TripDetail, TripEmail, Participant, Change) {

            var controller = this;

            controller.tripId = $stateParams.tripId;

            controller.trip = null;
            controller.editSession = null;
            controller.tripeditable = false;

            controller.savestate = "Loading...";
            controller.originalState = null;
            controller.lastState = null;

            changeService.highlights = {};


            //-----------------------------------

            tripsService.getTrip(controller.tripId)
    	        .then(function(trip) {

    	            controller.trip = trip;

    	            $q.all([
    	                configService.initConfig(),

    	                metadataService.initMetadata(),

    	                membersService.initMembers()
                            .then(function() {
                                return currentUserService.initCurrentUser()
                                    .then(function (currentUser) {
                                        controller.tripeditable = currentUser && currentUser.role != null;
                                    })
                            }),

    	                tripsService.getEditSession()
                            .then(function (editSession) {
                                controller.editSession = editSession;
                            })
                    ])
                        .then(function () {

                            var currentUserId = currentUserService.userId();

                            controller.tripeditable = controller.tripeditable || controller.trip.participants.some(function (participant) {
                                return participant.memberid == currentUserId && participant.isLeader;
                            })

                            // add additional particpant lines before saving original state
                            var maxLength = controller.trip.participants.length + configService.additionalLines();
                            for (var i = 0; i < maxLength ; i++) {
                                var participant = controller.trip.participants[i] || new Participant({ isNew: true });
                                if (!participant.line || parseInt(participant.line) > i) {
                                    controller.trip.participants.splice(i, 0, participant);
                                }
                                participant.line = i;
                            }
                            // add derived properties before saving original state
                            controller.trip.participants.forEach(function (participant, i) {
                                participant.nameui = (controller.tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
                            })


                            controller.editSession.changes.forEach(function (group) {
                                return group.forEach(function (change) {
                                    if (change.line && controller.trip.participants[change.line]) {
                                        controller.trip.participants[change.line].iseditable = change.memberid == currentUserId;
                                    }
                                })
                            });

                            var state = new State(controller.trip);
                            controller.originalState = angular.copy(state);
                            controller.lastState = angular.copy(state);
                            controller.reset();

                            generateWarnings(controller.trip, controller.editSession);
                            $timeout(); // force a digest cycle
                            $timeout(function () { controller.editRefresh(); }, configService.editRefreshInSec() * 1000); // schedule next refresh

                            controller.savestate = "";
                        })
                    
    	        });



            //-----------------------------------
            // Edit status

            controller.showdetail = this.showparticipants = true;
            controller.warnings = [];

            controller.editRefresh = function () {

                tripsService.getTrip(controller.tripId)
                    .then(function (trip) {

                        tripsService.getEditSession()
                            .then(function (editSession) {
                                generateWarnings(trip, editSession);

                                $timeout(); // force a digest cycle
                                $timeout(function () { controller.editRefresh(); }, configService.editRefreshInSec() * 1000); // schedule next refresh
                            })
                    });

            };


            function generateWarnings(trip, editSession) {
                var i;
                controller.warnings.length = 0;

                if (!trip.tripDetail.isOpen) {
                    controller.warnings.push('This trip is CLOSED. Contact the leader for more information.');
                }

                editSession.edits.forEach(function (edit, i) {
                    controller.warnings.push('This is also being edited by ' + membersService.getMember(edit.memberid).name + (i == 0 ? "" : " (" + (i + 1) + ")"));
                });

                editSession.modifications.forEach(function (modification, i) {
                    controller.warnings.push('This has just been saved by ' + membersService.getMember(modification.memberid).name +
                                ' - this may be now out-of-date.');
                });
            }

            //---------------------------------------
            // State management

            controller.Undo = [];
            controller.Redo = [];

            controller.undoTitle = function undoTitle(undo) {
                return !controller.trip || controller[undo].length == 0 ? "" : changeService.changeDescription(new Change(calculateDiffs(new State(controller.trip), this[undo][this[undo].length - 1])[0], undo));
            }

            controller.undoAction = function undoAction(undo, redo) {
                var poppedState = controller[undo].pop();
                controller[redo].push(angular.copy(new State(controller.trip)));

                for (var prop in metadataService.getTripsMetadata()) {
                    controller.trip.tripDetail[prop] = poppedState.tripDetail[prop];
                }
                controller.trip.participants = angular.copy(poppedState.participants);
            }

            controller.reset = function reset() {
                controller.Undo = [];
                controller.Redo = [];
            }

            controller.update = function () {
                var state = new State(controller.trip);
                if (controller.trip.tripDetail && calculateDiffs(state, controller.lastState).length > 0) {
                    controller.Undo.push(controller.lastState);
                    controller.lastState = angular.copy(state);
                    controller.Redo.length = 0;
                }
            };


            //-----------------------------------
            // Save trip

            controller.diffString = function () {
                return configService.showDebugUpdate() && controller.trip.tripDetail ? JSON.stringify(controller.trip.tripDetail.Diffs(controller.originalState)) : '';
            };

            controller.saveEnabled = function () {
                return controller.trip && calculateDiffs(new State(controller.trip), controller.originalState).length > 0;
            };

            controller.save = function (includeEmail) {
                var state = new State(controller.trip);
                var diffs = calculateDiffs(state, controller.originalState);

                if (includeEmail) {
                    diffs.splice(0, 0, controller.email);
                }

                // Weed out superfluous diffs
                for (var i = 0; i < diffs.length; i++) {
                    var diff = diffs[i];
                    var participants = controller.trip.participants;

                    if (diff.line != null && participants[diff.line].isNew) {
                        var member = membersService.getMember(participants[diff.line].memberid);
                        if (member && member[diff.column] && member[diff.column] == diff.after) {
                            diffs.splice(i--, 1);
                        }
                    }
                }

                controller.savestate = "Saving";
                tripsService.putTrip(controller.tripId, diffs)
                    .then(function (trip) {
                        controller.savestate = "Saved " + result.result;
                        controller.trip = trip;
                        $timeout();
                    }, function (data, status) {
                        controller.savestate = "FAILED " + data + " " + status;
                        $timeout();
                });
            };

            //-----------------------------------

            $window.onbeforeunload = function () {
                if (controller.saveEnabled()) {
                    var state = new State(controller.trip);
                    var changes = calculateDiffs(state, controller.originalState).length;
            		return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
            	}
            }

            $window.onunload = function () {
                tripsService.closeEditSession(controller.editId);
            };

            //-----------------------------------

            function calculateDiffs(currentState, refState) {
                var diffs = [];

                if (currentState && refState) {
                    var diff = {};

                    var tripsMetadata = metadataService.getTripsMetadata();
                    for (diff.column in tripsMetadata) {
                        diff.before = ToSql(refState.tripDetail[diff.column], tripsMetadata[diff.column]);
                        diff.after = ToSql(currentState.tripDetail[diff.column], tripsMetadata[diff.column]);
                        if (diff.before != diff.after) {
                            diff.action = "updatetrip";
                            diffs.push(angular.copy(diff));
                        }
                    }

                    var participantsMetadata = metadataService.getParticipantsMetadata();
                    for (diff.line in currentState.participants) {
                        for (diff.column in participantsMetadata) {
                            diff.before = refState.participants[diff.line] ? ToSql(refState.participants[diff.line][diff.column], participantsMetadata[diff.column]) : null;
                            diff.after = ToSql(currentState.participants[diff.line][diff.column], participantsMetadata[diff.column]);
                            if (diff.before != diff.after) {
                                diff.action = currentState.participants[diff.line].isNew ? "insertparticipant" : "updateparticipant";
                                diffs.push(angular.copy(diff));
                            }
                        }
                    }
                }

                return diffs;
            }

            //-----------------------------------

        }]).animation('.slide', AnimationSlide);
	
}());
