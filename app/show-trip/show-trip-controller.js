// The controller for the current selected trip
(function () {
    "use strict";

	// inject this into the top level html so that the styles in trips.css 
	// can ensure that unwanted elements don't display when printing
	var csspath = window.location.href.split('#')[0].replace("index.html","app/styles/print.css");
	if ($('head',window.parent.document).find("link[href='"+csspath+"']").length == 0){
		$('head',window.parent.document).append("<link href='"+csspath +"' rel='stylesheet' type='text/css'>");
	}

    angular.module('tripSignupApp').controller("showTripController",
        ['$scope', '$window', '$q', '$timeout', '$stateParams', '$http', 'site',
                 'configService', 'membersService', 'metadataService',
				 'changeService', 'currentUserService', 'tripsService',
                 'sessionStateService', 'State', 'TripDetail', 'TripEmail',
                 'Participant', 'Change',
        function ($scope, $window, $q, $timeout, $stateParams, $http, site,
                    configService, membersService, metadataService,
                    changeService, currentUserService, tripsService,
                    sessionStateService, State, TripDetail, TripEmail,
                    Participant, Change) {

            var controller = this;

            console.log("sp" + $stateParams.tripId)
            controller.tripId = $stateParams.tripId;

            controller.tripeditable = false;
            controller.trip = null;
            controller.editSession = null;

            controller.loading = true;
            controller.saveState = "Loading...";
            sessionStateService.setTrip(null);

            changeService.highlights = {};

            //-----------------------------------

            $q.all([
                configService.load(),
                metadataService.load(),
                membersService.load()
                    .then(function() {
                        return currentUserService.load();
                    })
            ])
            .then(function() {
                console.log("a" + controller.tripId)
                tripsService.getTrip(controller.tripId)
                    .then(function(trip) {

                        controller.trip = trip;

                        return tripsService.getEditSession()
                            .then(function (editSession) {
                                controller.editSession = editSession;
                            })
                            .then(function () {

                                controller.tripeditable = controller.tripeditable || tripsService.tripeditable();
                                sessionStateService.setTrip(controller.trip);
                                controller.loading = false;
                                controller.update();

                                $timeout(function () { controller.editRefresh(); }, 0);
                            })
                    });
                });


            //-----------------------------------
            // Edit status

            controller.showdetail = this.showparticipants = true;
            controller.warnings = [];

            controller.editRefresh = function () {

                if (controller.editSession && controller.editSession.editId) {
                    tripsService.getTripEdits(controller.tripId, controller.editSession.editId, controller.isDirty() ? 1 : 0)
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
						controller.warnings.push('This is also being ' +
							(parseInt(edit.isdirty) ? 'edited' : 'looked at') +
							' by ' + membersService.getMember(edit.memberid).name);
					}
                });

                editSession.modifications.forEach(function (modification, i) {
                    controller.warnings.push('This has just been saved by ' + membersService.getMember(modification.memberid).name +
                                ' - this may be now out-of-date.');
                });
            }

            controller.update = function () {
                controller.saveState = "";

				var statusCount = 0, regoCount = 0, leaderCount = 0, printable = 0;

				for (var i = 0; i < controller.trip.participants.length; i++) {
					var participant = controller.trip.participants[i];
					participant.isPrintable = (participant.name || '') != '' && !participant.isRemoved;
					participant.isPrintableLeader = participant.isPrintable && participant.isLeader;
					participant.isPrintableStatus = participant.isPrintable && (participant.status || '') != '';
					participant.isPrintableRego = participant.isPrintable && (participant.vehicleRego || '') != '';

					printable += participant.isPrintable ? 1 : 0;
					statusCount += participant.isPrintableStatus ? 1 : 0;
					regoCount += participant.isPrintableRego ? 1 : 0;
					leaderCount += participant.isPrintableLeader ? 1 : 0;
				}

				var blankcount = configService.printLines() - Math.max(1,Math.max(statusCount,regoCount)) - Math.max(1,leaderCount) - printable;

				controller.printable = printable;
				controller.printableblanklines = [];
				for (var i = 0; i < blankcount; i++){
					controller.printableblanklines.push({});
				}

            };

            //-----------------------------------
            // Trip changes

            controller.originalTrip = function () {
                return sessionStateService.originalTrip();
            };

            controller.originalState = function () {
                return sessionStateService.originalState();
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

            controller.save = function save(remove) {

				if (remove === true || remove === false)
				{
					controller.trip.tripDetail.isRemoved = remove;
				}

				var diffs = sessionStateService.diffs();

				controller.saveState = "Saving";
                tripsService.putTrip(controller.tripId, controller.editSession.editId, diffs)
                     .then(function (response) {
						 if (ValidateResponse(response)) {
							 controller.tripId = response.data.tripid || controller.tripId;
							 return tripsService.getTrip(controller.tripId, controller.editSession.editId)
								 .then(function(trip) {
									 return tripsService.getEditSession()
											 .then(function (editSession) {
												 controller.saveState = "Saved " + (tripsService.lastResponseMessage() ? tripsService.lastResponseMessage() : "");
												 trip.tripEmail = controller.trip.tripEmail; // don't lose email details
												 controller.trip = trip;
												 controller.editSession = editSession;
												 sessionStateService.setTrip(controller.trip);
												 controller.update();
												 $timeout();
											 })
								 });
						  } else {
							controller.saveState = "FAILED " + ((response ? response.data : null) || "");
						  }
                     }, function (data, status) {
                        controller.saveState = "FAILED " + data + " " + status;
                        $timeout();
                });
            };

            controller.emailSend = function emailSend() {
				controller.emailState = "Emailing";
                tripsService.putEmail(controller.tripId, controller.trip.tripEmail.subject, controller.trip.tripEmail.body)
                    .then(function () {
                        controller.emailState = "Sent email";
                        $timeout();
                    }, function (data, status) {
                        controller.emailState = "FAILED " + data + " " + status;
                        $timeout();
                });
			};
			
            //-----------------------------------
            // Print trip
            controller.print = function print() {
                window.print();
            };

            //-----------------------------------

        }]).animation('.slide', AnimationSlide);

}());
