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

                // ensure displayPriority is consistent with flags
                var displayPriority = parseFloat(this.displayPriority);
                if (this.isNotSet(displayPriority) || !this.isValidDisplayPriority(displayPriority)) {
                    this.displayPriority = this.minDisplayPriority() + this.line + 0.5;
                } else {
                    this.displayPriority = displayPriority;
                }
            }

            angular.extend(Participant.prototype, {
                // return true if displayPriority is consistent with flags; false otherwise
                isValidDisplayPriority: function(displayPriority) {
                    return displayPriority > this.minDisplayPriority() && displayPriority < this.maxDisplayPriority();
                },

                // >= min
                minDisplayPriority: function() {
                    if (this.isRemoved) {
                        return 10000;
                    }
                    else if (this.isEmpty()) {
                        return 20000;
                    }
                    else {
                        return 0;
                    }
                },

                // < max
                maxDisplayPriority: function() {
                    if (this.isRemoved) {
                        return 20000;
                    }
                    else if (this.isEmpty()) {
                        return 30000;
                    }
                    else {
                        return 10000;
                    }
                },

                isNotSet: function(displayPriority) {
                    return displayPriority == null || isNaN(displayPriority);
                },

                isEmpty: function() {
                    return this.isNew && (this.name || "") == "";
                },

                // true if this participant is in the same sub-list (main/wait, removed, empty) as the withParticipant
                isInSameSubList: function(withParticipant) {
                    return this.minDisplayPriority() == withParticipant.minDisplayPriority();
                }

            });


            angular.extend(Participant, {
                // make displayPriority consistent with flags
                ensureValidDisplayPriorities: function(sortedParticipants) {
                    var prevDisplayPriority = null;
                    sortedParticipants.forEach(function (participant, index) {            
                        var maxDisplayPriority = participant.maxDisplayPriority();
                        var isInvalid = (prevDisplayPriority !== null && participant.displayPriority <= prevDisplayPriority) ||
                            !participant.isValidDisplayPriority(participant.displayPriority);
                        if (isInvalid) {
                            var minDisplayPriority = participant.minDisplayPriority();
                            if (prevDisplayPriority === null || prevDisplayPriority < minDisplayPriority) {
                                prevDisplayPriority = minDisplayPriority;
                            }
                            var maxDisplayPriority = participant.maxDisplayPriority();
                            var nextParticipant = index < sortedParticipants.length - 1 ? sortedParticipants[index] : null;
                            var nextDisplayPriority = nextParticipant !== null && 
                                participant.isValidDisplayPriority(nextParticipant.displayPriority) && 
                                participant.isInSameSubList(nextParticipant) &&
                                nextParticipant.displayPriority > prevDisplayPriority && 
                                nextParticipant.displayPriority < maxDisplayPriority ? 
                                nextParticipant.displayPriority : maxDisplayPriority;
                            participant.displayPriority = Participant.betweenDisplayPriorities(prevDisplayPriority, nextDisplayPriority);
                        }
                        prevDisplayPriority = participant.displayPriority;
                    });
                    Participant.dumpDisplayPriorities(sortedParticipants);
                },

                betweenDisplayPriorities: function(minDisplayPriority, maxDisplayPriority) {
                    if (maxDisplayPriority - minDisplayPriority > 2) {
                        maxDisplayPriority = minDisplayPriority + 2;
                    }
                    return (maxDisplayPriority + minDisplayPriority) / 2;
                },

                dumpDisplayPriorities: function(sortedParticipants) {
                    console.log("Display priorities: ");
                    sortedParticipants.forEach(function(participant) {
                        console.log(participant.displayPriority + ",  " + participant.name);
                    });
                    console.log("-----------------------");
                }

            });

            return Participant;
        }]
    );
})();