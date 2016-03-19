//"use strict";

//var app = angular.module("tripsApp", ['ngAnimate']);
//var state = {};
//var metadata;

//function Group(source) {
//	this.name = source.name;
//	this.showdetail = this.isMyTrips = source.isMyTrips;
//	this.trips = [];
	
//	for (var i in source.trips) {
//		this.trips.push(new Trip(source.trips[i]));
//	}
//}
		
//function Trip(source) {
//	Initialize(this, source, metadata["trips"]);
//}

//Trip.prototype.Date = function tripDate() {
//	return dow[this.date.getDay()] + " " + this.date.getDate() + " " + moy[this.date.getMonth()];
//}

//function Trips(source) {
//	return source;
//}

//app.controller("tripsController", function($scope, $http, $timeout) {
//    	state.$http = $http;
//    	state.$scope = $scope;
//    	state.$timeout = $timeout;
//    	state.$scope.state = state;
//	$http.get("api.get.php?action=gettrips").success(function(response) {
//		if (ValidateResponse(response)) {
//			metadata = response.metadata;
//			state.$scope.groups = [];
//			for (var i in response.groups) {
//				state.$scope.groups.push(new Group(response.groups[i]));
//			}
//			state.$scope.groups[1].showdetail = state.$scope.groups[0].trips.length == 0;
//		}
//	});
//}).animation('.slide', AnimationSlide);