<html>
<head>
    <title>Show Trip</title>
    <link rel="stylesheet" type="text/css" href="trips.css">
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
</head>
<body>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular-animate.js"></script>
    <script type="text/javascript" src="trips.js"></script>
    <script type="text/javascript" src="ShowTrip.js"></script>
    <form ng-app="tripApp" ng-controller="tripController" name="tripForm" novalidate>
        <div class="container">
            <div class="noprint">
            	<div>
	                <button ng-click="state.AllTrips()">
	                    <img src="ctc.png" />All Trips
	                </button>
	                <button ng-disabled="!state.SaveEnabled()" ng-click="state.Save(false)">
	                    <img src="save.png" />Save
	                </button>
	                <button ng-disabled="state.Undo.length == 0" ng-click="state.UndoAction('Undo','Redo')" ng-attr-title="{{state.UndoTitle('Undo')}}">
	                    <img src="undo.png" />Undo
	                </button>
	                <button ng-disabled="state.Redo.length == 0" ng-click="state.UndoAction('Redo','Undo')" ng-attr-title="{{state.UndoTitle('Redo')}}">
	                    <img src="redo.png" />Redo
	                </button>
	                <img ng-show="state.savestate == 'Saving'" src="waiting.gif" />
	                <span ng-bind="state.savestate"></span>
	                <span ng-bind="state.DiffString()"></span>
	        </div>
                <div class="error" style="white-space: nowrap" ng-repeat="warning in state.warnings" ng-bind="warning">
                </div>
            </div>

            <h4 ng-click="state.showdetail = !state.showdetail">
                <button ng-class="state.showdetail ? 'open' : 'closed'"></button>
                {{trip.title}}
            </h4>
            <div class="slide" ng-show="state.showdetail">
                <table class="table table-condensed">
                    <tr>
                        <th><label for="title">Title</label></th>
                        <td>
                            <input type="text" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.title"
                                   ng-class="trip.Class('title')" id="title" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="date">Date</label></th>
                        <td>
                            <input type="date" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.date"
                                   ng-class="trip.Class('date')" id="date" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="length">Length</label></th>
                        <td>
                            <input type="text" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.length"
                                   ng-class="trip.Class('length')" id="length" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="closeDate">Close Date</label></th>
                        <td>
                            <input type="date" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.closeDate"
                                   ng-class="trip.Class('closeDate')" id="closeDate" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="departurePoint">Departure Point</label></th>
                        <td>
                            <input type="text" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.departurePoint"
                                   ng-class="trip.Class('departurePoint')" id="departurePoint" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="cost">Cost</label></th>
                        <td>
                            <input type="text" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.cost"
                                   ng-class="trip.Class('cost')" id="cost" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="grade">Grade</label></th>
                        <td>
                            <input type="text" ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.grade"
                                   ng-class="trip.Class('grade')" id="grade" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="status">Status</label></th>
                        <td>
                            <textarea ng-disabled="!state.tripeditable" ng-change="state.Update()" ng-model="trip.status"
                                      ng-class="trip.Class('status')" id="status"
                                      ng-attr-rows="{{trip.status.split('\n').length}}" ng-focus="state.TextareaFocus('status')"></textarea>
                        </td>
                    </tr>
                </table>
            </div>

            <h4 ng-click="state.showparticipants = !state.showparticipants" ng-class="state.showparticipants ? '' : 'noprint'">
                <button ng-class="state.showparticipants ? 'open' : 'closed'"></button>
                Participants
            </h4>
            <div class="slide" ng-show="state.showparticipants">
                <button ng-click="trip.SignMeUp();" ng-show="!trip.ImSignedUp() && trip.isOpen">Sign Me Up</button>
                <table class="table table-condensed">
                    <tr>
                        <th></th>
                        <th class="desktop-only">Removed</th>
                        <th>Name</th>
                        <th class="desktop-only">Leader</th>
                        <th class="desktop-only">Email</th>
                        <th class="desktop-only">Phone</th>
                        <th class="desktop-only">Can<br />take<br />car</th>
                        <th class="desktop-only">Car<br />rego</th>
                        <th>Status</th>
                    </tr>
                    <tbody ng-repeat="participant in trip.participants | limitTo: state.visibleparticipants">
                        <tr>
                            <th ng-class="participant.Class('memberid')" ng-click="participant.showdetail = !participant.showdetail">
                                <button ng-class="participant.showdetail ? 'open' : 'closed'" class="mobile-only"></button>
                                {{participant.line + 1}}
                            </th>
                            <td ng-class="participant.Class('isRemoved')" class="desktop-only">
                                <input ng-disabled="!participant.Enabled()" type="checkbox" ng-change="state.Update()" ng-model="participant.isRemoved" />
                            </td>
                            <td ng-class="participant.Class('name')">
                                <select ng-show="participant.nameui == '(Members)'"
                                        ng-change="participant.UpdateName()" ng-model="participant.name">
                                        <option></option>
                                        <option ng-repeat="member in trip.members">{{member}}</option>
                                </select>
                                <select ng-show="participant.nameui == '(Full)'"
                                        ng-change="participant.UpdateName()" ng-model="participant.name">
                                        <option></option>
                                        <optgroup label="Non Members">
                                        	<option ng-repeat="nonmember in nonmembers">{{nonmember.name}}</option>
                                        	<option>(Someone else)</option>
                                        </optgroup>
                                        <optgroup label="Members">
                                        	<option ng-repeat="member in members">{{member.name}}</option>
                                        </optgroup>
                                </select>
                                <input ng-show="participant.nameui == '(Readonly)'"
                                       ng-disabled="true"
                                       type="text" ng-model="participant.name" />
                                <input ng-show="participant.nameui == '(Someone else)'"
                                       type="text" ng-model="participant.name"
                                       ng-change="participant.UpdateName()" />
                                <button ng-show="participant.nameui == '(Someone else)'"
                                        type='input'
                                        ng-click="participant.CancelSomeoneElse()"
                                        title="Select a member">
                                    X
                                </button>
                            </td>
                            <td ng-class="participant.Class('isLeader')" class="desktop-only">
                                <input ng-disabled="!state.tripeditable" type="checkbox" ng-change="state.Update()" ng-model="participant.isLeader" />
                            </td>
                            <td ng-class="participant.Class('email')" class="desktop-only">
                                <input ng-disabled="!participant.Enabled()" type="email" ng-change="state.Update()" ng-model="participant.email" name="{{'email'+$index}}" />
                                <div ng-show="tripForm['email' + $index].$error.email">Invalid Email</div>
                            </td>
                            <td ng-class="participant.Class('phone')" class="desktop-only">
                                <input ng-disabled="!participant.Enabled()" type="text" ng-change="state.Update()" ng-model="participant.phone" />
                            </td>
                            <td ng-class="participant.Class('isVehicleProvider')" class="desktop-only">
                                <input ng-disabled="!participant.Enabled()" type="checkbox" ng-change="state.Update()" ng-model="participant.isVehicleProvider" />
                            </td>
                            <td ng-class="participant.Class('vehicleRego')" class="desktop-only">
                                <input ng-disabled="!participant.Enabled()" type="text" ng-change="state.Update()" ng-model="participant.vehicleRego"
                                       ng-show="participant.isVehicleProvider" />
                            </td>
                            <td ng-class="participant.Class('status')" class="desktop-only">
                                <textarea ng-disabled="!participant.Enabled()" type="text" ng-change="state.Update()" ng-model="participant.status" id="{{'status'+$index}}"
                                          ng-attr-rows="{{participant.status.split('\n').length}}" ng-focus="state.TextareaFocus('status'+$index)"></textarea>
                            </td>
                            <td ng-class="participant.Class('memberid')" class="mobile-only">
                                <img ng-show="participant.isLeader" src="leader.png" />
                                <span ng-show="participant.isVehicleProvider"><img src="car.png" />{{participant.vehicleRego}}</span>
                                <b ng-show="participant.status != ''">+</b>{{participant.status}}
                            </td>
                        </tr>
                        <tr class="mobile-only">
                            <td colspan="3" style="padding: 0; margin: 0; ">
                                <div class="slide" ng-show="participant.showdetail">
                                    <table>
                                        <tr>
                                            <th><label for="isRemoved{{$index}}">Removed</label></th>
                                            <td ng-class="participant.Class('isRemoved')">
                                                <input ng-disabled="!participant.Enabled()" type="checkbox" ng-change="state.Update()" ng-model="participant.isRemoved" id="isRemoved{{$index}}" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th><label for="isLeader{{$index}}">Leader</label></th>
                                            <td ng-class="participant.Class('leader')">
                                                <input ng-disabled="!state.tripeditable" type="checkbox" ng-change="state.Update()" ng-model="participant.isLeader" id="isLeader{{$index}}" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th><label for="email{{$index}}">Email</label></th>
                                            <td ng-class="participant.Class('email')">
                                                <input ng-disabled="!participant.Enabled()" type="email" ng-change="state.Update()" ng-model="participant.email" id="email{{$index}}"
                                                       name="Memail{{$index}}" />
                                                <div ng-show="tripForm['Memail' + $index].$error.email">Invalid Email</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th><label for="phone{{$index}}">Phone</label></th>
                                            <td ng-class="participant.Class('phone')">
                                                <input ng-disabled="!participant.Enabled()" type="text" ng-change="state.Update()" ng-model="participant.phone" id="phone{{$index}}" />
                                            </td>
                                        </tr>
		                        <tr>
		                            <th><label for="isVehicleProvider{{$index}}">Car</label></th>
		                            <td ng-class="participant.Class('isVehicleProvider')">
		                                <input ng-disabled="!participant.Enabled()" type="checkbox" ng-change="state.Update()" ng-model="participant.isVehicleProvider"
		                                       id="isVehicleProvider{{$index}}" />
		                            </td>
		                        </tr>
		                        <tr ng-show="participant.isVehicleProvider">
		                            <th><label for="vehicleRego{{$index}}">Rego</label></th>
		                            <td ng-class="participant.Class('vehicleRego')">
		                                <input ng-disabled="!participant.Enabled()" type="text" ng-change="state.Update()" ng-model="participant.vehicleRego"
		                                       id="isLeader{{$index}}" />
		                            </td>
		                        </tr>
		                        <tr>
		                            <th><label for="status{{$index}}">Status</label></th>
		                            <td ng-class="participant.Class('status')">
		                                <textarea ng-disabled="!participant.Enabled()" type="text" ng-change="state.Update()" ng-model="participant.status" id="status{{$index}}"
		                                          ng-attr-rows="{{participant.status.split('\n').length}}" ng-focus="state.TextareaFocus('status'+$index)"></textarea>
		                            </td>
		                        </tr>
                                  </table>
                                </div>
                            </td>
                        </tr>
                   </tbody>
                </table>
            </div>

            <h4 ng-class="state.showdescription ? '' : 'noprint'" ng-click="state.showdescription = !state.showdescription">
                <button ng-class="state.showdescription ? 'open' : 'closed'"></button>
                Description (from newsletter)
            </h4>
            <div class="slide" ng-show="state.showdescription">
                <table>
                    <tr><td ng-bind="trip.text" style="width: 400px;"></td></tr>
                </table>
            </div>

            <h4 class="noprint" ng-click="state.showtripemail = !state.showtripemail">
                <button ng-class="state.showtripemail? 'open' : 'closed'"></button>
                Trip Email
            </h4>
            <div class="noprint slide" ng-show="state.showtripemail">
                <table>
                    <tr>
                        <th>Subject</th>
                        <td><input type="text" ng-disabled="!state.tripeditable" ng-model="email.subject" name="emailsubject" required /></th>
                        <td><div ng-show="tripForm.emailsubject.$error.required">required</div></td>
                    </tr>
                    <tr>
                        <th>Body</th>
                        <td><textarea ng-disabled="!state.tripeditable" ng-model="email.body" name="emailbody" required></textarea></th>
                        <td>
                            <div ng-show="tripForm.emailbody.$error.required">required</div>
                            <button ng-disabled="!state.tripeditable || tripForm.emailsubject.$error.required || tripForm.emailbody.$error.required"
                                    ng-click="state.Save(true)">
                                <img src="send.png" />Send
                            </button>
                            <img ng-show="state.savestate == 'Sending'" src="waiting.gif" /><span ng-bind="state.savestate"></span>
                        </td>
                    </tr>
                </table>
            </div>

            <h4 class="noprint" ng-click="state.showhistory = !state.showhistory">
                <button ng-class="state.showhistory? 'open' : 'closed'"></button>
                Change History
            </h4>
            <div class="noprint slide" ng-show="state.showhistory">
                <table width="100%">
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                    <tbody ng-repeat="group in changes">
                        <tr>
                            <td ng-class="group[0].classname" style="white-space: nowrap" ng-click="group[0].DetailToggle()">
                                <button ng-class="group[0].showdetail ? 'open' : 'closed'"></button>
                                {{group[0].Timestamp()}}
                            </td>
                            <td ng-class="group[0].classname">{{group[0].Name(group[0].memberid)}}</td>
                            <td ng-class="group[0].classname">
                                <span ng-repeat="change in group | limitTo: 4">{{$index < 3 ? change.Description() : '...'}}</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3" ng-class="group[0].classname">
                                <div class="slide" ng-show="group[0].showdetail">
                                    <div ng-repeat="change in group">{{change.Description()}}<br />{{change.body}}</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </form>
</body>
</html>
<?php
	define( '_VALID_MOS', 1 );
	require_once( '/home1/ctcweb9/public_html/includes/alastair.php' );
	GetLogonDetails($con,$username,"redirect=trips/ShowTrip.php?tripid=$_GET[tripid]");
?>