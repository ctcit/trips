
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('currentUserService',
        ['tripsService', 'membersService',
        function (tripsService, membersService) {

            var _userId = undefined;

            //---------------------------------

            function initCurrentUser() {

                return tripsService.getUserId()
                    .then(function (userId) {
                        _userId = userId;
                        return user();
                    });
            }

            function user() {
                return membersService.getMember(_userId);
            }

            //---------------------------------

            return {
                initCurrentUser: initCurrentUser,

                userId: function () { return _userId; },

                user: user

            }
        }]
    );

}());
