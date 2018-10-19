(function () {
    "use strict";

    angular.module('tripSignupApp').factory("Trip",
        ['Participant',
        function (Participant) {

            function Trip(tripDetail, tripEmail, participants, nonmembers) {

                this.tripDetail = tripDetail;
                this.tripEmail = tripEmail;
                this.participants = participants;
                this.nonmembers = nonmembers;

            }

            //angular.extend(Trip.prototype, {
            //});

            return Trip;
        }]
    );
})();