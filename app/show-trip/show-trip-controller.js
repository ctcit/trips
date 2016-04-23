// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripApp').controller("showTripController",
        ['$q', '$timeout', '$stateParams', 'site', 'tripsService', 'State', 'Trip', 'TripEmail', 'Participant',
        function ($q, $timeout, $stateParams, site, tripsService, State, Trip, TripEmail, Participant) {

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
            // Participant related

            // BSJ -todo
            //this.Toggle = State.prototype.Toggle, // ????????????? todo

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
                if (state.membersByName[participant.name]) {
                    participant.memberid = controller.membersByName[participant.name].id;
                    participant.email = controller.membersByName[participant.name].email;
                    participant.phone = controller.membersByName[participant.name].phone;
                    participant.lastname = participant.name;
                } else if (state.nonmembers[participant.name]) {
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
                var classname = (participant.isRemoved ? "isRemoved" : "") + " " + (controller.highlights[prop + participant.line] || controller.highlights[participant.line] || "");
                if (participant.isNew) {userId
                    for (var p in controller.metadata.participants) {
                        if (controller.originalState.participants[participant.line][p] != participant[p]) {
                            return classname + " inserted";
                        }
                    }
                }
                return classname + (controller.originalState.participants[participant.line][prop] == participant[prop] ? "" : " updated");
            }






            // bsj - todo ?????????????????????
            function tripClass(prop) {
                var before = ToSql(original[prop], controller.metadata.trips[prop]);
                var after = ToSql(this[prop], controller.metadata.trips[prop]);
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
            


            ///////////////////////////////////////////


            controller.diffString = function () {
                return controller.config && controller.config.ShowDebugUpdate && controller.trip ? JSON.stringify(controller.trip.Diffs(controller.originalState)) : '';
            };

            controller.saveEnabled = function () {
                var state = new State(controller.trip, controller.participants);
                return controller.trip && tripsService.calculateDiffs(state, controller.originalState).length > 0;
            };

            controller.save = function (includeEmail) {

                tripsService.putTrip(includeEmail);  // todo 

                //var diffs = this.trip.Diffs(this.originalState);

                //if (includeEmail) {
                //    diffs.splice(0, 0, this.$scope.email);
                //}

                //// Weed out superfluous diffs
                //for (var i = 0; i < diffs.length; i++) {
                //    var diff = diffs[i];
                //    var participants = this.trip.participants;

                //    if (diff.line != null && participants[diff.line].isNew &&
                //        state.membersbyid[participants[diff.line].memberid] &&
                //        state.membersbyid[participants[diff.line].memberid][diff.column] &&
                //        state.membersbyid[participants[diff.line].memberid][diff.column] == diff.after) {
                //        diffs.splice(i--, 1);
                //    }
                //}

                //this.savestate = "Saving";
                //this.$http.post("api.post.php", { tripid: tripid, diffs: diffs }).success(function (result) {
                //    if (ValidateResponse(result)) {
                //        $timeout(function () {
                //            state.$http.get("api.get.php?action=gettrip&editid=" + controller.editId + "&tripid=" + tripid).success(function (response) {
                //                if (ValidateResponse(response)) {
                //                    state.savestate = "Saved " + result.result;
                //                    state.$scope.trip = state.trip = new Trip(response);
                //                    $timeout(function () { state.$scope.$apply(); }, 0);
                //                }
                //            });
                //        }, 1000);
                //    }
                //}).error(function (data, status) {
                //    state.savestate = "FAILED " + data + " " + status;
                //    $timeout(function () { state.$scope.$apply(); }, 0);
                //});
            };

            controller.textAreaFocus = function (id) {
                $('#' + id).keyup(function () {
                    $(this).attr('rows', $(this).val().split('\n').length);
                });
            };



            //---------------------------------------
            // state management

            controller.Undo = [];
            controller.Redo = [];

            controller.undoTitle = function undoTitle(undo) {
                var state = new State(controller.trip, controller.participants);
                return controller[undo].length == 0 ? "" : new Change(tripsService.calculateDiffs(state, this[undo][this[undo].length - 1])[0], undo).Description();
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
                if (controller.trip && tripsService.calculateDiffs(state, this.lastState).length > 0) {
                    controller.Undo.push(controller.lastState);
                    controller.lastState = angular.copy(state);
                    controller.Redo.length = 0;
                }
            };


            //---------------------------------------




            //????????????????? todo

            controller.showdetail = this.showparticipants = true;
            controller.warnings = [];



            controller.editRefresh = function () {

                // ???? todo
                tripsService.getTrip(controller.tripId)
                    .then(function(trip) {

                        var i;
                        controller.warnings.length = 0;

                        if (!trip.isOpen) {
                            controller.warnings.push('This trip is CLOSED. Contact the leader for more information.');
                        }

// bsj - todo
                        //for (i = 0; i < response.edits.length; i++) {
                        //    controller.warnings.push('This is also being edited by ' + controller.membersById[response.edits[i].memberid].name + (i == 0 ? "" : " (" + (i + 1) + ")"));
                        //}

                        //for (i = 0; i < response.modifications.length && i < 1; i++) {
                        //    controller.warnings.push('This has just been saved by ' + controller.membersById[response.modifications[i].memberid].name +
                        //                ' - this may be now out-of-date.');
                        //}

                        $timeout(); // force a digest cycle
                        $timeout(function () { controller.editRefresh(); }, controller.config.EditRefreshInSec * 1000); // schedule next refresh
                    });
            };



        }]).animation('.slide', AnimationSlide);
	
}());


// bsj - todo 

//window.onbeforeunload = function () {
//	if (state.saveEnabled()) {
//		var changes = state.trip.Diffs(state.originalState).length;
//		return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
//	}
//}

//window.onunload = function() {
//	$.ajax({type: "GET", url: "api.get.php?action=editend&editid="+ controller.editId, async: false});
//};

