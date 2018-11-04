(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showPrint', [function () {

        var controller = ['$scope',
            function ($scope) {

                var showPrintController = this;

            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showdetail: '=',
                tripeditable: '=',
                tripDetail: '=',
                participants: '=',
                printableblanklines: '=',
            },
            controller: controller,
            controllerAs: 'showPrintController',
            templateUrl: 'app/show-trip/show-print.html'
        };
    }]);

}());
