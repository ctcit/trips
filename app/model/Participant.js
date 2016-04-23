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

            angular.extend(Participant.prototype, {

                //// BSJ -todo
                //// Toggle: State.prototype.Toggle, // ????????????? todo

                //Enabled: function participantEnabled() {
                //    return this.iseditable || this.isNew || state.tripeditable || userid == this.memberid;
                //},

                //CancelSomeoneElse: function participantCancelSomeoneElse() {
                //    this.memberid = null;
                //    this.nameui = "(Full)";
                //    this.name = this.lastname;
                //    state.update();
                //},

                //UpdateName: function participantUpdateName() {
                //    if (state.membersbyname[this.name]) {
                //        this.memberid = state.membersbyname[this.name].id;
                //        this.email = state.membersbyname[this.name].email;
                //        this.phone = state.membersbyname[this.name].phone;
                //        this.lastname = this.name;
                //    } else if (state.nonmembers[this.name]) {
                //        this.memberid = null;
                //        this.email = state.nonmembers[this.name].email;
                //        this.phone = state.nonmembers[this.name].phone;
                //        this.lastname = this.name;
                //    } else if (this.name == "(Someone else)") {
                //        this.memberid = null;
                //        this.nameui = "(Someone else)";
                //        this.name = this.lastname;
                //    } else {
                //        this.memberid = null;
                //    }

                //    state.visibleparticipants = Math.max(this.line + 2, state.visibleparticipants);
                //    state.update();
                //},

                //Class: function participantClass(prop) {
                //    var classname = (this.isRemoved ? "isRemoved" : "") + " " + (state.highlights[prop + this.line] || state.highlights[this.line] || "");

                //    if (this.isNew) {
                //        for (var p in metadata.participants) {
                //            if (state.original.participants[this.line][p] != this[p]) {
                //                return classname + " inserted";
                //            }
                //        }
                //    }

                //    return classname + (state.original.participants[this.line][prop] == this[prop] ? "" : " updated");
                //}

            });

            return Participant;
        }]
    );
})();