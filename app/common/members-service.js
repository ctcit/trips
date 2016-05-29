
(function () {
    'use strict';

    angular.module('tripApp').factory('membersService',
        ['tripsService', 
        function (tripsService) {

            //---------------------------------

            var _membersById = {};
            var _membersByName = {};
            var _members = [];

            //---------------------------------

            function initMembers() {

                return tripsService.getMembers()
                    .then(function (members) {
                        _members = members;
                        _membersById = {};
                        _membersByName = {};
                        for (var i in members) {
                            _membersById[_members[i].id] = _members[i];
                            _membersByName[_members[i].name] = _members[i];
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
                initMembers: initMembers,

                getMembers: getMembers,
                getMember: getMember,
                getMemberByName: getMemberByName,
            }
        }]
    );

}());
