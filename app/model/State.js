(function () {
    "use strict";

    angular.module('tripSignupApp').factory("State",
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