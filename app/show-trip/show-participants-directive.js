(function () {
    'use strict';

    angular.module('tripApp').directive('showParticipants', [function () {

        var controller = ['currentUserService', 'membersService', 'metadataService',
            function (currentUserService, membersService, metadataService) {

                var showParticipantsController = this;

                showParticipantsController.members = membersService.getMembers();

                showParticipantsController.signMeUp = function signMeUp() {
                    for (var i = 0; i < showParticipantsController.participants.length; i++) {
                        var participant = showParticipantsController.participants[i];
                        if (participant.isNew && (participant.name || "") == "") {
                            var currentUser = currentUserService.user();
                            participant.memberid = currentUser.id;
                            participant.name = currentUser.name;
                            participant.email = currentUser.email;
                            participant.phone = currentUser.phone;
                            showParticipantsController.maxParticipants = Math.max(i + 2, showParticipantsController.maxParticipants);
                            showParticipantsController.update();
                            break;
                        }
                    }
                }

                showParticipantsController.ImSignedUp = function ImSignedUp() {
                    var currentUser = currentUserService.user();
                    for (var i in showParticipantsController.participants) {
                        var participant = showParticipantsController.participants[i];
                        if (participant.memberid == currentUser.id) {
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
                    var member = membersService.getMemberByName(participant.name);
                    if (member) {
                        participant.memberid = member.id;
                        participant.email = member.email;
                        participant.phone = member.phone;
                        participant.lastname = participant.name;
                    } else {
                        var nonmember = showParticipantsController.nonmembers[participant.name];
                        if (nonmember) {
                            participant.memberid = null;
                            participant.email = nonmember.email;
                            participant.phone = nonmember.phone;
                        } else if (participant.name == "(Someone else)") {
                            participant.memberid = null;
                            participant.nameui = "(Someone else)";
                            participant.name = participant.lastname;
                        } else {
                            participant.memberid = null;
                        }
                    }
                    showParticipantsController.maxParticipants = Math.max(participant.line + 2, showParticipantsController.maxParticipants);
                    showParticipantsController.update();
                }

                showParticipantsController.participantClass = function participantClass(participant, prop) {
                    var classname = (participant.isRemoved ? "isRemoved" : "") + " " + (showParticipantsController.highlights[prop + participant.line] || showParticipantsController.highlights[participant.line] || "");
                    if (participant.isNew) {
                        for (var p in metadataService.getParticipantsMetadata()) {
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
                memberid: '=',
                participants: '=',
                maxParticipants: '=',
                nonmembers: '=',
                nonmembersByName: '=',
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
