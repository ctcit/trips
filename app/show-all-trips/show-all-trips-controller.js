// The controller for the current selected trip
(function () {
    "use strict";

    var state = {};

    angular.module('tripApp').controller("showAllTripsController",
        ['$scope', '$timeout', 'site', 'tripsService',
        function ($scope, $timeout, site, tripsService) {

            state.$scope = $scope;
            state.$timeout = $timeout;
            state.$scope.state = state;

            tripsService.getTripGroups()
                .then(function (groups) {
                    state.$scope.groups = groups;
                    state.$scope.groups[1].showdetail = state.$scope.groups[0].trips.length == 0;
                });

        }]).animation('.slide', AnimationSlide);
}());