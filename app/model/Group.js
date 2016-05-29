(function () {
    "use strict";

    angular.module('tripApp').factory("Group",
        ['TripDetail',
        function (TripDetail) {
            
            function Group(source, tripMetadata) {

                this.name = source.name;
                this.showdetail = this.isMyTrips = source.isMyTrips;
                this.trips = !source.trips ? [] : source.trips.map(function (tripData) {
                    return new TripDetail(tripData, tripMetadata);
                });
            }

            //angular.extend(Group.prototype, {
            //});

            return Group;
        }]
    );
})();