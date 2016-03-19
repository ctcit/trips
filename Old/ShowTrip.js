//"use strict";

//var state = null;
//var tripid = 0;
//var editid = 0;
//var userid = 0;
//var metadata;

//function State() {
//	this.Undo = [];
//	this.Redo = [];
//	this.showdetail = this.showparticipants = true;
//	this.warnings = [];
//}

//State.prototype.AllTrips = function stateAllTrips() {
//	window.location.replace('http://www.ctc.org.nz/trips/ShowTrips.php');
//}
		
//State.prototype.UndoTitle = function stateUndoTitle(undo) {
//	return this[undo].length == 0 ? "" : new Change(this.trip.Diffs(this[undo][this[undo].length-1])[0], undo).Description();
//}

//State.prototype.UndoAction = function stateUndoAction(undo,redo) {
//	var popped = state[undo].pop();

//	this[redo].push(angular.copy(this.trip));
	
//	for (var prop in metadata.trips) {
//		this.trip[prop] = popped[prop];
//	}
//	this.trip.participants = angular.copy(popped.participants);
//}

//State.prototype.DiffString = function stateDiffString() {
//	return state.config && state.config.ShowDebugUpdate && this.trip ? JSON.stringify(this.trip.Diffs(this.original)) : '';
//}

//State.prototype.SaveEnabled = function stateSaveEnabled() {
//	return this.trip && this.trip.Diffs(this.original).length > 0;
//}

//State.prototype.Save = function stateSave(includeEmail) {
//	var diffs = this.trip.Diffs(this.original);
	
//	if (includeEmail) {
//		diffs.splice(0,0,this.$scope.email);
//	}

//	// Weed out superfluous diffs
//	for (var i = 0; i < diffs.length; i++) {
//		var diff = diffs[i];
//		var participants = this.trip.participants;
		
//		if (diff.line != null && participants[diff.line].isNew && 
//			state.membersbyid[participants[diff.line].memberid] &&
//			state.membersbyid[participants[diff.line].memberid][diff.column] &&
//			state.membersbyid[participants[diff.line].memberid][diff.column] == diff.after) {
//			diffs.splice(i--,1);
//		}				
//	}

//	this.savestate = "Saving";
//	this.$http.post("api.post.php", {tripid:tripid, diffs:diffs}).success(function(result) {
//		if (ValidateResponse(result)) {
//			state.$timeout(function() {
//				state.$http.get("api.get.php?action=gettrip&editid="+editid+"&tripid=" + tripid).success(function(response) {
//					if (ValidateResponse(response)) {
//						state.savestate = "Saved " + result.result;
//						state.$scope.trip = state.trip = new Trip(response);
//						state.$timeout(function() {state.$scope.$apply();}, 0);
//					}
//					});
//			}, 1000);	
//		}
//	}).error(function(data,status) {
//		state.savestate = "FAILED " + data + " " + status;
//		state.$timeout(function() {state.$scope.$apply();}, 0);					
//	});
//}

//State.prototype.TextareaFocus = function stateTextareaFocus(id) {
//	$('#'+id).keyup(function(){
//		$(this).attr('rows', $(this).val().split('\n').length);
//	});
//}

//State.prototype.Update = function stateUpdate() {

//	if (this.trip && this.trip.Diffs(this.last).length > 0) {
//		this.Undo.push(this.last);
//		this.last = angular.copy(this.trip);
//		this.Redo.length = 0;
//	}
//}

//State.prototype.EditRefresh = function stateEditRefresh() {

//	state.$http.get("api.get.php?action=editrefresh&tripid="+tripid+"&editid="+editid).success(function(response) {
	
//		if (ValidateResponse(response)) {
//			var i;
//			state.warnings.length = 0;
			
//			if (!state.trip.isOpen) {
//				state.warnings.push('This trip is CLOSED. Contact the leader for more information.');
//			}
			
//			for (i = 0; i < response.edits.length; i++)
//			{
//				state.warnings.push('This is also being edited by ' + state.membersbyid[response.edits[i].memberid].name + (i == 0 ? "" : " ("+(i+1)+")"));
//			}
	
//			for (i = 0; i < response.modifications.length && i < 1; i++)
//			{
//				state.warnings.push('This has just been saved by ' + state.membersbyid[response.modifications[i].memberid].name + 
//							' - this may be now out-of-date.');
//			}
		
//			state.$timeout(function() {state.$scope.$apply();}, 0);
//			state.$timeout(function() {state.EditRefresh();}, state.config.EditRefreshInSec * 1000 );
//		}
//	});
//}

//function Trip(response) {

//	Initialize(this, response.trip, metadata.trips);
//	state.tripeditable = false;
//	state.$scope.email.subject = "RE: " + this.title + " trip on " + 
//					dow[this.date.getDay()] + " " + this.date.getDate() + " " + moy[this.date.getMonth()] + " " + this.date.getFullYear();
	
//	this.SetParticipants(response.participants);
//	this.SetChanges(response.changes);
//	this.SetMembers(response.members);	
//	this.SetNonMembers(response.nonmembers);	
	
