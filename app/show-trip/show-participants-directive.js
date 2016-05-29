﻿(function () {
    'use strict';

    angular.module('tripApp').directive('showParticipants', [function () {

        var controller = ['configService', 'currentUserService', 'membersService', 'metadataService', 'Participant',
            function (configService, currentUserService, membersService, metadataService, Participant) {

                var showParticipantsController = this;

                var currentUserId = currentUserService.userId();

                showParticipantsController.members = membersService.getMembers();

                showParticipantsController.nonmembersByName = {};
                showParticipantsController.nonmembers.forEach(function (nonmember) {
                    showParticipantsController.nonmembersByName[nonmember.name] = nonmember;
                })

                showParticipantsController.participants.forEach(function (participant, i) {
                    participant.nameui = (showParticipantsController.tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
                })

                showParticipantsController.visibleParticipants = 0;
                showParticipantsController.participants.forEach(function (participant) {
                    if (!participant.isNew && participant.line >= showParticipantsController.visibleParticipants) {
                        showParticipantsController.visibleParticipants++;
                    }
                });
                showParticipantsController.visibleParticipants += showParticipantsController.tripIsOpen || showParticipantsController.tripeditable ? 1 : 0;


                showParticipantsController.signMeUp = function signMeUp() {
                    for (var i = 0; i < showParticipantsController.participants.length; i++) {
                        var participant = showParticipantsController.participants[i];
                        if (participant.isNew && (participant.name || "") == "") {
                            var currentUser = currentUserService.user();
                            participant.memberid = currentUser.id;
                            participant.name = currentUser.name;
                            participant.email = currentUser.email;
                            participant.phone = currentUser.phone;
                            showParticipantsController.visibleParticipants = Math.max(i + 2, showParticipantsController.visibleParticipants);
                            showParticipantsController.update();
                            break;
                        }
                    }
                }

                showParticipantsController.ImSignedUp = function ImSignedUp() {
                    var currentUser = currentUserService.user();
                    return showParticipantsController.participants.some(function(participant) {
                        return participant.memberid == currentUser.id;
                    })
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
                        var nonmember = showParticipantsController.nonmembersByName[participant.name];
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
                    showParticipantsController.visibleParticipants = Math.max(participant.line + 2, showParticipantsController.visibleParticipants);
                    showParticipantsController.update();
                }

                showParticipantsController.participantClass = function participantClass(participant, prop) {
                    if (!showParticipantsController.originalParticipants) {
                        return "";
                    }
                    var classname = (participant.isRemoved ? "isRemoved" : "") + " " + (showParticipantsController.highlights[prop + participant.line] || showParticipantsController.highlights[participant.line] || "");
                    var originalParticipant = showParticipantsController.originalParticipants[participant.line];
                    if (participant.isNew) {
                        for (var p in metadataService.getParticipantsMetadata()) {
                            if (!originalParticipant || originalParticipant[p] != participant[p]) {
                                return classname + " inserted";
                            }
                        }
                    }
                    return classname + (originalParticipant && originalParticipant[prop] == participant[prop] ? "" : " updated");
                }

                showParticipantsController.textAreaFocus = function (id) {
                    $('#' + id).keyup(function () {
                        $(this).attr('rows', $(this).val().split('\n').length);
                    });
                };


            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showparticipants: '=',
                tripeditable: '=',
                tripIsOpen: '=',
                participants: '=',
                nonmembers: '=',
                originalParticipants: '=',
                highlights: '=',
                update: '&'
            },
            controller: controller,
            controllerAs: 'showParticipantsController',
            templateUrl: 'app/show-trip/show-participants.html'
        };
    }]);

}());
