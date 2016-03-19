function Change(source, verb) {
    Initialize(this, source);
    this.verb = verb || "Changed";
    this.classname = "";
}

angular.extend(Change.prototype, {

    Timestamp: function changeTimestamp() {
        var date = new Date(this.timestamp + " UTC");
        return dow[date.getDay()] + " " + date.getDate() + " " + moy[date.getMonth()] + " " + date.toISOString().substr(11, 5);
    },

    Name: function changeName(memberid) {
        return state.membersbyid[memberid] ? state.membersbyid[memberid].name : "blank";
    },

    Table: function changeTable() {
        return this.table || (this.line == null ? "trips" : "participants");
    },

    ColName: function changeColName() {
        return metadata[this.Table()][this.column].Display;
    },

    Description: function changeDescription() {
        return this.action == "email"
			    ? "Sent email Subject: " + this.subject :
		    this.line == null
			    ? this.verb + " " + this.ColName() + " from '" + this.before + "' to '" + this.after + "'" :
		    this.column == "memberid"
			    ? this.verb + " line " + (parseInt(this.line) + 1) + " Member from '" +
						    this.Name(this.before || -1) + "' to '" + this.Name(this.after) + "'" :
		    metadata[this.Table()][this.column].Type == "tinyint(1)"
			    ? this.verb + " line " + (parseInt(this.line) + 1) + " " + this.ColName() + " from " +
						    (this.before == true ? "yes" : "no") + " to " + (this.after == true ? "yes" : "no")
			    : this.verb + " line " + (parseInt(this.line) + 1) + " " + this.ColName() + " from '" +
						    this.before + "' to '" + this.after + "'";
    },

    DetailToggle: function changeDetailToggle() {
        var g, c;
        var classnames = { highlight5: 1, highlight4: 1, highlight3: 1, highlight2: 1, highlight1: 1 };

        this.classname = "";
        this.showdetail = !this.showdetail;

        if (this.showdetail) {

            for (g in state.$scope.changes) {
                delete classnames[state.$scope.changes[g][0].classname];
            }

            for (this.classname in classnames) {
            }
        }

        state.highlights = {};
        for (g in state.$scope.changes) {
            var group = state.$scope.changes[g][0];
            if (group.classname != "") {
                for (c in state.$scope.changes[g]) {
                    var change = state.$scope.changes[g][c];
                    state.highlights[(change.action == "insert" ? "" : change.column) +
						     (change.line == null ? "" : change.line)] = group.classname;
                }
            }
        }
    }

});
