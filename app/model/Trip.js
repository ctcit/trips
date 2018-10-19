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

                var maxParticipants = parseInt(this.tripDetail.maxParticipants);
                this.tripDetail.maxParticipants = !isNaN(maxParticipants) ? maxParticipants : undefined;

            }

            //angular.extend(Trip.prototype, {
            //});

            return Trip;
        }]
    );
})();