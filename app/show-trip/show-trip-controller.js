// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripSignupApp').controller("showTripController",
        ['$scope', '$window', '$q', '$timeout', '$stateParams', 'site',
                 'configService', 'membersService', 'metadataService', 
		 'changeService', 'currentUserService', 'tripsService', 
                 'sessionStateService', 'State', 'TripDetail', 'TripEmail',
                 'Participant', 'Change', 'TriplistSheet',
        function ($scope, $window, $q, $timeout, $stateParams, site,
                    configService, membersService, metadataService, 
                    changeService, currentUserService, tripsService,
                    sessionStateService, State, TripDetail, TripEmail,
                    Participant, Change, TriplistSheet) {

            var controller = this;

            controller.tripId = $stateParams.tripId;

            controller.tripeditable = false;
            controller.trip = null;
            controller.editSession = null;

            controller.loading = true;
            controller.savestate = "Loading...";
            sessionStateService.setTrip(null);

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
                            sessionStateService.setTrip(controller.trip);
                            controller.loading = false;
                            controller.savestate = "";

                            $timeout(function () { controller.editRefresh(); }, 0);
                        })
                    
    	        });



            //-----------------------------------
            // Edit status

            controller.showdetail = this.showparticipants = true;
            controller.warnings = [];

            controller.editRefresh = function () {

                if (controller.editSession && controller.editSession.editId) {
                    tripsService.getTripEdits(controller.tripId, controller.editSession.editId)
                        .then(function () {
                            generateWarnings(controller.trip, controller.editSession);

                            $timeout(); // force a digest cycle
                            $timeout(function () { controller.editRefresh(); }, configService.editRefreshInSec() * 1000); // schedule next refresh
                        });
                }
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
                return sessionStateService.diffString();
            };

            controller.isDirty = function isDirty() {
                return sessionStateService.isDirty();
            };
            
            controller.isDirtyMessage = function () {
                return sessionStateService.isDirtyMessage();
            }            

            $window.onbeforeunload = function () {
                if (sessionStateService.isDirty()) {
                    return sessionStateService.isDirtyMessage();
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

				var diffs = sessionStateService.diffs(includeEmail, controller.email);

				controller.savestate = "Saving";
                tripsService.putTrip(controller.tripId, controller.editSession.editId, diffs)
                    .then(function (trip) {
                        return tripsService.getEditSession()
                                .then(function (editSession) {
                                    controller.savestate = "Saved " + (tripsService.lastResponseMessage() ? tripsService.lastResponseMessage() : "");
                                    controller.trip = trip;
                                    controller.editSession = editSession;
                                    sessionStateService.setTrip(controller.trip);
                                    $timeout();
                                })
                    }, function (data, status) {
                        controller.savestate = "FAILED " + data + " " + status;
                        $timeout();
                });
            };
            
            // We "print" by writing the data into a copy of the master
            // trip list spreadsheet on CTC's GoogleDrive, then opening
            // the sheet in a new window.
            controller.print = function print() {
                var spreadsheet = new TriplistSheet(),
                    title = controller.trip.tripDetail.title,
                    d = controller.trip.tripDetail.date,
                    date = d.getDay() + '/' + d.getMonth() + '/' + d.getFullYear(),
                    length = controller.trip.tripDetail.length.split(' ')[0],
                    leader,
                    members = [],
                    notes = [];
                controller.trip.participants.forEach(function (participant) {
                    if (participant.name !== undefined && !participant.isRemoved) {
                        if (participant.status) {
                            notes.push(participant.name + ': ' + participant.status);
                        }
                        if (participant.isLeader) {
                            leader = participant.name;
                        } else {
                            members.push(participant);
                        }
                    };
                });
                spreadsheet.build(title, date, length, leader, members, notes);
            };
            
            //-----------------------------------

        }]).animation('.slide', AnimationSlide);
	
}());
