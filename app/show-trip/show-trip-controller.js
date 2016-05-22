// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripApp').controller("showTripController",
        ['$window', '$q', '$timeout', '$stateParams', 'site', 'configService', 'membersService', 'metadataService', 'currentUserService', 'tripsService', 'State', 'Trip', 'TripEmail', 'Participant', 'Change',
        function ($window, $q, $timeout, $stateParams, site, configService, membersService, metadataService, currentUserService, tripsService, State, Trip, TripEmail, Participant, Change) {

            var controller = this;

            controller.editId = 0;

            controller.tripId = $stateParams.tripId;
            controller.trip = null;

            controller.participants = [];
            controller.maxParticipants = [];

            controller.nonmembers = [];
            controller.nonmembersByName = {};

            controller.email = new TripEmail();

            controller.changes = [];

            controller.tripeditable = false;
            controller.savestate = "Loading...";
            controller.originalState = null;
            controller.lastState = null;

            controller.highlights = {};


            //-----------------------------------

            tripsService.getTrip(controller.tripId)
    	        .then(function(trip) {

    	            controller.trip = trip;

    	            $q.all([
    	                configService.initConfig(),

    	                metadataService.initMetadata(),

    	                membersService.initMembers()
            	            .then(function (members) {
            	                var currentUser = currentUserService.user();
            	                controller.tripeditable = currentUser && currentUser.role != null;
            	            }),

    	                currentUserService.initCurrentUser(),

    	                tripsService.getEditId()
                            .then(function (editId) {
                                controller.editId = editId;
                            }),
    	                tripsService.getParticipants()
                            .then(function (participants) {
                                controller.setParticipants(participants);
                            }),
    	                tripsService.getChanges()
                            .then(function (changes) {
                                controller.setChanges(changes);
                            }),
    	                tripsService.getNonmembers()
                            .then(function (nonmembers) {
                                controller.setNonMembers(nonmembers);
                            })
                    ])
                        .then(function () {
                            for (var line in controller.participants) {
                                var participant = controller.participants[line];
                                participant.nameui = (controller.tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
                            }

                            controller.savestate = "";
                            controller.editRefresh();

                            controller.tripeditable = false;
                            controller.email.setSubject("RE: " + trip.title + " trip on " +
                                            dow[trip.date.getDay()] + " " + trip.date.getDate() + " " + moy[trip.date.getMonth()] + " " + trip.date.getFullYear());

                            var state = new State(controller.trip, controller.participants);
                            controller.originalState = angular.copy(state);
                            controller.lastState = angular.copy(state);
                            controller.reset();
                            controller.maxParticipants += trip.isOpen || controller.tripeditable ? 1 : 0;
                        })
                    
    	        });



            controller.setParticipants = function setParticipants(participants) {
                var currentUserId = currentUserService.userId();

                controller.maxParticipants = participants.length;

                controller.participants = [];
                for (var i = 0; i < controller.maxParticipants + configService.additionalLines(); i++) {
                    var participant = this.participants[i] = new Participant(participants[i] || { line: i, isNew: true });

                    if (parseInt(participant.line) > i) {
                        controller.maxParticipants++;
                        controller.participants.splice(i, 0, new Particpant({ line: i, isNew: true }));
                    } else {
                        participant.line = i;
                        controller.tripeditable = controller.tripeditable || (participant.memberid == currentUserId && participant.isLeader);
                    }
                }
            }

            controller.setChanges = function setChanges(changes) {
                var currentUserId = currentUserService.userId();
                controller.changes = changes;
                for (var g in changes) {
                    for (var c in changes[g]) {
                        var change = changes[g][c] = new Change(changes[g][c]);
                        if (change.line && controller.participants[change.line]) {
                            controller.participants[change.line].iseditable = change.memberid == currentUserId;
                        }
                    }
                }
            }

            controller.setNonMembers = function setNonMembers(nonmembers) {
                controller.nonmembers = nonmembers;
                controller.nonmembersByName = {};

                for (var i in nonmembers) {
                    controller.nonmembers[nonmembers[i].name] = nonmembers[i];
                }
            }


            //---------------------------------------
            // State management

            controller.Undo = [];
            controller.Redo = [];

            controller.undoTitle = function undoTitle(undo) {
                var state = new State(controller.trip, controller.participants);
                return controller[undo].length == 0 ? "" : controller.changeDescription(new Change(calculateDiffs(state, this[undo][this[undo].length - 1])[0], undo));
            }

            controller.undoAction = function undoAction(undo, redo) {
                var popped = state[undo].pop();

                controller[redo].push(angular.copy(controller.trip));

                for (var prop in metadataService.getTripsMetadata()) {
                    controller.trip[prop] = popped[prop];
                }
                controller.participants = angular.copy(popped.participants);
            }

            controller.reset = function reset() {
                controller.Undo = [];
                controller.Redo = [];
            }

            controller.update = function () {
                var state = new State(controller.trip, controller.participants);
                if (controller.trip && calculateDiffs(state, this.lastState).length > 0) {
                    controller.Undo.push(controller.lastState);
                    controller.lastState = angular.copy(state);
                    controller.Redo.length = 0;
                }
            };


            //-----------------------------------
            // Edit status

            controller.showdetail = this.showparticipants = true;
            controller.warnings = [];

            controller.editRefresh = function () {

                tripsService.getTrip(controller.tripId)
                    .then(function (trip) {

                        controller.trip = trip;
                        var edits = [];
                        var modifications = [];

                        $q.all([
                            tripsService.getEdits()
                                .then(function (newEdits) {
                                    edits = newEdits;
                                }),
                            tripsService.getModifications()
                                .then(function (newModifications) {
                                    modifications = newModifications;
                                })
                        ])
                            .then(function () {
                                var i;
                                controller.warnings.length = 0;

                                if (!trip.isOpen) {
                                    controller.warnings.push('This trip is CLOSED. Contact the leader for more information.');
                                }

                                for (i = 0; i < edits.length; i++) {
                                    controller.warnings.push('This is also being edited by ' + membersService.getMemberById(edits[i].memberid).name + (i == 0 ? "" : " (" + (i + 1) + ")"));
                                }

                                for (i = 0; i < modifications.length && i < 1; i++) {
                                    controller.warnings.push('This has just been saved by ' + membersService.getMemberById(modifications[i].memberid).name +
                                                ' - this may be now out-of-date.');
                                }

                                $timeout(); // force a digest cycle
                                $timeout(function () { controller.editRefresh(); }, configService.editRefreshInSec() * 1000); // schedule next refresh
                            })

                    });

            };


            //-----------------------------------
            // Save trip

            controller.diffString = function () {
                return configService.showDebugUpdate() && controller.trip ? JSON.stringify(controller.trip.Diffs(controller.originalState)) : '';
            };

            controller.saveEnabled = function () {
                var state = new State(controller.trip, controller.participants);
                return controller.trip && calculateDiffs(state, controller.originalState).length > 0;
            };

            controller.save = function (includeEmail) {
                var state = new State(controller.trip, controller.participants);
                var diffs = calculateDiffs(state, this.originalState);

                if (includeEmail) {
                    diffs.splice(0, 0, controller.email);
                }

                // Weed out superfluous diffs
                for (var i = 0; i < diffs.length; i++) {
                    var diff = diffs[i];
                    var participants = controller.participants;

                    if (diff.line != null && participants[diff.line].isNew) {
                        var member = membersService.getMemberById(participants[diff.line].memberid);
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

            function calculateDiffs(currentState, refState) {

                var diffs = [], diff = {};

                var tripsMetadata = metadataService.getTripsMetadata();
                for (diff.column in tripsMetadata) {
                    diff.before = ToSql(refState.trip[diff.column], tripsMetadata[diff.column]);
                    diff.after = ToSql(currentState.trip[diff.column], tripsMetadata[diff.column]);
                    if (diff.before != diff.after) {
                        diff.action = "updatetrip";
                        diffs.push(angular.copy(diff));
                    }
                }

                var participantsMetadata = metadataService.getParticipantsMetadata();
                for (diff.line in controller.participants) {
                    for (diff.column in participantsMetadata) {
                        diff.before = ToSql(refState.participants[diff.line][diff.column], participantsMetadata[diff.column]);
                        diff.after = ToSql(currentState.participants[diff.line][diff.column], participantsMetadata[diff.column]);
                        if (diff.before != diff.after) {
                            diff.action = currentState.participants[diff.line].isNew ? "insertparticipant" : "updateparticipant";
                            diffs.push(angular.copy(diff));
                        }
                    }
                }

                return diffs;
            }
            

            controller.textAreaFocus = function (id) {
                $('#' + id).keyup(function () {
                    $(this).attr('rows', $(this).val().split('\n').length);
                });
            };


            //-----------------------------------

            $window.onbeforeunload = function () {
                if (controller.saveEnabled()) {
                    var state = new State(controller.trip, controller.participants);
                    var changes = calculateDiffs(state, controller.originalState).length;
            		return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
            	}
            }

            $window.onunload = function () {
                tripsService.closeEditSession(controller.editId);
            };

            //-----------------------------------

        }]).animation('.slide', AnimationSlide);
	
}());
