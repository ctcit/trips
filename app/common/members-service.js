
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('membersService',
        ['$q', '$http', 'site', 
        function ($q, $http, site) {

            //---------------------------------

            var _membersById = {};
            var _membersByName = {};
            var _members = undefined;

            //---------------------------------

            function load() {
                return _members ? $q.when(_members) : $http.get(site.restUrl('members', 'get'))
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            var members = response.data.members;
                            _members = members;
                            _membersById = {};
                            _membersByName = {};
                            for (var i in members) {
                                _membersById[_members[i].id] = _members[i];
                                _membersByName[_members[i].name] = _members[i];
                            }
                        }
                        return members;
                    });
            }

            function getMembers() {
                return _members;
            }

            function getMember(id) {
                return _membersById[id];
            }

            function getMemberByName(name) {
                return _membersByName[name];
            }

            //---------------------------------

            return {
                load: load,

                getMembers: getMembers,
                getMember: getMember,
                getMemberByName: getMemberByName,
            }
        }]
    );

}());
