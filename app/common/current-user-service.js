(function () {
    'use strict';

    angular.module('tripApp').factory('currentUserService', ['$http', 'site',
        function ($http, site) {

            // Obtain the currently-logged in user (i.e., the user who
            // has authenticated on the main CTC website on the same machine as
            // the one on which this code is running).

            var currentUser = null;

            return {
                currentUser: function () { return currentUser; },
                isLoggedIn: function () { return currentUser != null; },
                hasRoles: function() { return currentUser && currentUser.roles && currentUser.roles.length > 0; },

                load: function () {
                    return $http.get(site.url + '/db/index.php/rest/user')
                        .success(function (user) {
                            currentUser = user;
                            console.log('currentUser.id = ' + currentUser.id);
                            return currentUser;
                        })
                       .error(function (fail) {
                           currentUser = null;
                           alert("Couldn't fetch user info (" + fail.status + "). A network problem?");
                           return currentUser;
                       })
                }
            }
        }
    ]);

}());