//	for (var line in this.participants) {
//		var participant = this.participants[line];
//		participant.nameui = (state.tripeditable ? "(Full)" : (participant.iseditable ? "(Members)" : "(Readonly)"));
//	}

//	state.original = angular.copy(this);
//	state.last = angular.copy(this);
//	state.Undo = [];
//	state.Redo = [];
//	state.visibleparticipants += this.isOpen || state.tripeditable ? 1 : 0;
//}

//Trip.prototype.SetParticipants = function tripSetParticipants(participants) {

//	state.visibleparticipants = participants.length;

//	this.participants = [];			
//	for (var i = 0; i < state.visibleparticipants + state.config.AdditionalLines; i++) {
//		var participant = this.participants[i] = new Participant(participants[i] || {line:i, isNew:true});
		
//		if (parseInt(participant.line) > i) {
//			state.visibleparticipants++;
//			this.participants.splice(i,0,new Particpant({line:i, isNew: true}));
//		} else {
//			participant.line = i;
//			state.tripeditable = state.tripeditable || (participant.memberid == userid && participant.isLeader);
//		}
//	}

//}

//Trip.prototype.SetChanges = function tripSetChanges(changes) {
//	state.$scope.changes = changes;
//	for (var g in changes) {
//		for (var c in changes[g]) {
//			var change = state.$scope.changes[g][c] = new Change(changes[g][c]);
//			if (change.line && this.participants[change.line]) {
//				this.participants[change.line].iseditable = change.memberid == userid;
//			}
//		}
//	}
//}

//Trip.prototype.SetMembers = function tripSetMembers(members, nonmembers) {
//	state.membersbyid = {};
//	state.membersbyname = {};
//	state.$scope.members = state.membersbyname;
	
//	for (var i in members) {
//		state.membersbyid[members[i].id] = members[i];
//		state.membersbyname[members[i].name] = members[i];
//		state.tripeditable = state.tripeditable || (members[i].id == userid && members[i].role != null);
//	}
//}

//Trip.prototype.SetNonMembers = function tripSetNonMembers(nonmembers) {
//	state.nonmembers = {};
//	state.$scope.nonmembers = state.nonmembers;
	
//	for (var i in nonmembers) {
//		state.nonmembers[nonmembers[i].name] = nonmembers[i];
//	}
//}


//Trip.prototype.Diffs = function tripDiffs(ref) {
	
//	var diffs = [], diff = {};
	
//	for (diff.column in metadata.trips) {
//		diff.before = ToSql(ref[diff.column], metadata.trips[diff.column]);
//		diff.after = ToSql(this[diff.column], metadata.trips[diff.column]);
//		if (diff.before != diff.after) {
//			diff.action = "updatetrip";
//			diffs.push(angular.copy(diff));
//		}
//	}
	
//	for (diff.line in this.participants) {
//		for (diff.column in metadata.participants) {
//			diff.before = ToSql(ref.participants[diff.line][diff.column], metadata.participants[diff.column]);
//			diff.after = ToSql(this.participants[diff.line][diff.column], metadata.participants[diff.column]);
//			if (diff.before != diff.after) {
//				diff.action = this.participants[diff.line].isNew ? "insertparticipant" : "updateparticipant";
//				diffs.push(angular.copy(diff));
//			}
//		}
//	}
	
//	return diffs;
//}

//Trip.prototype.Class = function tripClass(prop) {
//	var before = ToSql(state.original[prop],metadata.trips[prop]);
//	var after = ToSql(this[prop],metadata.trips[prop]);
//	return (before == after ? "": "updated") + " " + (state.highlights[prop] || "");
//}

//Trip.prototype.SignMeUp = function tripSignMeUp() {
//	for (var i = 0; i < this.participants.length; i++) {
//		if (this.participants[i].isNew && (this.participants[i].name || "") == "") {
//			this.participants[i].memberid = userid;
//			this.participants[i].name = state.membersbyid[userid].name;
//			this.participants[i].email = state.membersbyid[userid].email;
//			this.participants[i].phone = state.membersbyid[userid].phone;
//			state.visibleparticipants = Math.max(i + 2, state.visibleparticipants);
//			state.Update();
//			break;
//		}
//	}
//}

//Trip.prototype.ImSignedUp= function tripImSignedUp() {
//	for (var i in this.participants) {
//		if (this.participants[i].memberid == userid) {
//			return true;
//		}
//	}
//	return false;
//}


//function Participant(source) {
//	Initialize(this, source, metadata.participants);
//	this.lastname = this.name;
//}

//Participant.prototype.Toggle = State.prototype.Toggle;

//Participant.prototype.Enabled = function participantEnabled() {
//	return this.iseditable || this.isNew || state.tripeditable || userid == this.memberid;
//}

//Participant.prototype.CancelSomeoneElse = function participantCancelSomeoneElse() {
//	this.memberid = null;
//	this.nameui = "(Full)";
//	this.name = this.lastname;
//	state.Update();
//}

