(function () {
    "use strict";

    angular.module('tripApp').factory("State",
        [
        function () {

            function State(trip) {
                this.tripDetail = trip.tripDetail;
                this.participants = trip.participants;
            }

            //angular.extend(State.prototype, {
            //});

            return State;
        }]
    );
})();