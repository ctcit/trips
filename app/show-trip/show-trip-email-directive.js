(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showTripEmail', [function () {

        var controller = [
            function () {

                var showTripEmailController = this;

            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showtripemail: '=',
                email: '=',
                tripeditable: '=',
                participants: '=',
                emailState: '=',
                emailSend: '&',
                isDirty: '&'
			},
            controller: controller,
            controllerAs: 'showTripEmailController',
            templateUrl: 'app/show-trip/show-trip-email.html'
        };
    }]);

}());