//Participant.prototype.UpdateName = function participantUpdateName() {
//	if (state.membersbyname[this.name]) {
//		this.memberid = state.membersbyname[this.name].id;
//		this.email = state.membersbyname[this.name].email;
//		this.phone = state.membersbyname[this.name].phone;
//		this.lastname = this.name;
//	} else if (state.nonmembers[this.name]) {
//		this.memberid = null;
//		this.email = state.nonmembers[this.name].email;
//		this.phone = state.nonmembers[this.name].phone;
//		this.lastname = this.name;
//	} else if (this.name == "(Someone else)") {
//		this.memberid = null;
//		this.nameui = "(Someone else)";
//		this.name = this.lastname;
//	} else {
//		this.memberid = null;
//	}
	
//	state.visibleparticipants = Math.max(this.line + 2, state.visibleparticipants);
//	state.Update();
//}

//Participant.prototype.Class = function participantClass(prop) {
//	var classname = (this.isRemoved ? "isRemoved" : "") + " " + (state.highlights[prop + this.line] || state.highlights[this.line] || "");

//	if (this.isNew) {
//		for (var p in metadata.participants) {
//			if (state.original.participants[this.line][p] != this[p]) {
//				return classname + " inserted";
//			}
//		}
//	}

//	return classname + (state.original.participants[this.line][prop] == this[prop] ? "": " updated");
//}

//function Change(source,verb) {
//	Initialize(this, source);
//	this.verb = verb || "Changed";
//	this.classname = "";
//}

//Change.prototype.Timestamp = function changeTimestamp() {
//	var date = new Date(this.timestamp + " UTC");
//	return dow[date.getDay()] + " " + date.getDate() + " " + moy[date.getMonth()] + " " + date.toISOString().substr(11,5);
//}

//Change.prototype.Name = function changeName(memberid) {
//	return state.membersbyid[memberid] ? state.membersbyid[memberid].name : "blank";
//}

//Change.prototype.Table = function changeTable() {
//	return this.table || (this.line == null ? "trips" : "participants");
//}


//Change.prototype.ColName= function changeColName() {
//	return metadata[this.Table()][this.column].Display;
//}

//Change.prototype.Description = function changeDescription() {
//	return	this.action == "email" 
//			? "Sent email Subject: " + this.subject:
//		this.line == null
//			? this.verb + " " + this.ColName() + " from '" + this.before + "' to '" + this.after + "'" :
//		this.column == "memberid" 
//			? this.verb + " line " + (parseInt(this.line)+1) + " Member from '" + 
//						this.Name(this.before || -1) + "' to '" + this.Name(this.after) + "'" :
//		metadata[this.Table()][this.column].Type == "tinyint(1)"
//			? this.verb + " line " + (parseInt(this.line)+1) + " " + this.ColName() + " from " + 
//						(this.before == true ? "yes" : "no") + " to " + (this.after == true ? "yes" : "no")
//			: this.verb + " line " + (parseInt(this.line)+1) + " " + this.ColName() + " from '" + 
//						this.before + "' to '" + this.after + "'";
//}

//Change.prototype.DetailToggle = function changeDetailToggle() {
//	var g,c;
//	var classnames = {highlight5:1, highlight4:1, highlight3:1, highlight2:1, highlight1:1};

//	this.classname = "";
//	this.showdetail = !this.showdetail;
	
//	if (this.showdetail) {
		
//		for (g in state.$scope.changes) {
//			delete classnames[state.$scope.changes[g][0].classname];
//		}
		
//		for (this.classname in classnames) {
//		}
//	}	
	
//	state.highlights = {};
//	for (g in state.$scope.changes) {
//		var group = state.$scope.changes[g][0];
//		if (group.classname != "")
//		{
//			for (c in state.$scope.changes[g]) {
//				var change = state.$scope.changes[g][c];
//				state.highlights[(change.action == "insert" ? "" : change.column) + 
//						 (change.line == null ? "" : change.line)] = group.classname;
//			}
//		}
//	}
//}

//app.controller("tripController", function($scope, $http, $timeout) {
//    	$scope.email = {action:"email", subject:"", body:""};
//    	$scope.state = state = new State();
//    	$scope.state.$http = $http;
//    	$scope.state.$scope = $scope;
//    	$scope.state.$timeout = $timeout;
//    	$scope.state.highlights = {};
//    	$scope.state.savestate = "Loading...";
//    	tripid = parseInt(/tripid=[0-9]+/.exec(window.location.search).toString().split("=")[1]);
//	$http.get("api.get.php?action=gettrip&tripid=" + tripid).success(function(response) {
//		if (ValidateResponse(response)) {
//			metadata = response.metadata;
//			userid = response.userid;
//			editid = response.editid;
//			state.savestate = "";
//		    	state.config = response.config;
//			state.trip = $scope.trip = new Trip(response);
//			state.EditRefresh();
//		}
//	});
//}).animation('.slide', AnimationSlide);
	
//window.onbeforeunload = function() {
//	if (state.SaveEnabled()) {
//		var changes = state.trip.Diffs(state.original).length;
//		return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
//	}
//}

//window.onunload = function() {
//	$.ajax({type: "GET", url: "api.get.php?action=editend&editid="+editid, async: false});
//};