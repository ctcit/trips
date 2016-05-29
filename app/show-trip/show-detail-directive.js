﻿(function () {
    'use strict';

    angular.module('tripApp').directive('showDetail', [function () {

        var controller = ['metadataService',
            function (metadataService) {

                var showDetailController = this;

                showDetailController.tripClass = function tripClass(prop) {
                    if (!showDetailController.originalTripDetail) {
                        return "";
                    }
                    var tripsMetadata = metadataService.getTripsMetadata();
                    var before = ToSql(showDetailController.originalTripDetail[prop], tripsMetadata[prop]);
                    var after = ToSql(showDetailController.tripDetail[prop], tripsMetadata[prop]);
                    return (before == after ? "" : "updated") + " " + (showDetailController.highlights[prop] || "");
                };

                showDetailController.textAreaFocus = function(id) {
                    $('#' + id).keyup(function () {
                        $(this).attr('rows', $(this).val().split('\n').length);
                    });
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
                highlights: '=',
                update: '&'
            },
            controller: controller,
            controllerAs: 'showDetailController',
            templateUrl: 'app/show-trip/show-detail.html'
        };
    }]);

}());
