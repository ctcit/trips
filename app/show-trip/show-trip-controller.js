// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripApp').controller("showTripController",
        ['$window', '$q', '$timeout', '$stateParams', 'site', 'tripsService', 'State', 'Trip', 'TripEmail', 'Participant', 'Change',
        function ($window, $q, $timeout, $stateParams, site, tripsService, State, Trip, TripEmail, Participant, Change) {

            var controller = this;

            controller.tripId = $stateParams.tripId;
            controller.trip = null;
            controller.config = null;
            controller.metadata = null;
            controller.userId = 0;
            controller.editId = 0;

            controller.changes = [];

            controller.participants = [];
            controller.maxParticipants = [];

            controller.membersById = {};
            controller.membersByName = {};
            controller.members = [];

            controller.nonmembers = [];
            controller.nonmembersByName = {};

            controller.email = new TripEmail();

            controller.tripeditable = false;
            controller.savestate = "Loading...";
            controller.originalState = null;
            controller.lastState = null;

            var highlights = {};


            //-----------------------------------

            tripsService.getTrip(controller.tripId)
    	        .then(function(trip) {

    	            controller.trip = trip;

    	            $q.all([
    	                tripsService.getConfig()
                            .then(function (config) {
                                controller.config = config;
                            }),
    	                tripsService.getMetadata()
                            .then(function (metadata) {
                                controller.metadata = metadata;
                            }),
    	                tripsService.getUserId()
                            .then(function (userId) {
                                controller.userId = userId;
                            }),
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
    	                tripsService.getMembers()
                            .then(function (members) {
                                controller.setMembers(members);
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

                controller.maxParticipants = participants.length;

                controller.participants = [];
                for (var i = 0; i < controller.maxParticipants + this.config.AdditionalLines; i++) {
                    var participant = this.participants[i] = new Participant(participants[i] || { line: i, isNew: true });

                    if (parseInt(participant.line) > i) {
                        controller.maxParticipants++;
                        controller.participants.splice(i, 0, new Particpant({ line: i, isNew: true }));
                    } else {
                        participant.line = i;
                        controller.tripeditable = controller.tripeditable || (participant.memberid == controller.userId && participant.isLeader);
                    }
                }
            }

            controller.setChanges = function setChanges(changes) {
                controller.changes = changes;
                for (var g in changes) {
                    for (var c in changes[g]) {
                        var change = changes[g][c] = new Change(changes[g][c]);
                        if (change.line && controller.participants[change.line]) {
                            controller.participants[change.line].iseditable = change.memberid == controller.userId;
                        }
                    }
                }
            }

            controller.setMembers = function setMembers(members) {
                controller.members = members;
                controller.membersById = {};
                controller.membersByName = {};

                for (var i in members) {
                    controller.membersById[members[i].id] = members[i];
                    controller.membersByName[members[i].name] = members[i];
                    controller.tripeditable = controller.tripeditable || (members[i].id == controller.userId && members[i].role != null);
                }
            }

            controller.setNonMembers = function setNonMembers(nonmembers) {
                controller.nonmembers = nonmembers;
                controller.nonmembersByName = {};

                for (var i in nonmembers) {
                    controller.nonmembers[nonmembers[i].name] = nonmembers[i];
                }
            }


            //-----------------------------------
            // Trip

            controller.tripClass = function tripClass(prop) {
                var before = ToSql(controller.originalState.trip[prop], controller.metadata.trips[prop]);
                var after = ToSql(controller.trip[prop], controller.metadata.trips[prop]);
                return (before == after ? "" : "updated") + " " + (highlights[prop] || "");
            }


            controller.signMeUp = function signMeUp() {
                for (var i = 0; i < controller.participants.length; i++) {
                    if (controller.participants[i].isNew && (controller.participants[i].name || "") == "") {
                        controller.participants[i].memberid = controller.userId;
                        controller.participants[i].name = controller.membersById[controller.userId].name;
                        controller.participants[i].email = controller.membersById[controller.userId].email;
                        controller.participants[i].phone = controller.membersById[controller.userId].phone;
                        controller.maxParticipants = Math.max(i + 2, controller.maxParticipants);
                        controller.update();
                        break;
                    }
                }
            }

            controller.ImSignedUp = function ImSignedUp() {
                for (var i in controller.participants) {
                    if (controller.participants[i].memberid == controller.userId) {
                        return true;
                    }
                }
                return false;
            }


            //-----------------------------------
            // Participants

            controller.participantEnabled = function participantEnabled(participant) {
                return participant.iseditable || participant.isNew || controller.tripeditable || controller.userId == this.memberid;
            }

            controller.participantCancelSomeoneElse = function participantCancelSomeoneElse(participant) {
                participant.memberid = null;
                participant.nameui = "(Full)";
                participant.name = participant.lastname;
                controller.update();
            }

            controller.participantUpdateName = function participantUpdateName(participant) {
                if (controller.membersByName[participant.name]) {
                    participant.memberid = controller.membersByName[participant.name].id;
                    participant.email = controller.membersByName[participant.name].email;
                    participant.phone = controller.membersByName[participant.name].phone;
                    participant.lastname = participant.name;
                } else if (controller.nonmembers[participant.name]) {
                    participant.memberid = null;
                    participant.email = controller.nonmembers[participant.name].email;
                    participant.phone = controller.nonmembers[participant.name].phone;
                    participant
                } else if (participant.name == "(Someone else)") {
                    participant.memberid = null;
                    participant.nameui = "(Someone else)";
                    participant.name = participant.lastname;
                } else {
                    participant.memberid = null;
                }
                controller.maxParticipants = Math.max(participant.line + 2, controller.maxParticipants);
                controller.update();
            }

            controller.participantClass = function participantClass(participant, prop) {
                var classname = (participant.isRemoved ? "isRemoved" : "") + " " + (highlights[prop + participant.line] || highlights[participant.line] || "");
                if (participant.isNew) {
                    for (var p in controller.metadata.participants) {
                        if (controller.originalState.participants[participant.line][p] != participant[p]) {
                            return classname + " inserted";
                        }
                    }
                }
                return classname + (controller.originalState.participants[participant.line][prop] == participant[prop] ? "" : " updated");
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

                for (var prop in controller.metadata.trips) {
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
            // Changes

            controller.changeTimestamp = function changeTimestamp(change) {
                var date = new Date(change.timestamp + " UTC");
                return dow[date.getDay()] + " " + date.getDate() + " " + moy[date.getMonth()] + " " + date.toISOString().substr(11, 5);
            };

            controller.changeName = function changeName(memberid) {
                return controller.membersById[memberid] ? controller.membersById[memberid].name : "blank";
            };

            controller.changeTable = function changeTable(change) {
                return change.table || (change.line == null ? "trips" : "participants");
            };

            controller.changeColName = function changeColName(change) {
                return metadata[controller.changeTable(change)][change.column].Display;
            };

            controller.changeDescription = function changeDescription(change) {
                return change.action == "email"
                        ? "Sent email Subject: " + change.subject :
                    change.line == null
                        ? change.verb + " " + controller.changeColName(change) + " from '" + change.before + "' to '" + change.after + "'" :
                    change.column == "memberid"
                        ? change.verb + " line " + (parseInt(change.line) + 1) + " Member from '" +
                                    controller.changeName(change.before || -1) + "' to '" + controller.changeName(change.after) + "'" :
                    metadata[controller.changeTable(change)][change.column].Type == "tinyint(1)"
                        ? change.verb + " line " + (parseInt(change.line) + 1) + " " + controller.changeColName(change) + " from " +
                                    (change.before == true ? "yes" : "no") + " to " + (change.after == true ? "yes" : "no")
                        : change.verb + " line " + (parseInt(change.line) + 1) + " " + controller.ColName(change) + " from '" +
                                    change.before + "' to '" + change.after + "'";
            };

            controller.changeDetailToggle = function changeDetailToggle(change) {
                var g, c;
                var classnames = { highlight5: 1, highlight4: 1, highlight3: 1, highlight2: 1, highlight1: 1 };

                change.classname = "";
                change.showdetail = !change.showdetail;

                if (change.showdetail) {

                    for (g in controller.changes) {
                        delete classnames[controller.changes[g][0].classname];
                    }

                    for (change.classname in classnames) {
                    }
                }

                highlights = {};
                for (g in controller.changes) {
                    var group = controller.changes[g][0];
                    if (group.classname != "") {
                        for (c in controller.changes[g]) {
                            var change = controller.changes[g][c];
                            highlights[(change.action == "insert" ? "" : change.column) +
                                     (change.line == null ? "" : change.line)] = group.classname;
                        }
                    }
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
                                    controller.warnings.push('This is also being edited by ' + controller.membersById[edits[i].memberid].name + (i == 0 ? "" : " (" + (i + 1) + ")"));
                                }

                                for (i = 0; i < modifications.length && i < 1; i++) {
                                    controller.warnings.push('This has just been saved by ' + controller.membersById[modifications[i].memberid].name +
                                                ' - this may be now out-of-date.');
                                }

                                $timeout(); // force a digest cycle
                                $timeout(function () { controller.editRefresh(); }, controller.config.EditRefreshInSec * 1000); // schedule next refresh
                            })

                    });

            };


            //-----------------------------------
            // Save trip

            controller.diffString = function () {
                return controller.config && controller.config.ShowDebugUpdate && controller.trip ? JSON.stringify(controller.trip.Diffs(controller.originalState)) : '';
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

                    if (diff.line != null && participants[diff.line].isNew &&
                        controller.membersById[participants[diff.line].memberid] &&
                        controller.membersById[participants[diff.line].memberid][diff.column] &&
                        controller.membersById[participants[diff.line].memberid][diff.column] == diff.after) {
                        diffs.splice(i--, 1);
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

                for (diff.column in controller.metadata.trips) {
                    diff.before = ToSql(refState.trip[diff.column], controller.metadata.trips[diff.column]);
                    diff.after = ToSql(currentState.trip[diff.column], controller.metadata.trips[diff.column]);
                    if (diff.before != diff.after) {
                        diff.action = "updatetrip";
                        diffs.push(angular.copy(diff));
                    }
                }

                for (diff.line in controller.participants) {
                    for (diff.column in controller.metadata.participants) {
                        diff.before = ToSql(refState.participants[diff.line][diff.column], controller.metadata.participants[diff.column]);
                        diff.after = ToSql(currentState.participants[diff.line][diff.column], controller.metadata.participants[diff.column]);
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