(function () {
    'use strict';

    /* App Module */

    var tripSignupApp = angular.module('tripSignupApp', [
      'ngRoute',
      'ngResource',
      'ui.router',
      'ui.select',
      'ngAnimate',
      'ngDragToReorder'
    ]);
    
    tripSignupApp.config( [
        '$compileProvider',
        function($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):|data:image\//);
        }
    ]);

    
    //// Define global functions for the app
    
    //tripSignupApp.run(function ($rootScope, $sce) {
    //    $rootScope.range = function(start, stop) {
    //        // Equivalent to Python's range function
    //        var i = 0,
    //            n = start, // Assume stop not given
    //            list = [];
    //        if (stop) {
    //            i = start;
    //            n = stop;
    //        }
    //        for (; i < n; i++) {
    //            list.push(i);
    //        }
    //        return list;
    //    };
        
        
    //    $rootScope.pluralise = function(s, n) {
    //        // Return string s with an 's' added if n > 1
    //        return n > 1 ? s + 's' : s;
    //    };
        
    //    $rootScope.trusted = function(s) {
    //        return $sce.trustAsHtml(s);
    //    };
    //});
    
    tripSignupApp.filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });

    tripSignupApp.run(
        ["$rootScope", "$templateCache", "sessionStateService", 
            function ($rootScope, $templateCache, sessionStateService) {

            // This is meant to prevent caching of old view code, but doesn't
            // always work.
            $rootScope.$on('$viewContentLoaded', function() {
                $templateCache.removeAll();
            });

            $rootScope.$on('$stateChangeStart', function(evt, to, toParams, from, fromParams) {
                if (from.name == 'trip.showTrip' && sessionStateService.isDirty()) {
                    if (confirm(sessionStateService.isDirtyMessage() + " Do you want to exit?")) {
                        sessionStateService.isDirtyReset();
                    } else {
                        evt.preventDefault();
                    }
                }
            });
                
            // Function to check if we're in an iframe. true if we are.
            $rootScope.isInFrame = function () { 
                try {
                    //return false;//Testing
                    return window.self !== window.top;
                } catch (e) {
                    return true;
                }
            }            
        }]
    );
    
    // Add an event listener for changes in the state (i.e. route). Attempt
    // to update the main site URL in the top window if we're running in an
    // embedded iframe. 
    tripSignupApp.run(
        ['$rootScope', '$location', 'site',
         function ($rootScope, $location, site) {
            var goto, newLocation;
            $rootScope.$on('$stateChangeSuccess', function () {
                if ($rootScope.isInFrame && $rootScope.isInFrame()) {
                    goto = $location.url();
                    if (goto[0] === '/') {
                        goto = goto.substring(1);
                    }
                    goto = goto.replace('/', '%2F');
                    newLocation = site.currenttripsbaseurl + '?goto=' + goto;
                    //newLocation = '../index.php/current-trips?goto=' + goto;
                    window.top.history.pushState('string', '', newLocation);
                    console.log('New parent url: ' + newLocation);
                }
            })
         }]
    );

    tripSignupApp.run(function ($state) {
        $state.go('trip');
    });
   
}());
