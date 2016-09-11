(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showDetail', [function () {

        var controller = ['$sce', 'metadataService', 'changeService',
            function ($sce, metadataService, changeService) {

                var showDetailController = this;

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
				
				showDetailController.getMapHtml = function() {
					return $sce.trustAsHtml(showDetailController.tripDetail.mapHtml);
				};


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
                update: '&'
            },
            controller: controller,
            controllerAs: 'showDetailController',
            templateUrl: 'app/show-trip/show-detail.html'
        };
    }]);

}());
