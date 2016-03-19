// The controller for the current selected trip
(function () {
    "use strict";

    angular.module('tripApp').controller("showTripController",
        ['$scope', '$timeout', 'site', 'tripsService',
        function ($scope, $timeout, site, tripsService) {

    	    $scope.email = {action:"email", subject:"", body:""};
    	    $scope.state = state = new State();
    	    $scope.state.$scope = $scope;
    	    $scope.state.$timeout = $timeout;
    	    $scope.state.highlights = {};
    	    $scope.state.savestate = "Loading...";
    	    var tripId = 57; // todo - parseInt(/tripid=[0-9]+/.exec(window.location.search).toString().split("=")[1]);

    	
    	    tripsService.getTrip(tripId)
    	        .then(function(tripPlusOtherStuff) {
    	            metadata = tripPlusOtherStuff.metadata;
    	            userid = tripPlusOtherStuff.userid;
    	            editid = tripPlusOtherStuff.editid;
    	            state.savestate = "";
    	            state.config = tripPlusOtherStuff.config;
    	            state.trip = $scope.trip = tripPlusOtherStuff.trip;
    	            state.EditRefresh();
    	        });

        }]).animation('.slide', AnimationSlide);
	
}());


var state = null;
var tripid = 0;
var editid = 0;
var userid = 0;
var metadata;


// todo 

//window.onbeforeunload = function () {
//	if (state.SaveEnabled()) {
//		var changes = state.trip.Diffs(state.original).length;
//		return "You have made " + changes + " change" + (changes > 1 ? "s" : "") + " to this trip.";
//	}
//}

//window.onunload = function() {
//	$.ajax({type: "GET", url: "api.get.php?action=editend&editid="+editid, async: false});
//};

