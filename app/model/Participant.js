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
                //"displayPriority": "0"

                Initialize(this, participantData, participantMetadata);

                this.line = parseInt(this.line); // get this back as string - but simpler to deal with it as an number
                this.lastname = this.name;

                var displayPriority = parseFloat(this.displayPriority);
                if (this.isRemoved) {
                    this.displayPriority = isNotSet(displayPriority) || displayPriority < 10000 || displayPriority >= 20000 ?
                        10000 + this.line : displayPriority;
                }
                else if (this.isNew && (this.name || "") == "") {
                    this.displayPriority = isNotSet(displayPriority) || displayPriority < 20000 ?
                        20000 + this.line : displayPriority;
                }
                else {
                    this.displayPriority = isNotSet(displayPriority) || displayPriority >= 10000 ?
                        this.line : displayPriority;
                }
            }

            function isNotSet(displayPriority) {
                return displayPriority == null || isNaN(displayPriority)
            }

            //angular.extend(Participant.prototype, {
            //});

            return Participant;
        }]
    );
})();