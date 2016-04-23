(function () {
    "use strict";

    angular.module('tripApp').factory("Group",
        ['Trip',
        function(Trip) {
            
            function Group(source, tripMetadata) {

                this.name = source.name;
                this.showdetail = this.isMyTrips = source.isMyTrips;
                this.trips = !source.trips ? [] : source.trips.map(function (tripData) {
                    return new Trip(tripData, tripMetadata);
                });
            }

            //angular.extend(Group.prototype, {
            //});

            return Group;
        }]
    );
})();