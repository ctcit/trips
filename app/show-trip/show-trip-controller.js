// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripSignupApp').controller("showTripController",
        ['$scope', '$window', '$q', '$timeout', '$stateParams', 'site', 'configService', 'membersService', 'metadataService', 
		 'currentUserService', 'tripsService', 'changeService', 'State', 'TripDetail', 'TripEmail', 'Participant', 'Change',
        function ($scope, $window, $q, $timeout, $stateParams, site, configService, membersService, metadataService, 
				  currentUserService, tripsService, changeService, State, TripDetail, TripEmail, Participant, Change) {

            var controller = this;

            controller.tripId = $stateParams.tripId;

            controller.tripeditable = false;
            controller.trip = null;
            controller.editSession = null;

            controller.loading = true;
            controller.savestate = "Loading...";
            controller.originalState = null;

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
                                return currentUserService.initCurrentUser();
                            }),

    	                tripsService.getEditSession()
                            .then(function (editSession) {
                                controller.editSession = editSession;
                            })
                    ])
                        .then(function () {

                            controller.tripeditable = controller.tripeditable || tripsService.tripeditable();
                            controller.originalState = angular.copy(new State(controller.trip));
                            controller.loading = false;
                            controller.savestate = "";
                            globalShowTripController = controller;

                            $timeout(function () { controller.editRefresh(); }, 0);
                        })
                    
    	        });



            //-----------------------------------
            // Edit status

            controller.showdetail = this.showparticipants = true;
            controller.warnings = [];

            controller.editRefresh = function () {

                tripsService.getTripEdits(controller.tripId, controller.editSession.editId)
                    .then(function () {
                        generateWarnings(controller.trip, controller.editSession);

                        $timeout(); // force a digest cycle
                        $timeout(function () { controller.editRefresh(); }, configService.editRefreshInSec() * 1000); // schedule next refresh
                    });
            };

            function generateWarnings(trip, editSession) {
                var i;
                controller.warnings.length = 0;

                if (trip.tripDetail.isRemoved) {
                    controller.warnings.push('This trip is DELETED. Contact the leader for more information.');
                } else if (!trip.tripDetail.isOpen) {
                    controller.warnings.push('This trip is CLOSED. Contact the leader for more information.');
                }

                editSession.edits.forEach(function (edit) {
					if (edit.id != editSession.editId) {
						controller.warnings.push('This is also being edited by ' + membersService.getMember(edit.memberid).name);
					}
                });

                editSession.modifications.forEach(function (modification, i) {
                    controller.warnings.push('This has just been saved by ' + membersService.getMember(modification.memberid).name +
                                ' - this may be now out-of-date.');
                });
            }

            controller.update = function () {
                controller.savestate = "";
            };
  
            //-----------------------------------
            // Save trip

            controller.diffString = function () {
                return configService.showDebugUpdate() && controller.trip.tripDetail ? JSON.stringify(controller.trip.tripDetail.Diffs(controller.originalState)) : '';
            };

            controller.isDirty = function isDirty() {
                return controller.trip && calculateDiffs(new State(controller.trip), controller.originalState).length > 0;
            };
            
            controller.isDirtyMessage = function () {
                var state = new State(controller.trip);
                var changes = calculateDiffs(state, controller.originalState).length;
                return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
            }            

            controller.isDirtyReset = function () {
                controller.trip = null;
            };
            
            $window.onbeforeunload = function () {
                if (controller.isDirty()) {
            		return controller.isDirtyMessage();
            	}
            }

            $window.onunload = function () {
                tripsService.closeEditSession(controller.editId);
            };

			$scope.$on("$destroy", function(){
				tripsService.closeEditSession(controller.editId);
			});
            
            controller.save = function save(includeEmail, remove) {
			
				if (remove === true || remove === false)
				{
					controller.trip.tripDetail.isRemoved = remove;
                }
				
                var state = new State(controller.trip);
                var diffs = calculateDiffs(state, controller.originalState);

                if (includeEmail) {
                    diffs.splice(0, 0, controller.email);
                }

                // Weed out superfluous diffs, where the participant data is the same as the member data 
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
                tripsService.putTrip(controller.tripId, controller.editSession.editId, diffs)
                    .then(function (trip) {
                        return tripsService.getEditSession()
                                .then(function (editSession) {
                                    controller.savestate = "Saved " + (tripsService.lastResponseMessage() ? tripsService.lastResponseMessage() : "");
                                    controller.trip = trip;
                                    controller.editSession = editSession;
                                    controller.originalState = angular.copy(new State(controller.trip));

                                    $timeout();
                                })
                    }, function (data, status) {
                        controller.savestate = "FAILED " + data + " " + status;
                        $timeout();
                });
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
