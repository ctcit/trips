(function () {
    'use strict';

    angular.module('tripSignupApp').directive('showParticipants', [function () {

        var controller = ['$scope','configService', 'currentUserService', 'membersService', 'metadataService', 'changeService', 'Participant',
            function ($scope, configService, currentUserService, membersService, metadataService, changeService, Participant) {

                var busy = false;
                var showParticipantsController = this;
                var currentUserId = currentUserService.getUserId();
                var everyoneByName = {};

                //-----------------
                // members and non-members lists

                showParticipantsController.members = membersService.getMembers();
				showParticipantsController.members.forEach(function (person) {
                    everyoneByName[person.name.toUpperCase()] = person.name;
				});

                showParticipantsController.nonmembersByName = {};
                showParticipantsController.nonmembers.filter(function (person) {return person.name != null}).forEach(function (person) {
                    showParticipantsController.nonmembersByName[person.name] = person;
                    everyoneByName[person.name.toUpperCase()] = person.name;
                });

                // the "Full" list
                showParticipantsController.everyone = $.map(everyoneByName,function(person) { return person; });
				showParticipantsController.everyone.sort();
                
                //-----------------
                // visibleParticipants - determines how many rows to display - including one to add new names (if the trip is still open)
                showParticipantsController.visibleParticipants = 0;
                showParticipantsController.participants.forEach(function (participant) {
                    if (!participant.isNew && participant.line >= showParticipantsController.visibleParticipants) {
                        showParticipantsController.visibleParticipants++;
                    }
                });
                showParticipantsController.visibleParticipants += showParticipantsController.tripIsOpen || showParticipantsController.tripeditable ? 1 : 0;

                //-----------------
                // sorted participants for display

                showParticipantsController.sortParticipants = function() {
                    showParticipantsController.sortedParticipants = showParticipantsController.participants.slice(0); // shallow clone
                    showParticipantsController.sortedParticipants.sort(function(p1, p2) {
                        return p1.displayPriority - p2.displayPriority;
                    });
                }

                //-----------------
                // wait list

                showParticipantsController.evaluateWaitAndRemovedLists = function() {
                    showParticipantsController.sortParticipants();
                    var firstWaitListed = showParticipantsController.sortedParticipants[showParticipantsController.maxParticipants];
                    showParticipantsController.firstWaitListedDisplayPriority = firstWaitListed && !firstWaitListed.isRemoved && firstWaitListed.displayPriority;
                    var firstRemovedIndex = showParticipantsController.sortedParticipants.findIndex2(function(p) {
                        return p.isRemoved;
                    });
                    var firstEmptyIndex = showParticipantsController.sortedParticipants.findIndex2(function(p) {
                        return showParticipantsController.isEmpty(p);
                    });
                    showParticipantsController.maxMoveIndex = 
                        (firstRemovedIndex >= 0 ? firstRemovedIndex :
                         firstEmptyIndex >= 0 ? firstEmptyIndex :
                        showParticipantsController.sortedParticipants.length ) - 1;

                    showParticipantsController.updatePrintProperties();
                }

                showParticipantsController.$onChanges = function(changesObj) {
                    if (changesObj['maxParticipants']) {
                        showParticipantsController.evaluateWaitAndRemovedLists();
                    }
                }

                showParticipantsController.isEmpty = function(participant) {
                    return participant.isNew && (participant.name || "") == "";
                }

                showParticipantsController.isListed = function(participant) {
                    return !participant.isRemoved && 
                        !showParticipantsController.isEmpty(participant) && 
                        (!showParticipantsController.firstWaitListedDisplayPriority || participant.displayPriority < showParticipantsController.firstWaitListedDisplayPriority);
                }

                showParticipantsController.isWaitListed = function(participant) {
                    return !participant.isRemoved && 
                        !showParticipantsController.isEmpty(participant) && 
                        (showParticipantsController.firstWaitListedDisplayPriority && participant.displayPriority >= showParticipantsController.firstWaitListedDisplayPriority);
                }

                //-----------------
                // print properties
                showParticipantsController.updatePrintProperties = function() {
                    showParticipantsController.sortedParticipants.forEach(function(participant) {
                        participant.isPrintable = showParticipantsController.isListed(participant);
                        participant.isPrintableLeader = participant.isPrintable && participant.isLeader;
                        participant.isPrintableStatus = participant.isPrintable && (participant.status || '') != '';
                        participant.isPrintableRego = participant.isPrintable && (participant.vehicleRego || '') != '';   
                    });
                }

                //-----------------
                // participants reordering (leader and webmasters only)

                $scope.$on('dragToReorder.dropped', function(evt, data) {
                    var draggedParticipant = data.item;
                    // there's a bit of an issue when dragging to same location: 
                    // data.newIndex == data.prevIndex + 1, which is wrong and indistinguishable from dragging two rows down - ignoring for now
                    if (data.newIndex >= data.prevIndex) {
                        data.newIndex++; // account for direction of drag
                    }
                    // can only drag'n'drop within list and wait list
                    if (data.newIndex <= showParticipantsController.maxMoveIndex && data.prevIndex <= showParticipantsController.maxMoveIndex) {
                        showParticipantsController.moveToIndex(draggedParticipant, data.prevIndex, data.newIndex);
                    }
                });

                showParticipantsController.allowMove = function() {
                    return showParticipantsController.tripeditable && showParticipantsController.maxParticipants;
                }

                showParticipantsController.showMoveButtons = function(participant, index) {
                    return !showParticipantsController.isEmpty(participant) && !participant.isRemoved;
                }

                showParticipantsController.moveInEnabled = function(participant, index) {
                    return showParticipantsController.maxParticipants && index >= showParticipantsController.maxParticipants && !showParticipantsController.isEmpty(participant) && !participant.isRemoved;
                }

                showParticipantsController.moveOutEnabled = function(participant, index) {
                    return showParticipantsController.maxParticipants && showParticipantsController.maxMoveIndex >= showParticipantsController.maxParticipants && index < showParticipantsController.maxParticipants && !showParticipantsController.isEmpty(participant) && !participant.isRemoved;
                }

                showParticipantsController.moveUpEnabled = function(participant, index) {
                    return index > 0 && !showParticipantsController.isEmpty(participant) && !participant.isRemoved;
                }

                showParticipantsController.moveDownEnabled = function(participant, index) {
                    return index < showParticipantsController.maxMoveIndex && !showParticipantsController.isEmpty(participant) && !participant.isRemoved;
                }

                // maxParticipants = max participants for this trip - move to end of the (no-wait listed) list
                showParticipantsController.moveIn = function(participant, currentIndex) {
                    showParticipantsController.moveToIndexWithinList(participant, currentIndex, showParticipantsController.maxParticipants - 1);
                }

                // maxParticipants = max participants for this trip - move to start of the wait list
                showParticipantsController.moveOut = function(participant, currentIndex) {
                    showParticipantsController.moveToIndexWithinList(participant, currentIndex, showParticipantsController.maxParticipants);
                }

                showParticipantsController.moveUp = function(participant, currentIndex) {
                    showParticipantsController.moveToIndexWithinList(participant, currentIndex, currentIndex - 1);
                }

                showParticipantsController.moveDown = function(participant, currentIndex) {
                    showParticipantsController.moveToIndexWithinList(participant, currentIndex, currentIndex + 1);
                }

                // add new participant - added to the end of the wait list (or list if no wait list)
                showParticipantsController.add = function(participant, currentIndex) {
                    showParticipantsController.moveToIndex(participant, currentIndex, showParticipantsController.maxMoveIndex + 1, 0, showParticipantsController.maxMoveIndex + 1);
                }

                // remove participant - moved to the beginning of the removed list (immediately after the wait list)
                showParticipantsController.remove = function(participant, currentIndex) {
                    showParticipantsController.moveToIndex(participant, currentIndex, showParticipantsController.maxMoveIndex, showParticipantsController.maxMoveIndex + 1, showParticipantsController.maxMoveIndex + 1, 10000);
                }

                // unremove participant - moved to the end of the wait list (or list if no wait list)
                showParticipantsController.unremove = function(participant, currentIndex) {
                    showParticipantsController.moveToIndex(participant, currentIndex, showParticipantsController.maxMoveIndex + 1, 0, showParticipantsController.maxMoveIndex);
                }

                showParticipantsController.moveToIndexWithinList = function(participant, fromIndex, newIndex, minPrevIndex, maxNextIndex, minDisplayPriority) {
                    if (newIndex <= showParticipantsController.maxMoveIndex) {
                        showParticipantsController.moveToIndex(participant, fromIndex, newIndex, minPrevIndex, maxNextIndex, minDisplayPriority);
                    }
                }

                showParticipantsController.moveToIndex = function(participant, fromIndex, newIndex, minPrevIndex, maxNextIndex, minDisplayPriority) {
                    minPrevIndex = minPrevIndex | 0;
                    maxNextIndex = maxNextIndex | showParticipantsController.maxMoveIndex;
                    var newPrevIndex = fromIndex < newIndex ? newIndex : newIndex - 1;
                    var newNextIndex = fromIndex <= newIndex ? newIndex + 1 : newIndex;
                    var newPrevParticipant = newPrevIndex >= minPrevIndex ? showParticipantsController.sortedParticipants[newPrevIndex] : null;
                    var newNextParticipant = newNextIndex <= maxNextIndex ? showParticipantsController.sortedParticipants[newNextIndex] : null;
                    showParticipantsController.moveBetween(participant, newPrevParticipant, newNextParticipant, minDisplayPriority);
                }

                // reorders participants by changing the displayPriority in only the moved participant (minimizes history changes?)
                showParticipantsController.moveBetween = function(movedParticipant, newPrevParticipant, newNextParticipant, minDisplayPriority) {
                    minDisplayPriority = minDisplayPriority | 0;
                    var prevParticipantDisplayPriority = newPrevParticipant ? newPrevParticipant.displayPriority : minDisplayPriority;
                    var nextParticipantDisplayPriority = newNextParticipant ? newNextParticipant.displayPriority : prevParticipantDisplayPriority + 1;
                    movedParticipant.displayPriority = (prevParticipantDisplayPriority + nextParticipantDisplayPriority) / 2;
                    // console.log('prev: ' + prevParticipantDisplayPriority + ',  moved: ' + movedParticipant.displayPriority + ', next: ' + nextParticipantDisplayPriority);
                    showParticipantsController.evaluateWaitAndRemovedLists();
                }

                //-----------------

                showParticipantsController.onRemoveChanged = function(participant, index) {
                    if (participant.isRemoved) {
                        showParticipantsController.remove(participant, index); 
                    } else {
                        showParticipantsController.unremove(participant, index); 
                    }
                    showParticipantsController.update();
                }

                //-----------------

                showParticipantsController.toggle = function toggle() {
                    showParticipantsController.showparticipants = !showParticipantsController.showparticipants;
                }

                showParticipantsController.signMeUp = function signMeUp() {
                    busy = true;
                    for (var i = 0; i < showParticipantsController.participants.length; i++) {
                        var participant = showParticipantsController.participants[i];
                        if (showParticipantsController.isEmpty(participant)) {
                            var currentUser = currentUserService.getUser();
                            participant.memberid = currentUserId;
                            participant.name = currentUser.name;
                            participant.email = currentUser.email;
                            participant.phone = currentUser.phone;
                            showParticipantsController.visibleParticipants = Math.max(i + 2, showParticipantsController.visibleParticipants);
                            showParticipantsController.add(participant, i); 
                            showParticipantsController.update();
                            break;
                        }
                    }
                    busy = false;
                }

                showParticipantsController.ImSignedUp = function ImSignedUp() {
                    var currentUser = currentUserService.getUser();
                    return 	showParticipantsController.participants &&
							showParticipantsController.participants.some(function(participant) {
                        return participant.memberid == currentUserId;
                    })
                }

                //-----------------

                showParticipantsController.participantEnabled = function participantEnabled(participant) {
                    return participant.iseditable || participant.isNew || showParticipantsController.tripeditable || showParticipantsController.userId == showParticipantsController.memberid;
                }

                showParticipantsController.participantUpdateName = function participantUpdateName(participant, index) {
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

                showParticipantsController.participantSaveName = function participantSaveName(participant, index) {
                    showParticipantsController.visibleParticipants = Math.max(participant.line + 2, showParticipantsController.visibleParticipants);
                    if (index > showParticipantsController.maxMoveIndex) {
                        showParticipantsController.add(participant, index); // move to end of list (or wait list)
                    }
                    showParticipantsController.update();
                }

                showParticipantsController.participantClass = function participantClass(participant, prop) {
                    if (!showParticipantsController.originalParticipants) {
                        return "";
                    }
                    var classname = 
                        (participant.isRemoved ? "isRemoved" : "") + " " + 
                        (showParticipantsController.isWaitListed(participant) ? "isWaitListed" : "") + " " + 
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

                //-----------------
                 
                showParticipantsController.evaluateWaitAndRemovedLists();

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
