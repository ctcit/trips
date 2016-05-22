
(function () {
    'use strict';

    angular.module('tripApp').factory('currentUserService',
        ['tripsService', 'membersService',
        function (tripsService, membersService) {

            var _userId = 0;

            //---------------------------------

            function initCurrentUser() {

                return tripsService.getUserId()
                    .then(function (userId) {
                        _userId = userId;
                        return _userId;
                    });
            }

            //---------------------------------

            return {
                initCurrentUser: initCurrentUser,

                userId: function () { return _userId; },

                user: function () { return membersService.getMember(_userId); }

            }
        }]
    );

}());
