(function () {
    'use strict';

    angular.module('tripApp').directive('showParticipants', [function () {

        var controller = [
            function () {

                var showParticipantsController = this;

                showParticipantsController.signMeUp = function signMeUp() {
                    for (var i = 0; i < showParticipantsController.participants.length; i++) {
                        if (showParticipantsController.participants[i].isNew && (showParticipantsController.participants[i].name || "") == "") {
                            showParticipantsController.participants[i].memberid = showParticipantsController.userId;
                            showParticipantsController.participants[i].name = showParticipantsController.membersById[showParticipantsController.userId].name;
                            showParticipantsController.participants[i].email = showParticipantsController.membersById[showParticipantsController.userId].email;
                            showParticipantsController.participants[i].phone = showParticipantsController.membersById[showParticipantsController.userId].phone;
                            showParticipantsController.maxParticipants = Math.max(i + 2, showParticipantsController.maxParticipants);
                            showParticipantsController.update();
                            break;
                        }
                    }
                }

                showParticipantsController.ImSignedUp = function ImSignedUp() {
                    for (var i in showParticipantsController.participants) {
                        if (showParticipantsController.participants[i].memberid == showParticipantsController.userId) {
                            return true;
                        }
                    }
                    return false;
                }

                //-----------------

                showParticipantsController.participantEnabled = function participantEnabled(participant) {
                    return participant.iseditable || participant.isNew || showParticipantsController.tripeditable || showParticipantsController.userId == showParticipantsController.memberid;
                }

                showParticipantsController.participantCancelSomeoneElse = function participantCancelSomeoneElse(participant) {
                    participant.memberid = null;
                    participant.nameui = "(Full)";
                    participant.name = participant.lastname;
                    showParticipantsController.update();
                }

                showParticipantsController.participantUpdateName = function participantUpdateName(participant) {
                    if (showParticipantsController.membersByName[participant.name]) {
                        participant.memberid = showParticipantsController.membersByName[participant.name].id;
                        participant.email = showParticipantsController.membersByName[participant.name].email;
                        participant.phone = showParticipantsController.membersByName[participant.name].phone;
                        participant.lastname = participant.name;
                    } else if (showParticipantsController.nonmembers[participant.name]) {
                        participant.memberid = null;
                        participant.email = showParticipantsController.nonmembers[participant.name].email;
                        participant.phone = showParticipantsController.nonmembers[participant.name].phone;
                        participant
                    } else if (participant.name == "(Someone else)") {
                        participant.memberid = null;
                        participant.nameui = "(Someone else)";
                        participant.name = participant.lastname;
                    } else {
                        participant.memberid = null;
                    }
                    showParticipantsController.maxParticipants = Math.max(participant.line + 2, showParticipantsController.maxParticipants);
                    showParticipantsController.update();
                }

                showParticipantsController.participantClass = function participantClass(participant, prop) {
                    var classname = (participant.isRemoved ? "isRemoved" : "") + " " + (showParticipantsController.highlights[prop + participant.line] || showParticipantsController.highlights[participant.line] || "");
                    if (participant.isNew) {
                        for (var p in showParticipantsController.metadata.participants) {
                            if (showParticipantsController.originalState.participants[participant.line][p] != participant[p]) {
                                return classname + " inserted";
                            }
                        }
                    }
                    return classname + (showParticipantsController.originalState.participants[participant.line][prop] == participant[prop] ? "" : " updated");
                }



            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showparticipants: '=',
                tripeditable: '=',
                userId: '=',
                memberid: '=',
                participants: '=',
                maxParticipants: '=',
                membersById: '=',
                membersByName: '=',
                members: '=',
                nonmembers: '=',
                nonmembersByName: '=',
                metadata: '=',
                originalState: '=',
                highlights: '=',
                update: '&',
                textAreaFocus: '&'
            },
            controller: controller,
            controllerAs: 'showParticipantsController',
            templateUrl: 'app/show-trip/show-participants.html'
        };
    }]);

}());
