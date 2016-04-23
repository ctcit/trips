(function () {
    "use strict";

    angular.module('tripApp').factory("TripEmail",
        [
        function () {

            function TripEmail() {
                this.action = "email";
                this.subject = "";
                this.body = "";
            }

            angular.extend(TripEmail.prototype, {
                setSubject: function(subject) {
                    this.subject = subject;
                }
            });

            return TripEmail;
        }]
    );

}());