// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripSignupApp').controller("showAllTripsController",
        ['$scope', '$q', '$timeout', 'site', 'configService', 'metadataService', 'tripsService', 'Group',
		'currentUserService', 'membersService',
        function ($scope, $q, $timeout, site, configService, metadataService, tripsService, Group,
		currentUserService,membersService) {

            var controller = this;
			var allowNewTrips = false;

            controller.groups = [];

			controller.reload = function () {
				tripsService.getTripGroups()
					.then(function (groups) {
						controller.groups = groups;
						controller.groups[1].showdetail = controller.groups[0].trips.length == 0;
					});
			};
				
            controller.newTrip = function () {
				if (!confirm("Are you sure you want to make a new trip?")){
					return;
				}

				tripsService.newTrip()
                    .then(function () {
						controller.reload();
						});
			};
            controller.newTrips = function () {
				tripsService.newTrips()
                    .then(function (message) {
						alert(message);
						controller.reload();
						});
			};
			controller.allowNewTrips = function(){
				return allowNewTrips;
			};
			
            $q.all([
                configService.load(),
                metadataService.load(),
				currentUserService.load(),
				membersService.load()
            ])
            .then(function() {			
				allowNewTrips = membersService.getMembers().some(function (member) {
                    return member.id == currentUserService.getUserId() && member.role != null;
                });
				controller.reload();
			});

        }]).animation('.slide', AnimationSlide);
}());
