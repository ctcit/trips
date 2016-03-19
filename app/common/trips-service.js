
(function () {
    'use strict';

    angular.module('tripApp').factory('tripsService',
        ['site', '$http', 
        function (site, $http) {

            function getGroups() {
                return $http.get(site.resturl + "?action=gettrips")
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            return response.groups.map(function (group) {
                                return new Group(groupData);
                            });
                        }
                    });
            };

            function getTrip(tripId) {
                return $http.get(site.resturl + "?action=gettrip&tripid=" + tripId)
                    .then(function(response) {
                        if (ValidateResponse(response)) {
                            // todo - tidy up
                            return {
                                metadata: response.metadata,
                                userid: response.userid,
                                editid: response.editid,
                                config: response.config,
                                trip: new Trip(response.trip)
                            };
                        }
                    });
            };

            return {
                getGroups: getGroups,
                getTrip: getTrip
            }
        }
    ]);

}());
