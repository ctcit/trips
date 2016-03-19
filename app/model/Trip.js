function Trip(response) {

    Initialize(this, response.trip, metadata.trips);
    state.tripeditable = false;
    state.$scope.email.subject = "RE: " + this.title + " trip on " +
					dow[this.date.getDay()] + " " + this.date.getDate() + " " + moy[this.date.getMonth()] + " " + this.date.getFullYear();

    this.SetParticipants(response.participants);
    this.SetChanges(response.changes);
    this.SetMembers(response.members);
    this.SetNonMembers(response.nonmembers);

    for (var line in this.participants) {
        var participant = this.participants[line];
        participant.nameui = (state.tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
    }

    state.original = angular.copy(this);
    state.last = angular.copy(this);
    state.Undo = [];
    state.Redo = [];
    state.visibleparticipants += this.isOpen || state.tripeditable ? 1 : 0;
}

angular.extend(Trip.prototype, {

    SetParticipants: function tripSetParticipants(participants) {

        state.visibleparticipants = participants.length;

        this.participants = [];
        for (var i = 0; i < state.visibleparticipants + state.config.AdditionalLines; i++) {
            var participant = this.participants[i] = new Participant(participants[i] || { line: i, isNew: true });

            if (parseInt(participant.line) > i) {
                state.visibleparticipants++;
                this.participants.splice(i, 0, new Particpant({ line: i, isNew: true }));
            } else {
                participant.line = i;
                state.tripeditable = state.tripeditable || (participant.memberid == userid && participant.isLeader);
            }
        }

    },

    SetChanges: function tripSetChanges(changes) {
        state.$scope.changes = changes;
        for (var g in changes) {
            for (var c in changes[g]) {
                var change = state.$scope.changes[g][c] = new Change(changes[g][c]);
                if (change.line && this.participants[change.line]) {
                    this.participants[change.line].iseditable = change.memberid == userid;
                }
            }
        }
    },

    SetMembers: function tripSetMembers(members, nonmembers) {
        state.membersbyid = {};
        state.membersbyname = {};
        state.$scope.members = state.membersbyname;

        for (var i in members) {
            state.membersbyid[members[i].id] = members[i];
            state.membersbyname[members[i].name] = members[i];
            state.tripeditable = state.tripeditable || (members[i].id == userid && members[i].role != null);
        }
    },

    SetNonMembers: function tripSetNonMembers(nonmembers) {
        state.nonmembers = {};
        state.$scope.nonmembers = state.nonmembers;

        for (var i in nonmembers) {
            state.nonmembers[nonmembers[i].name] = nonmembers[i];
        }
    },

    Diffs: function tripDiffs(ref) {

        var diffs = [], diff = {};

        for (diff.column in metadata.trips) {
            diff.before = ToSql(ref[diff.column], metadata.trips[diff.column]);
            diff.after = ToSql(this[diff.column], metadata.trips[diff.column]);
            if (diff.before != diff.after) {
                diff.action = "updatetrip";
                diffs.push(angular.copy(diff));
            }
        }

        for (diff.line in this.participants) {
            for (diff.column in metadata.participants) {
                diff.before = ToSql(ref.participants[diff.line][diff.column], metadata.participants[diff.column]);
                diff.after = ToSql(this.participants[diff.line][diff.column], metadata.participants[diff.column]);
                if (diff.before != diff.after) {
                    diff.action = this.participants[diff.line].isNew ? "insertparticipant" : "updateparticipant";
                    diffs.push(angular.copy(diff));
                }
            }
        }

        return diffs;
    },

    Class: function tripClass(prop) {
        var before = ToSql(state.original[prop], metadata.trips[prop]);
        var after = ToSql(this[prop], metadata.trips[prop]);
        return (before == after ? "" : "updated") + " " + (state.highlights[prop] || "");
    },

    SignMeUp: function tripSignMeUp() {
        for (var i = 0; i < this.participants.length; i++) {
            if (this.participants[i].isNew && (this.participants[i].name || "") == "") {
                this.participants[i].memberid = userid;
                this.participants[i].name = state.membersbyid[userid].name;
                this.participants[i].email = state.membersbyid[userid].email;
                this.participants[i].phone = state.membersbyid[userid].phone;
                state.visibleparticipants = Math.max(i + 2, state.visibleparticipants);
                state.Update();
                break;
            }
        }
    },

    ImSignedUp: function tripImSignedUp() {
        for (var i in this.participants) {
            if (this.participants[i].memberid == userid) {
                return true;
            }
        }
        return false;
    }

});
