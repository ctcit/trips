
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('sessionStateService', 
        ['membersService', 'metadataService', 'configService', 'State',
        function (membersService, metadataService, configService, State) {

            var _trip = null;
            var _originalState = null;

            //---------------------------------

            function setTrip(trip) {
                _trip = trip;
                _originalState = trip ? angular.copy(new State(trip)) : null;
            }

            function diffString() {
                return configService.showDebugUpdate() && _trip.tripDetail ? JSON.stringify(_trip.tripDetail.Diffs(_originalState)) : '';
            };

            function isDirty() {
                return _trip && calculateDiffs(new State(_trip), _originalState).length > 0;
            };

            function isDirtyMessage() {
                var state = new State(_trip);
                var changes = calculateDiffs(state, _originalState).length;
                return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
            }

            function isDirtyReset() {
                _trip = null;
                _originalState = null;
            };

            function diffs() {

                var state = new State(_trip);
                var diffs = calculateDiffs(state, _originalState);

                // Weed out superfluous diffs, where the participant data is the same as the member data 
                for (var i = 0; i < diffs.length; i++) {
                    var diff = diffs[i];
                    var participants = _trip.participants;

                    if (diff.line != null && participants[diff.line].isNew) {
                        var member = membersService.getMember(participants[diff.line].memberid);
                        if (member && member[diff.column] && member[diff.column] == diff.after) {
                            diffs.splice(i--, 1);
                        }
                    }
                }

                return diffs;
            };

            function calculateDiffs(currentState, refState) {
                var diffs = [];

                if (currentState && refState) {
                    var diff = {};

                    var tripsMetadata = metadataService.getTripsMetadata();
                    for (diff.column in tripsMetadata) {
                        diff.before = ToSql(refState.tripDetail[diff.column], tripsMetadata[diff.column]);
                        diff.after = ToSql(currentState.tripDetail[diff.column], tripsMetadata[diff.column]);
                        if (diff.before != diff.after) {
                            diff.action = "updatetrip";
                            diffs.push(angular.copy(diff));
                        }
                    }

                    var participantsMetadata = metadataService.getParticipantsMetadata();
                    for (diff.line in currentState.participants) {
                        for (diff.column in participantsMetadata) {
                            diff.before = refState.participants[diff.line] ? ToSql(refState.participants[diff.line][diff.column], participantsMetadata[diff.column]) : null;
                            diff.after = currentState.participants[diff.line] ? ToSql(currentState.participants[diff.line][diff.column], participantsMetadata[diff.column]) : null;
                            if (diff.before != diff.after) {
                                diff.action = currentState.participants[diff.line].isNew ? "insertparticipant" : "updateparticipant";
                                diffs.push(angular.copy(diff));
                            }
                        }
                    }
                }

                return diffs;
            }

            //---------------------------------

            return {
                setTrip: setTrip,

                originalTrip: function() { return _originalTrip; },
                originalState: function() { return _originalState; },

                diffString: diffString,
                isDirty: isDirty,
                isDirtyMessage: isDirtyMessage,
                isDirtyReset: isDirtyReset,
                diffs: diffs
            }
        }]
    );

}());
