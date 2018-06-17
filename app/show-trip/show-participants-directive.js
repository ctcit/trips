﻿(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showParticipants', [function () {

        var controller = ['$scope','configService', 'currentUserService', 'membersService', 'metadataService', 'changeService', 'Participant',
            function ($scope, configService, currentUserService, membersService, metadataService, changeService, Participant) {

                var showParticipantsController = this;
                var currentUserId = currentUserService.getUserId();
				var everyoneByName = {};

                showParticipantsController.members = membersService.getMembers();
				showParticipantsController.members.forEach(function (person) {
                    everyoneByName[person.name.toUpperCase()] = person.name;
				});

                showParticipantsController.nonmembersByName = {};
                showParticipantsController.nonmembers.filter(function (person) {return person.name != null}).forEach(function (person) {
                    showParticipantsController.nonmembersByName[person.name] = person;
                    everyoneByName[person.name.toUpperCase()] = person.name;
                });

                // The "Full" list
                showParticipantsController.everyone = $.map(everyoneByName,function(person) { return person; });
				showParticipantsController.everyone.sort();
                
                // visibleParticipants - determines how many rows to display - including one to add new names (if the trip is still open)
                showParticipantsController.visibleParticipants = 0;
                showParticipantsController.participants.forEach(function (participant) {
                    if (!participant.isNew && participant.line >= showParticipantsController.visibleParticipants) {
                        showParticipantsController.visibleParticipants++;
                    }
                });
                showParticipantsController.visibleParticipants += showParticipantsController.tripIsOpen || showParticipantsController.tripeditable ? 1 : 0;

                showParticipantsController.toggle = function toggle() {
                    showParticipantsController.showparticipants = !showParticipantsController.showparticipants;
                }

                // Wait list
                showParticipantsController.$onChanges = function(changesObj) {
                    if (changesObj['maxParticipants']) {
                        showParticipantsController.evaluateWaitList();
                    }
                }

                showParticipantsController.evaluateWaitList = function() {
                    var participantsCount = 0;
                    var firstWaitListed = showParticipantsController.participants.find(function (participant) {
                        if (!participant.isRemoved)
                        {
                            participantsCount++;
                        }
                        return showParticipantsController.maxParticipants && participantsCount > showParticipantsController.maxParticipants;
                    });
                    showParticipantsController.firstWaitListedLine = firstWaitListed && firstWaitListed.line;
                }

                showParticipantsController.signMeUp = function signMeUp() {
                    for (var i = 0; i < showParticipantsController.participants.length; i++) {
                        var participant = showParticipantsController.participants[i];
                        if (participant.isNew && (participant.name || "") == "") {
                            var currentUser = currentUserService.getUser();
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
                    var currentUser = currentUserService.getUser();
                    return 	showParticipantsController.participants &&
							showParticipantsController.participants.some(function(participant) {
                        return participant.memberid == currentUser.id;
                    })
                }

                //-----------------

                $scope.participantComparator = function(participant) {
                    if (participant.isRemoved)
                        return 10000 + participant.displayPriority;
                    else if (participant.isNew)
                        return 20000 + participant.displayPriority;
                    else
                        return participant.displayPriority;
                }

                $scope.$on('dragToReorder.dropped', function(evt, data) {
                    console.log("dragToReorder.dropped " + data.prevIndex + " to " + data.newIndex);
                    var draggedParticipant = data.item;
                    var reorderedParticipants = data.list;
                    if (data.prevIndex != data.newIndex) {
                        var prevParticipantDisplayPriority = data.newIndex > 0 ? reorderedParticipants[data.newIndex - 1].displayPriority : 0;
                        var nextParticipantDisplayPriority = data.newIndex < reorderedParticipants.length - 1 ? 
                            reorderedParticipants[data.newIndex + 1].displayPriority : prevParticipantDisplayPriority + 1;
                        draggedParticipant.displayPriority = (prevParticipantDisplayPriority + nextParticipantDisplayPriority) / 2;
                        console.log("dragToReorder.dropped - new displayPriority is " + draggedParticipant.displayPriority);
                    }
                })

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
					var name = participant.name;
                    var member = membersService.getMemberByName(name);
                    if (member) {
                        participant.memberid = member.id;
                        participant.email = member.email;
                        participant.phone = member.phone;
                        participant.lastname = participant.name;
                    } else {
                        var nonmember = showParticipantsController.nonmembersByName[name];
                        if (nonmember) {
                            participant.memberid = null;
                            participant.email = nonmember.email;
                            participant.phone = nonmember.phone;
                        } else {
                            participant.memberid = null;

							$("#membernames").html(showParticipantsController.everyone.filter(function(item){
									return item && item.substr(0,name.length).toUpperCase() == name.toUpperCase();
								}).filter(function(item, index){
									return index < 10;
								}).map(function(item){
									return $('<option/>').attr('value',item);
								}));
						}
                    }
                    showParticipantsController.visibleParticipants = Math.max(participant.line + 2, showParticipantsController.visibleParticipants);
                    showParticipantsController.update();
                }

                showParticipantsController.participantClass = function participantClass(participant, prop) {
                    if (!showParticipantsController.originalParticipants) {
                        return "";
                    }
                    var classname = 
                        (participant.isRemoved ? "isRemoved" : "") + " " + 
                        (participant.line >= showParticipantsController.firstWaitListedLine ? "isWaitListed" : "") + " " + 
                        (changeService.highlights[prop + participant.line] || changeService.highlights[participant.line] || "");
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


                function refreshResults($select){
                    var search = $select.search,
                    list = angular.copy($select.items),
                    FLAG = -1;
                    //remove last user input
                    list = list.filter(function(item) { 
                    return item.id !== FLAG; 
                    });
                
                    if (!search) {
                    //use the predefined list
                    $select.items = list;
                    }
                    else {
                    //manually add user input and set selection
                    var userInputItem = {
                        id: FLAG, 
                        description: search
                    };
                    $select.items = [userInputItem].concat(list);
                    $select.selected = userInputItem;
                    }
                }
                    
                function clear($event, $select){
                    $event.stopPropagation(); 
                    //to allow empty field, in order to force a selection remove the following line
                    $select.selected = undefined;
                    //reset search query
                    $select.search = undefined;
                    //focus and open dropdown
                    $select.activate();
                }
                    


            }];

        return {
            restrict: 'E',
            replace: true,
            scope: {},
            bindToController: {
                showparticipants: '=',
                tripeditable: '=',
                tripIsOpen: '=',
                maxParticipants: '<',
                participants: '=',
                nonmembers: '=',
                originalParticipants: '=',
                saveState: '=',
                printable: '=',
                update: '&',
                save: '&',
                isDirty: '&'
            },
            controller: controller,
            controllerAs: 'showParticipantsController',
            templateUrl: 'app/show-trip/show-participants.html'
        };
    }]);

}());
