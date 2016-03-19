(function () {
    'use strict';

    // State provider
    angular.module('tripApp').config(['$stateProvider', '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider) {

          $urlRouterProvider
              .when('/trip', '/trip/showalltrips')
              .otherwise('/trip/showalltrips');


          $stateProvider
            .state('trip', {
                views: {
                    'app-content': {
                        templateUrl: 'app/app.html'
                    }
                },
                resolve: {
                    currentUser: ['currentUserService',
                        function (currentUserService) {
                            return currentUserService.load();
                        }
                    ]
                }
            })
            .state('trip.showTrip', {
                url: '/trip/showtrip/:tripId',
                views: {
                    'main-content': {
                        templateUrl: 'app/show-trip/show-trip.html',
                        controller: 'showTripController'
                    }
                }
            })
            .state('trip.showAllTrips', {
                url: '/trip/showalltrips',
                views: {
                    'main-content': {
                        templateUrl: 'app/show-all-trips/show-all-trips.html',
                        controller: 'showAllTripsController'
                    }
                }
            })
      }]);

}());


