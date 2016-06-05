(function () {
    'use strict';

    // Directive to navigate to new state 
    angular.module('tripSignupApp').directive('navToState', [function () {

        var controller = ['$scope', '$state',
            function ($scope, $state) {
                // get the url for the specified state via the $state service
                var paramsObj = $scope.$eval(this.params); // convert string to object
                var url = $state.href(this.name, paramsObj);
                url = url.replace('#/', ''); // trim leading part of url (I guess this is added again elsewhere?)
                this.url = encodeURIComponent(url);

                this.navigateToState = function (event) {
                    // This is the key -> preventing default navigation
                    event.preventDefault();

                    $state.go(this.name, paramsObj);
                };
            }];

        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {},
            bindToController: {
                name: '@',
                params: '@'
            },
            controller: controller,
            controllerAs: 'navToStateController',
            template:
                '<a ' +
                    'ng-href="../index.php/trip?goto={{navToStateController.url}}" ' +
                    'ng-click="navToStateController.navigateToState($event)" ' +
                    'ng-transclude>' +
                '</a>'
        };
    }]);

}());
