(function () {
    "use strict";

    angular.module('tripSignupApp').factory("Participant",
        [
        function () {
            
            function Participant(participantData, participantMetadata) {
                //"line": "0",
                //"isRemoved": "0",
                //"memberid": "675",
                //"isLeader": "1",
                //"name": "Joe Bloggs",
                //"email": "joebloggs@slingshot.co.nz",
                //"phone": "111-8360",
                //"isVehicleProvider": "0",
                //"vehicleRego": "",
                //"status": ""

                Initialize(this, participantData, participantMetadata);

                this.line = parseInt(this.line); // get this back as string - but simpler to deal with it as an number
                this.lastname = this.name;

            }

            return Participant;
        }]
    );
})();