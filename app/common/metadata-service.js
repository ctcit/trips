
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('metadataService',
        ['tripsService',
        function (tripsService) {

            //---------------------------------

            var _metadata = [];

            //---------------------------------

            function initMetadata() {

                return tripsService.getMetadata()
                    .then(function (metadata) {
                        _metadata = metadata;
                        return metadata;
                    });
            }

            function getTripsMetadata() {
                return _metadata.trips;
            }

            function getParticipantsMetadata() {
                return _metadata.participants;
            }

            function getMetadataForTable(table) {
                return _metadata[table];
            }


            //---------------------------------

            return {
                initMetadata: initMetadata,

                getTripsMetadata: getTripsMetadata,
                getParticipantsMetadata: getParticipantsMetadata,
                getMetadataForTable: getMetadataForTable
            }
        }]
    );

}());
