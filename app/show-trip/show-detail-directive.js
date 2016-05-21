(function () {
    'use strict';

    angular.module('tripApp').directive('showDetail', [function () {

        var controller = ['metadataService',
            function (metadataService) {

                var showDetailController = this;

                showDetailController.tripClass = function tripClass(prop) {
                    var tripsMetadata = metadataService.getTripsMetadata();
                    var before = ToSql(showDetailController.originalState.trip[prop], tripsMetadata[prop]);
                    var after = ToSql(showDetailController.trip[prop], tripsMetadata[prop]);
                    return (before == after ? "" : "updated") + " " + (showDetailController.highlights[prop] || "");
                }

            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showdetail: '=',
                tripeditable: '=',
                trip: '=',
                originalState: '=',
                highlights: '=',
                update: '&',
                textAreaFocus: '&'
            },
            controller: controller,
            controllerAs: 'showDetailController',
            templateUrl: 'app/show-trip/show-detail.html'
        };
    }]);

}());
