'use strict';
 
describe('showTripController: ', function () {
    var $scope;
    var createController;
    var $httpBackend;
    var site;

    var TRIPID = 69;

    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('tripSignupApp'));

    //mock the controller for the same reason and include $rootScope and $controller
    beforeEach(angular.mock.inject(function ($rootScope, $controller, _$httpBackend_, _site_) {
        //create an empty scope
        $scope = $rootScope.$new();

        createController = function () {
            return $controller('showTripController', { $scope: $scope, $stateParams: { tripId: TRIPID } });
        };

        $httpBackend = _$httpBackend_;
        site = _site_;
        site.set('www.ctc.org.nz/tripsignup', 'api');
    }));


    var controller;

    beforeEach(function () {
        $httpBackend
            .whenGET(/app\/.*\.html/).respond(200, ''); // workaround for unexpected requests of views

        $httpBackend
            .when('GET', site.restUrl('config', 'get'))
            .respond(getMockGetConfigResponse());
        $httpBackend
            .when('GET', site.restUrl('metadata', 'get'))
            .respond(getMockGetMetadataResponse());
        $httpBackend
            .when('GET', site.restUrl('members', 'get'))
            .respond(getMockGetMembersResponse());
        $httpBackend
            .when('GET', site.restUrl('currentuser', 'get'))
            .respond(getMockGetCurrentUserResponse());
        $httpBackend
            .when('GET', site.restUrl('trip', 'get') + "?tripid=" + TRIPID /* "&editid=" */)
            .respond(getMockGetTripResponse());
        $httpBackend
            .when('GET', site.restUrl('tripchanges', 'get') + "?tripid=" + TRIPID)
            .respond(getMockGetTripChangesResponse());
        $httpBackend
            .when('GET', site.restUrl('nonmembers', 'get'))
            .respond(getMockGetNonmembersResponse());

        controller = createController();
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });



    //----------------------------------------------


    // tests start here
    it('should return the trip and all related details', function () {
        //--------------------------
        // trip
        expect(controller.trip).toBeDefined();
        expect(controller.tripeditable).toEqual(true);

        // trip.tripDetail
        expect(controller.trip.tripDetail).toBeDefined();
        expect(controller.trip.tripDetail.tripid).toEqual(TRIPID.toString());
        expect(controller.trip.tripDetail.cost).toEqual("$40");

        // trip.nonmembers
        expect(controller.trip.nonmembers).toBeDefined();
        expect(controller.trip.nonmembers.length).toEqual(1);
        var nonmember0 = controller.trip.nonmembers[0];
        expect(nonmember0.name).toEqual("ABC");

        // trip.participants
        expect(controller.trip.participants).toBeDefined();
        expect(controller.trip.participants.length).toEqual(13);
        var participant0 = controller.trip.participants[0];
        expect(participant0.name).toEqual("J H");
        expect(participant0.isLeader).toEqual(true);

        // trip.email
        expect(controller.trip.tripEmail).toBeDefined();
        expect(controller.trip.tripEmail.subject).toEqual("RE: Mid winter dance party on Lewis tops! trip on Sat 18 Jun 2016");

        //--------------------------
        // editSession
        expect(controller.editSession).toBeDefined();
        expect(controller.editSession.editId).toEqual(1470);

        // editSession.changes
        expect(controller.editSession.changes).toBeDefined();
        expect(controller.editSession.changes.length).toEqual(32);
        var change0 = controller.editSession.changes[0];
        expect(change0[0].action).toEqual("updatepart");


    });


    //----------------------------------------------

    function getMockGetConfigResponse() {
        return {
            "config": {
                "EditorRoles": "'Webmaster','Overnight Trip Organiser','Day Trip Organiser','Club Captain'",
                "EmailFilter": "\/^editor@yahoo\\.com\\.au$\/",
                "BaseUrl": "http:\/\/www.ctc.org.nz\/trips",
                "ShowDebugUpdate": false,
                "AdditionalLines": 5,
                "EditRefreshInSec": 30
            }
        };
    }

    function getMockGetCurrentUserResponse() {
        return {
            "userid": 520
        };
    }

    function getMockGetMetadataResponse() {
        return {
            "metadata": {
                "trips": {
                    "id": {
                        "Field": "id",
                        "Type": "int(11)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "PRI",
                        "Default": null,
                        "Extra": "auto_increment",
                        "Privileges": "select,insert,update,references",
                        "Comment": "READONLY",
                        "IsReadOnly": true,
                        "Display": ""
                    },
                    "eventid": {
                        "Field": "eventid",
                        "Type": "int(11)",
                        "Collation": null,
                        "Null": "YES",
                        "Key": "UNI",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "READONLY",
                        "IsReadOnly": true,
                        "Display": ""
                    },
                    "title": {
                        "Field": "title",
                        "Type": "varchar(120)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Title -- if null use the value from from ctcweb9_newsletter.event table",
                        "IsReadOnly": false,
                        "Display": "Title"
                    },
                    "date": {
                        "Field": "date",
                        "Type": "date",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Date",
                        "IsReadOnly": false,
                        "Display": "Date"
                    },
                    "length": {
                        "Field": "length",
                        "Type": "varchar(50)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Length",
                        "IsReadOnly": false,
                        "Display": "Length"
                    },
                    "departurePoint": {
                        "Field": "departurePoint",
                        "Type": "varchar(255)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Departure Point -- if null use the value from from ctcweb9_newsletter.event table",
                        "IsReadOnly": false,
                        "Display": "Departure Point"
                    },
                    "grade": {
                        "Field": "grade",
                        "Type": "varchar(50)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Grade -- if null use the value from from ctcweb9_newsletter.event table",
                        "IsReadOnly": false,
                        "Display": "Grade"
                    },
                    "cost": {
                        "Field": "cost",
                        "Type": "varchar(50)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Cost -- if null use the value from from ctcweb9_newsletter.event table",
                        "IsReadOnly": false,
                        "Display": "Cost"
                    },
                    "closeDate": {
                        "Field": "closeDate",
                        "Type": "date",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Close Date",
                        "IsReadOnly": false,
                        "Display": "Close Date"
                    },
                    "status": {
                        "Field": "status",
                        "Type": "text",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Status -- status text, normally updated by the leader to communicate to participants",
                        "IsReadOnly": false,
                        "Display": "Status"
                    },
                    "isOpen": {
                        "IsReadOnly": true,
                        "Type": "tinyint(1)"
                    }
                },
                "participants": {
                    "id": {
                        "Field": "id",
                        "Type": "int(11)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "PRI",
                        "Default": null,
                        "Extra": "auto_increment",
                        "Privileges": "select,insert,update,references",
                        "Comment": "READONLY",
                        "IsReadOnly": true,
                        "Display": ""
                    },
                    "tripid": {
                        "Field": "tripid",
                        "Type": "int(11)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "MUL",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "READONLY",
                        "IsReadOnly": true,
                        "Display": ""
                    },
                    "line": {
                        "Field": "line",
                        "Type": "int(11)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "",
                        "Default": "0",
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "READONLY",
                        "IsReadOnly": true,
                        "Display": ""
                    },
                    "isRemoved": {
                        "Field": "isRemoved",
                        "Type": "tinyint(1)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "",
                        "Default": "0",
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Removed",
                        "IsReadOnly": false,
                        "Display": "Removed"
                    },
                    "memberid": {
                        "Field": "memberid",
                        "Type": "int(11)",
                        "Collation": null,
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "",
                        "IsReadOnly": false,
                        "Display": ""
                    },
                    "isLeader": {
                        "Field": "isLeader",
                        "Type": "tinyint(1)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Leader",
                        "IsReadOnly": false,
                        "Display": "Leader"
                    },
                    "name": {
                        "Field": "name",
                        "Type": "varchar(50)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Name -- if null use value from ctcweb9_ctc.members",
                        "IsReadOnly": false,
                        "Display": "Name"
                    },
                    "email": {
                        "Field": "email",
                        "Type": "varchar(255)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Email -- if null use the primaryEmail value from from ctcweb9_ctc.members table",
                        "IsReadOnly": false,
                        "Display": "Email"
                    },
                    "phone": {
                        "Field": "phone",
                        "Type": "varchar(20)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Phone -- if null use the homePhone from from ctcweb9_ctc.memberships table",
                        "IsReadOnly": false,
                        "Display": "Phone"
                    },
                    "isVehicleProvider": {
                        "Field": "isVehicleProvider",
                        "Type": "tinyint(1)",
                        "Collation": null,
                        "Null": "NO",
                        "Key": "",
                        "Default": "0",
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Car?",
                        "IsReadOnly": false,
                        "Display": "Car?"
                    },
                    "vehicleRego": {
                        "Field": "vehicleRego",
                        "Type": "varchar(10)",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Rego",
                        "IsReadOnly": false,
                        "Display": "Rego"
                    },
                    "status": {
                        "Field": "status",
                        "Type": "text",
                        "Collation": "latin1_swedish_ci",
                        "Null": "YES",
                        "Key": "",
                        "Default": null,
                        "Extra": "",
                        "Privileges": "select,insert,update,references",
                        "Comment": "Status",
                        "IsReadOnly": false,
                        "Display": "Status"
                    }
                }
            }
        };
    }

    function getMockGetTripChangesResponse() {
        return {
            "changes": [[{
                "id": "49",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-05 08:34:47",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "48",
                "line": "7",
                "memberid": "520",
                "timestamp": "2016-06-05 08:33:52",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "47",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-06-04 20:04:33",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "46",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-06-04 20:03:58",
                "action": "updatepart",
                "column": "vehicleRego",
                "before": "",
                "after": "BBB132",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "45",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-06-04 20:03:58",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "44",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-06-04 20:03:58",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "43",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-06-04 19:59:26",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "42",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-04 18:35:38",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "41",
                "line": "6",
                "memberid": "520",
                "timestamp": "2016-06-04 18:29:33",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "40",
                "line": "5",
                "memberid": "520",
                "timestamp": "2016-06-04 18:28:00",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: A B (ab@yahoo.com.au)"
            }],
            [{
                "id": "39",
                "line": "2",
                "memberid": "125",
                "timestamp": "2016-06-04 10:14:45",
                "action": "updatepart",
                "column": "status",
                "before": "",
                "after": "This better be a good trip or I'm NEVER coming again!",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "38",
                "line": "7",
                "memberid": "520",
                "timestamp": "2016-06-04 07:55:18",
                "action": "insertpart",
                "column": "memberid",
                "before": "",
                "after": "2129",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: A B (ab@gmail.com FILTERED)"
            }],
            [{
                "id": "37",
                "line": "6",
                "memberid": "520",
                "timestamp": "2016-06-04 07:54:59",
                "action": "insertpart",
                "column": "memberid",
                "before": "",
                "after": "2194",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: A E (ae@gmail.com FILTERED)"
            }],
            [{
                "id": "36",
                "line": "5",
                "memberid": "520",
                "timestamp": "2016-06-04 07:53:40",
                "action": "insertpart",
                "column": "memberid",
                "before": null,
                "after": "790",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "35",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 07:53:40",
                "action": "updatepart",
                "column": "phone",
                "before": "123 456",
                "after": "123 456789",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "34",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 07:53:40",
                "action": "updatepart",
                "column": "email",
                "before": "abc@xyzzzz.com",
                "after": "abc@xyzzeeeezz.com",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: A R (ar@gmail.com FILTERED)"
            }],
            [{
                "id": "33",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 07:53:01",
                "action": "updatepart",
                "column": "phone",
                "before": "123 456",
                "after": "123 456789",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "32",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 07:53:01",
                "action": "updatepart",
                "column": "email",
                "before": "abc@xyzzzz.com",
                "after": "abc@xyzzeeeezz.com",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "31",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 07:52:41",
                "action": "updatepart",
                "column": "email",
                "before": "abc@xyzzzz.com",
                "after": "abc@xyzzeeeezz.com",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "30",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 07:18:23",
                "action": "updatepart",
                "column": "email",
                "before": "abc@xyz.com",
                "after": "abc@xyzzzz.com",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "29",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-04 07:18:23",
                "action": "updatepart",
                "column": "vehicleRego",
                "before": "",
                "after": "sss",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "28",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-04 07:18:23",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "27",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-04 07:17:49",
                "action": "updatepart",
                "column": "vehicleRego",
                "before": "",
                "after": "sss",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "26",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-04 07:17:49",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "25",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 05:33:32",
                "action": "updatepart",
                "column": "vehicleRego",
                "before": "www",
                "after": "wwwddd",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "24",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 04:48:45",
                "action": "updatepart",
                "column": "vehicleRego",
                "before": "",
                "after": "www",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "23",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 04:48:45",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "22",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 04:46:01",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "21",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 04:45:05",
                "action": "updatepart",
                "column": "phone",
                "before": "",
                "after": "123 456",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "20",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-04 04:45:05",
                "action": "updatepart",
                "column": "email",
                "before": "",
                "after": "abc@xyz.com",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "19",
                "line": "4",
                "memberid": "520",
                "timestamp": "2016-06-03 23:15:16",
                "action": "insertpart",
                "column": "name",
                "before": null,
                "after": "ABC",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "18",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 23:13:01",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "17",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 23:11:58",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "16",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 23:10:21",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "15",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 23:10:21",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "14",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 23:03:43",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "13",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 23:03:43",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "12",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 23:01:52",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "11",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 23:01:52",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "10",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 22:55:20",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "9",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 22:55:20",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "8",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 22:54:52",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "7",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 22:54:52",
                "action": "updatepart",
                "column": "isVehicleProvider",
                "before": "1",
                "after": "0",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "6",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 22:11:11",
                "action": "insertpart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "5",
                "line": "3",
                "memberid": "520",
                "timestamp": "2016-06-03 22:11:11",
                "action": "insertpart",
                "column": "memberid",
                "before": null,
                "after": "260",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: A D (ad@gmail.com FILTERED)"
            }],
            [{
                "id": "4",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 22:09:38",
                "action": "insertpart",
                "column": "isVehicleProvider",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": null
            },
            {
                "id": "3",
                "line": "2",
                "memberid": "520",
                "timestamp": "2016-06-03 22:09:38",
                "action": "insertpart",
                "column": "memberid",
                "before": null,
                "after": "125",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: A B (ab@yahoo.com.au)"
            }],
            [{
                "id": "2",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-05-14 22:17:38",
                "action": "updatepart",
                "column": "isRemoved",
                "before": "0",
                "after": "1",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: "
            }],
            [{
                "id": "1",
                "line": "1",
                "memberid": "520",
                "timestamp": "2016-05-14 22:17:16",
                "action": "insertpart",
                "column": "memberid",
                "before": "",
                "after": "520",
                "subject": null,
                "body": null,
                "emailAudit": "Email recipients: J H (jh@gmail.com FILTERED)"
            }]]
        };
    }

    function getMockGetTripResponse() {
        return {
            "trip": {
                "tripid": "69",
                "eventid": "2714",
                "date": "2016-06-18",
                "closeDate": "2016-06-18",
                "isOpen": "1",
                "length": "W\/E",
                "departurePoint": "",
                "grade": "Easy or EasyMod",
                "cost": "$40",
                "title": "Mid winter dance party on Lewis tops!",
                "status": "",
                "text": "What better way is there to keep warm in the middle of winter other than dancing while enjoying the magnificent views of the Lewis pass tops in winter???\r\n\r\nThe weekend of 18-19 June is closest to the winter solstice and also corresponds with a full moon (well almost anyway).\r\n\r\nDeparting Christchurch at the respectable hour of 9am on Saturday morning and with cafe stop en-route. We will drive to the Lewis pass summit (upper St James carpark) from there walk up to the Lewis pass tops. We will walk along the broad ridge towards Mt Technical and The Apprentice (approx 2-3 hours).  Nestled in the upper Deer Valley I have spied a broad valley (several actually) with plenty of flat land for tents and stunning views of said nearby peaks, I have also checked the direction of the rising sun to ensure early warming for those who place tents wisely.\r\n\r\nThis will be a mid winter alpine experience so you will need to have suitable gear for the climate. You will need winter tent, sleeping mat with good R value and a sleeping bag suitable for winter conditions as well as warm clothing.  You will need ice axe and crampons and know how to use them too - while the tops are quite flat there is some steep portions on the walk in and we are hoping for snow (fingers crossed). And don't forget your dancing shoes, silly Hat and Tie!\r\n\r\nPS I am serious about this being a dancing party trip.  As soon as our dinner has settled we will put on out silly hats and ties (shoes optional) and dance until the batteries are flat (either ours of those in the portable Bluetooth speakers).  If you wake up cold - then dance some more... There is heaps of space to dance in the snow with low risk so there are no excuses.  There is also space for low angle snow play - think impromptu tobogganing with pack liner\u2026\r\n\r\nLastly.... Dance moves that go on trip, stay on trip! \r\n\r\n"
            },
            "participants": [{
                "line": "0",
                "isRemoved": "0",
                "memberid": "2050",
                "isLeader": "1",
                "name": "J H",
                "email": "jh@gmail.com",
                "phone": "022 033 3333",
                "isVehicleProvider": "0",
                "vehicleRego": "",
                "status": ""
            },
            {
                "line": "1",
                "isRemoved": "0",
                "memberid": "520",
                "isLeader": "0",
                "name": "B J",
                "email": "bj@gmail.com",
                "phone": "3334555",
                "isVehicleProvider": "0",
                "vehicleRego": "BBB132",
                "status": ""
            },
            {
                "line": "2",
                "isRemoved": "0",
                "memberid": "125",
                "isLeader": "0",
                "name": "A B",
                "email": "ab@yahoo.com.au",
                "phone": "444-4444",
                "isVehicleProvider": "0",
                "vehicleRego": "",
                "status": "This better be a good trip or I'm NEVER coming again!"
            },
            {
                "line": "3",
                "isRemoved": "1",
                "memberid": "260",
                "isLeader": "0",
                "name": "A D",
                "email": "ad@gmail.com",
                "phone": "4432111",
                "isVehicleProvider": "1",
                "vehicleRego": "sss",
                "status": ""
            },
            {
                "line": "4",
                "isRemoved": "1",
                "memberid": null,
                "isLeader": "0",
                "name": "ABC",
                "email": "abc@xyzzeeeezz.com",
                "phone": "123 456789",
                "isVehicleProvider": "1",
                "vehicleRego": "wwwddd",
                "status": ""
            },
            {
                "line": "5",
                "isRemoved": "1",
                "memberid": "790",
                "isLeader": "0",
                "name": "A R",
                "email": "ar@gmail.com",
                "phone": "384-6425",
                "isVehicleProvider": "0",
                "vehicleRego": "",
                "status": ""
            },
            {
                "line": "6",
                "isRemoved": "1",
                "memberid": "2194",
                "isLeader": "0",
                "name": "A E",
                "email": "ae@gmail.com",
                "phone": "03 222 2222",
                "isVehicleProvider": "0",
                "vehicleRego": "",
                "status": ""
            },
            {
                "line": "7",
                "isRemoved": "1",
                "memberid": "2129",
                "isLeader": "0",
                "name": "A B",
                "email": "ab@gmail.com",
                "phone": "020 456 7811",
                "isVehicleProvider": "0",
                "vehicleRego": "",
                "status": ""
            }],
            "editid": 1470
        };
    }

    function getMockGetMembersResponse() {
        return {
            "members": [{
                "id": "2129",
                "name": "A B",
                "email": "ab@gmail.com",
                "phone": "020 456 7811",
                "role": null
            },
            {
                "id": "790",
                "name": "A R",
                "email": "ar@gmail.com",
                "phone": "384-6425",
                "role": "Club Captain"
            },
            {
                "id": "125",
                "name": "A B",
                "email": "ab@yahoo.com.au",
                "phone": "444-4444",
                "role": "Webmaster"
            },
            {
                "id": "2049",
                "name": "A S",
                "email": "as@xtra.co.nz",
                "phone": "03 3510711",
                "role": null
            },
            {
                "id": "260",
                "name": "A D",
                "email": "ad@gmail.com",
                "phone": "4432111",
                "role": null
            },
            {
                "id": "1967",
                "name": "A Z",
                "email": "az@gmail.com",
                "phone": "333 5556",
                "role": null
            },
            {
                "id": "2194",
                "name": "A E",
                "email": "ae@gmail.com",
                "phone": "03 222 2222",
                "role": null
            },
            {
                "id": "2058",
                "name": "AP",
                "email": "ap@gmail.com",
                "phone": "03 111 2222",
                "role": null
            },
            {
                "id": "520",
                "name": "B J",
                "email": "bj@gmail.com",
                "phone": "3334555",
                "role": "Webmaster"
            },
            {
                "id": "2050",
                "name": "J H",
                "email": "jh@gmail.com",
                "phone": "022 033 3333",
                "role": null
            }]
        };
    }

    function getMockGetNonmembersResponse() {
        return {
            "nonmembers": {
                "ABC": {
                    "name": "ABC",
                    "email": "abc@xyzzeeeezz.com",
                    "phone": "123 456789"
                }
            }
        };
    }


});