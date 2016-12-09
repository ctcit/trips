// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripSignupApp').controller("showAllTripsController",
        ['$scope', '$q', '$timeout', 'site', 'configService', 'metadataService', 'tripsService', 'Group',
        function ($scope, $q, $timeout, site, configService, metadataService, tripsService, Group) {

            var controller = this;

            controller.groups = [];

			controller.reload = function () {
				tripsService.getTripGroups()
					.then(function (groups) {
						controller.groups = groups;
						controller.groups[1].showdetail = controller.groups[0].trips.length == 0;
					});
			};
				
            controller.newTrip = function () {
				tripsService.newTrip()
                    .then(function () {
						controller.reload();
						});
			};
			
            $q.all([
                configService.load(),
                metadataService.load()
            ])
            .then(function() {			
				controller.reload();
			});

        }]).animation('.slide', AnimationSlide);
}());