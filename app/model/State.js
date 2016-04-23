(function () {
    "use strict";

    angular.module('tripApp').factory("State",
        [
        function () {

            function State(trip, participants) {
                this.trip = trip;
                this.participants = participants;
            }

            //angular.extend(State.prototype, {
            //});

            return State;
        }]
    );
})();