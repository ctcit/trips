(function () {
    'use strict';

    angular.module('tripApp').directive('showDetail', [function () {

        var controller = [
            function () {

                var showDetailController = this;

                showDetailController.tripClass = function tripClass(prop) {
                    var before = ToSql(showDetailController.originalState.trip[prop], showDetailController.metadata.trips[prop]);
                    var after = ToSql(showDetailController.trip[prop], showDetailController.metadata.trips[prop]);
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
                metadata: '=',
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
