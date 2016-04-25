(function () {
    "use strict";

    angular.module('tripApp').factory("Participant",
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

                this.lastname = this.name;
                this.metadata = participantMetadata;
            }

            //angular.extend(Participant.prototype, {
            //});

            return Participant;
        }]
    );
})();