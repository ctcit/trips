(function () {
    'use strict';

    /* App Module */

    var tripApp = angular.module('tripApp', [
      'ngRoute',
      'ngResource',
      'ui.router',
      'ngAnimate'
    ]);
    
    tripApp.config( [
        '$compileProvider',
        function($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):|data:image\//);
        }
    ]);

    
    //// Define global functions for the app
    
    //tripApp.run(function ($rootScope, $sce) {
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
    
    tripApp.filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });

    // This is meant to prevent caching of old view code, but doesn't
    // always work.
    tripApp.run(function($rootScope, $templateCache) {
       $rootScope.$on('$viewContentLoaded', function() {
          $templateCache.removeAll();
       });
    });
    
    tripApp.run(function ($state) {
        $state.go('trip');
    });

}());
