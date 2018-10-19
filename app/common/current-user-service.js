
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('currentUserService',
        ['$q', '$http', 'site', 'membersService',
        function ($q, $http, site, membersService) {

            var _userId = undefined;

            //---------------------------------

            function load(force) {

                return _userId != undefined && !force ? $q.when(user()) : $http.get(site.restUrl('currentuser', 'get'))
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            _userId = response.data.userid;
                        }
                        return user();
                    });
            }

            function user() {
                return membersService.getMember(_userId);
            }

            //---------------------------------

            return {
                load: load,

                getUserId: function () { return _userId; },

                getUser: user,

            }
        }]
    );

}());
