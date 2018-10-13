(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showDescription', [function () {

        var controller = [
            function () {

                var showDescriptionController = this;

            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showdescription: '=',
                trip: '='
            },
            controller: controller,
            controllerAs: 'showDescriptionController',
            templateUrl: 'app/show-trip/show-description.html'
        };
    }]);

}());
