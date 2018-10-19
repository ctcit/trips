
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('metadataService',
        ['$q', '$http', 'site', 
        function ($q, $http, site) {

            //---------------------------------

            var _metadata = undefined;

            //---------------------------------

            function load() {

                return _metadata ? $q.when(_metadata) : $http.get(site.restUrl('metadata', 'get'))
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            _metadata = response.data.metadata;
                            return _metadata;
                        }
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
                load: load,

                getTripsMetadata: getTripsMetadata,
                getParticipantsMetadata: getParticipantsMetadata,
                getMetadataForTable: getMetadataForTable
            }
        }]
    );

}());
