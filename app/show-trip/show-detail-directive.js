(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showDetail', [function () {

        var controller = ['metadataService', 'changeService',
            function (metadataService, changeService) {

                var showDetailController = this;

                showDetailController.showmap = true;
                showDetailController.tripClass = function tripClass(prop) {
                    if (!showDetailController.originalTripDetail) {
                        return "";
                    }
                    var tripsMetadata = metadataService.getTripsMetadata();
                    var before = ToSql(showDetailController.originalTripDetail[prop], tripsMetadata[prop]);
                    var after = ToSql(showDetailController.tripDetail[prop], tripsMetadata[prop]);
                    return (before == after ? "" : "updated") + " " + (changeService.highlights[prop] || "");
                };

                showDetailController.textAreaFocus = function(id) {
                    $('#' + id).keyup(function () {
                        $(this).attr('rows', $(this).val().split('\n').length);
                    });
                };

                showDetailController.maxParticipantsChange2 = function(maxParticipants) {
                    showDetailController.maxParticipantsChange(maxParticipants);
                }
            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showdetail: '=',
                tripeditable: '=',
                tripDetail: '=',
                originalTripDetail: '=',
                maxParticipantsChange: '&',
                update: '&'
            },
            controller: controller,
            controllerAs: 'showDetailController',
            templateUrl: 'app/show-trip/show-detail.html'
        };
    }]);

}());
