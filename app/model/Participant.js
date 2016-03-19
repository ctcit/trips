function Participant(source) {
    Initialize(this, source, metadata.participants);
    this.lastname = this.name;
}

angular.extend(Participant.prototype, {

    Toggle: State.prototype.Toggle,

    Enabled: function participantEnabled() {
        return this.iseditable || this.isNew || state.tripeditable || userid == this.memberid;
    },

    CancelSomeoneElse: function participantCancelSomeoneElse() {
        this.memberid = null;
        this.nameui = "(Full)";
        this.name = this.lastname;
        state.Update();
    },

    UpdateName: function participantUpdateName() {
        if (state.membersbyname[this.name]) {
            this.memberid = state.membersbyname[this.name].id;
            this.email = state.membersbyname[this.name].email;
            this.phone = state.membersbyname[this.name].phone;
            this.lastname = this.name;
        } else if (state.nonmembers[this.name]) {
            this.memberid = null;
            this.email = state.nonmembers[this.name].email;
            this.phone = state.nonmembers[this.name].phone;
            this.lastname = this.name;
        } else if (this.name == "(Someone else)") {
            this.memberid = null;
            this.nameui = "(Someone else)";
            this.name = this.lastname;
        } else {
            this.memberid = null;
        }

        state.visibleparticipants = Math.max(this.line + 2, state.visibleparticipants);
        state.Update();
    },

    Class: function participantClass(prop) {
        var classname = (this.isRemoved ? "isRemoved" : "") + " " + (state.highlights[prop + this.line] || state.highlights[this.line] || "");

        if (this.isNew) {
            for (var p in metadata.participants) {
                if (state.original.participants[this.line][p] != this[p]) {
                    return classname + " inserted";
                }
            }
        }

        return classname + (state.original.participants[this.line][prop] == this[prop] ? "" : " updated");
    }

});