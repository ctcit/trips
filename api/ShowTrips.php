<!DOCTYPE html>
<html>
<head>
    <title>Show Trips</title>
</head>
<style>
</style>
<body>
    <link rel="stylesheet" type="text/css" href="trips.css">
    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular-animate.js"></script>
    <script type="text/javascript" src="trips.js"></script>
    <script type="text/javascript" src="ShowTrips.js"></script>
    <form ng-app="tripsApp" ng-controller="tripsController" name="tripsForm" novalidate>
        <div class="container">
            <div ng-repeat="group in groups">
                <h2 ng-click="group.showdetail = !group.showdetail">
                    <button ng-class="group.showdetail ? 'open' : 'closed'"></button>
                    {{group.name}}
                </h2>
                <span ng-bind="state.savestate" ng-show="group.isMyTrips"></span>
                <div class="slide" ng-show="group.showdetail">
                    <table class="table table-condensed">
                        <tr>
                            <th>Date</th>
                            <th>Length</th>
                            <th>Title</th>
                            <th class="desktop-only">Grade</th>
                            <th class="desktop-only">Leader</th>
                            <th class="desktop-only" ng-show="group.isMyTrips">My role</th>
                        </tr>
                        <tbody ng-repeat="trip in group.trips">
                            <tr>
                                <td ng-class-odd="'oddrow'" style="white-space: nowrap" ng-click="trip.showdetail = !trip.showdetail">
                                    <button ng-class="trip.showdetail ? 'open' : 'closed'" class="mobile-only"></button>
                                    {{trip.Date()}}
                                </td>
                                <td ng-click="trip.showdetail = !trip.showdetail" ng-class-odd="'oddrow'">{{trip.length}}</td>
                                <td ng-class-odd="'oddrow'"><a ng-href="ShowTrip.php?tripid={{trip.tripid}}">{{trip.title}}</a></td>
                                <td class="desktop-only" ng-class-odd="'oddrow'">{{trip.grade}}</td>
                                <td class="desktop-only" ng-class-odd="'oddrow'">{{trip.leader}}</td>
                                <td class="desktop-only" ng-class-odd="'oddrow'" ng-show="group.isMyTrips">{{trip.role}}</td>
                            </tr>
                            <tr class="mobile-only">
                                <td colspan="3" style="padding: 0 0 0 15px; margin: 0; ">
                                    <div class="slide" ng-show="trip.showdetail">
                                        <b>Grade: </b>{{trip.grade}}<br />
                                        <b>Leader: </b>{{trip.leader}}<br />
                                        <span ng-show="group.mytrips"><b>My Role: </b>{{trip.role}}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </form>
</body>
</html>
<?php
	define( '_VALID_MOS', 1 );
	require_once( '/home1/ctcweb9/public_html/includes/alastair.php' );
	GetLogonDetails($con,$username,"redirect=trips");
?>