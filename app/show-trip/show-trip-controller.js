// The controller for the current selected trip
(function () {
    "use strict";

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

            //-----------------------------------
            // Print trip

            // We "print" by sending all the current trip info to an
            // out-of-angular page 'printabletriplist.php', in a new window.
            controller.print = function print() {
                var title = controller.trip.tripDetail.title,
                    d = controller.trip.tripDetail.date,
                    month = d.toLocaleString("en-nz", { month: "long" }),
                    date = d.getDate() + ' ' + month + ' ' + d.getFullYear(),
                    length = controller.trip.tripDetail.length.split(' ')[0],
                    form = document.createElement('form'),
                    participantNum = 0,
                    noteNum = 0,
                    hasCar;

                function addField(field, value, count) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    if (count !== undefined) {
                        input.name = field + '[' + count + ']';
                    } else {
                        input.name = field;
                    }
                    input.value = value;
                    form.appendChild(input);
                }

                form.setAttribute("method", "post");
                form.setAttribute("action", site.printabletriplisturl);
                form.setAttribute("target", "_blank");
                addField('title', title);
                addField('date', date);
                addField('length', length);

                controller.trip.participants.forEach(function (participant) {
                    if (participant.name !== undefined && !participant.isRemoved) {
                        if (participant.status) {
                            addField('note', participant.name + ': ' + participant.status, noteNum);
                            noteNum += 1;
                        }
                        if (participant.isLeader) {
                            addField('leadername', participant.name);
                        }
                        addField('name', participant.name, participantNum);
                        addField('email', participant.email, participantNum);
                        addField('phone', participant.phone, participantNum);
                        hasCar = participant.isVehicleProvider ? "Y" : "";
                        addField('hasCar', hasCar, participantNum);
                        if (hasCar) {
                            addField('numberplate', participant.name + ': ' + participant.vehicleRego, participantNum);
                        }
                        participantNum += 1;
                    };
                });

                document.body.appendChild(form);
                setTimeout(function() { // Put the form submission at end of queue
                    form.submit();
                    document.body.removeChild(form);
                }, 1000);

            };

            //-----------------------------------

        }]).animation('.slide', AnimationSlide);

}());
