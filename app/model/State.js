function State() {
    this.Undo = [];
    this.Redo = [];
    this.showdetail = this.showparticipants = true;
    this.warnings = [];
}

angular.extend(State.prototype, {

    //AllTrips: function stateAllTrips() {
    //    //window.location.replace('http://www.ctc.org.nz/trips/ShowTrips.php');
    //},

    UndoTitle: function stateUndoTitle(undo) {
        return this[undo].length == 0 ? "" : new Change(this.trip.Diffs(this[undo][this[undo].length - 1])[0], undo).Description();
    },

    UndoAction: function stateUndoAction(undo, redo) {
        var popped = state[undo].pop();

        this[redo].push(angular.copy(this.trip));

        for (var prop in metadata.trips) {
            this.trip[prop] = popped[prop];
        }
        this.trip.participants = angular.copy(popped.participants);
    },

    DiffString: function stateDiffString() {
        return state.config && state.config.ShowDebugUpdate && this.trip ? JSON.stringify(this.trip.Diffs(this.original)) : '';
    },

    SaveEnabled: function stateSaveEnabled() {
        return this.trip && this.trip.Diffs(this.original).length > 0;
    },

    Save: function stateSave(includeEmail) {
        var diffs = this.trip.Diffs(this.original);

        if (includeEmail) {
            diffs.splice(0, 0, this.$scope.email);
        }

        // Weed out superfluous diffs
        for (var i = 0; i < diffs.length; i++) {
            var diff = diffs[i];
            var participants = this.trip.participants;

            if (diff.line != null && participants[diff.line].isNew &&
			    state.membersbyid[participants[diff.line].memberid] &&
			    state.membersbyid[participants[diff.line].memberid][diff.column] &&
			    state.membersbyid[participants[diff.line].memberid][diff.column] == diff.after) {
                diffs.splice(i--, 1);
            }
        }

        this.savestate = "Saving";
        this.$http.post("api.post.php", { tripid: tripid, diffs: diffs }).success(function (result) {
            if (ValidateResponse(result)) {
                state.$timeout(function () {
                    state.$http.get("api.get.php?action=gettrip&editid=" + editid + "&tripid=" + tripid).success(function (response) {
                        if (ValidateResponse(response)) {
                            state.savestate = "Saved " + result.result;
                            state.$scope.trip = state.trip = new Trip(response);
                            state.$timeout(function () { state.$scope.$apply(); }, 0);
                        }
                    });
                }, 1000);
            }
        }).error(function (data, status) {
            state.savestate = "FAILED " + data + " " + status;
            state.$timeout(function () { state.$scope.$apply(); }, 0);
        });
    },

    TextareaFocus: function stateTextareaFocus(id) {
        $('#' + id).keyup(function () {
            $(this).attr('rows', $(this).val().split('\n').length);
        });
    },

    Update: function stateUpdate() {

        if (this.trip && this.trip.Diffs(this.last).length > 0) {
            this.Undo.push(this.last);
            this.last = angular.copy(this.trip);
            this.Redo.length = 0;
        }
    },

    EditRefresh: function stateEditRefresh() {

        state.$http.get("api.get.php?action=editrefresh&tripid=" + tripid + "&editid=" + editid).success(function (response) {

            if (ValidateResponse(response)) {
                var i;
                state.warnings.length = 0;

                if (!state.trip.isOpen) {
                    state.warnings.push('This trip is CLOSED. Contact the leader for more information.');
                }

                for (i = 0; i < response.edits.length; i++) {
                    state.warnings.push('This is also being edited by ' + state.membersbyid[response.edits[i].memberid].name + (i == 0 ? "" : " (" + (i + 1) + ")"));
                }

                for (i = 0; i < response.modifications.length && i < 1; i++) {
                    state.warnings.push('This has just been saved by ' + state.membersbyid[response.modifications[i].memberid].name +
							    ' - this may be now out-of-date.');
                }

                state.$timeout(function () { state.$scope.$apply(); }, 0);
                state.$timeout(function () { state.EditRefresh(); }, state.config.EditRefreshInSec * 1000);
            }
        });
    }

});