'use strict';
 
describe('showAllTripsController: ', function () {
    var $scope;
    var createController;
    var $httpBackend;
    var site;
    var currentUserService;

    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('tripSignupApp'));

    //mock the controller for the same reason and include $rootScope and $controller
    beforeEach(angular.mock.inject(function ($rootScope, $controller, _$httpBackend_, _site_, _currentUserService_) {
        //create an empty scope
        $scope = $rootScope.$new();

        createController = function () {
            return $controller('showAllTripsController', { $scope: $scope });
        };

        $httpBackend = _$httpBackend_;
        site = _site_;
        site.set('www.ctc.org.nz/tripsignup', 'api');

        currentUserService = _currentUserService_;
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
            .when('GET', site.restUrl('trips', 'get'))
            .respond(getMockGetTripsResponse());

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });



    //----------------------------------------------


    // tests start here
    it('should return the groups of all trips', function () {
        $httpBackend
            .when('GET', site.restUrl('currentuser', 'get'))
            .respond(getMockGetCurrentUserResponse(520)); // Webmaster
        controller = createController();
        $httpBackend.flush();

        expect(controller.groups).toBeDefined();
        expect(controller.groups.length).toEqual(3);

        var group0 = controller.groups[0];
        expect(group0.name).toEqual("My Trips");
        expect(group0.showdetail).toEqual(true); // isMyTrip
        expect(group0.trips).toBeDefined();
        expect(group0.trips.length).toEqual(0);

        var group1 = controller.groups[1];
        expect(group1.name).toEqual("Open Trips");
        expect(group1.showdetail).toEqual(true); // no trips in My Trips
        expect(group1.trips).toBeDefined();
        expect(group1.trips.length).toEqual(4);

        var group2 = controller.groups[2];
        expect(group2.name).toEqual("Closed Trips");
        expect(group2.showdetail).toBeUndefined()
        expect(group2.trips).toBeDefined();
        expect(group2.trips.length).toEqual(2);

    });

    it('should allow new trips for Webmaster', function () {
        $httpBackend
            .when('GET', site.restUrl('currentuser', 'get'))
            .respond(getMockGetCurrentUserResponse(520)); // Webmaster
        currentUserService.load(true);
        controller = createController();
        $httpBackend.flush();

        expect(controller.allowNewTrips()).toEqual(true);
    });

    it('should NOT allow new trips for Non-Webmaster', function () {
        $httpBackend
            .when('GET', site.restUrl('currentuser', 'get'))
            .respond(getMockGetCurrentUserResponse(260)); // Non-Webmaster
        currentUserService.load(true);
        controller = createController();
        $httpBackend.flush();

        expect(controller.allowNewTrips()).toEqual(false);
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

    function getMockGetCurrentUserResponse(currentUserId) {
        return {
            "userid": currentUserId
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

    function getMockGetTripsResponse() {
        return {
            "groups": [
              {
                  "name": "My Trips",
                  "isMyTrips": true
              },
              {
                  "name": "Open Trips",
                  "trips": [
                    {
                        "tripid": "56",
                        "eventid": "2722",
                        "date": "2016-03-20",
                        "closeDate": "2016-03-20",
                        "isOpen": "1",
                        "length": "Day",
                        "departurePoint": "Z (Shell) Papanui",
                        "grade": "Easy",
                        "cost": "$20",
                        "title": "Coastal Exploring - Banks Peninsula",
                        "status": "",
                        "text": "Starting from Magnet Bay we follow the coastline exploring Murays Mistake, Jachin Island finishing at Boaz above Tumbledown Bay. More information about these places on tramp. No formal track except what the animals have made for us. Grazed coastal hills with great coastal views of cliffs and we don't often visit. Time 4-5hrs  Height: 100m",
                        "leader": "B C"
                    },
                    {
                        "tripid": "57",
                        "eventid": "2662",
                        "date": "2016-03-20",
                        "closeDate": "2016-03-20",
                        "isOpen": "1",
                        "length": "Day",
                        "departurePoint": "Z (Shell) Papanui",
                        "grade": "Easy",
                        "cost": "$25",
                        "title": "Hawdon Hut",
                        "status": "",
                        "text": "This has been re-scheduled from December. This trip will start at the Hawdon Shelter in Arthurs Pass National Park. Cross the Hawdon River and pick up the rough trail on the edge of the river terraces, following the Hawdon River upstream through delightful glades and open river flats. The track stays near the river bed all the way so the total height gain is about 80m. Look forward to lunch at the spacious Hawdon Hut next to the river with great views and return the same way. There will be lots of minor river crossings so expect wet feet. If there has been some recent rain it can be a little more challenging at the first crossing which is also the biggest. ",
                        "leader": "M L"
                    },
                    {
                        "tripid": "58",
                        "eventid": "2681",
                        "date": "2016-03-25",
                        "closeDate": "2016-03-25",
                        "isOpen": "1",
                        "length": "3+",
                        "departurePoint": "Contact Leader",
                        "grade": "Moderate",
                        "cost": "$35",
                        "title": "Lake Minchin - Good Friday and Easter Monday Holiday",
                        "status": "",
                        "text": "Leave on Friday morning and walk in to Townsend Hut up the Taramakau. The next day we head over the tops to camp at Lake Minchin. That gives us two days and a chance to explore before wombling down the Poulter and Andrew's stream and out. Trip numbers limited due to transport logistics.\r\n",
                        "leader": "A T"
                    },
                    {
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
                        "text": "What better way is there to keep warm in the middle of winter other than dancing while enjoying the magnificent views of the Lewis pass tops in winter???\r\n\r\nThe weekend of 18-19 June is closest to the winter solstice and also corresponds with a full moon (well almost anyway).\r\n\r\nDeparting Christchurch at the respectable hour of 9am on Saturday morning and with cafe stop en-route. We will drive to the Lewis pass summit (upper St James carpark) from there walk up to the Lewis pass tops. We will walk along the broad ridge towards Mt Technical and The Apprentice (Approx 2-3 hours).  Nestled in the upper Deer Valley I have spied a broad valley (several actually) with plenty of flat land for tents and stunning views of said nearby peaks, I have also checked the direction of the rising sun to ensure early warming for those who place tents wisely.\r\n\r\nThis will be a mid winter alpine experience so you will need to have suitable gear for the climate. You will need winter tent, sleeping mat with good R value and a sleeping bag suitable for winter conditions as well as warm clothing.  You will need ice axe and crampons and know how to use them too - while the tops are quite flat there is some steep portions on the walk in and we are hoping for snow (fingers crossed). And don't forget your dancing shoes, silly Hat and Tie!\r\n\r\nPS I am serious about this being a dancing party trip.  As soon as our dinner has settled we will put on out silly hats and ties (shoes optional) and dance until the batteries are flat (either ours of those in the portable Bluetooth speakers).  If you wake up cold - then dance some more... There is heaps of space to dance in the snow with low risk so there are no excuses.  There is also space for low angle snow play - think impromptu tobogganing with pack liner\u2026\r\n\r\nLastly.... Dance moves that go on trip, stay on trip! \r\n\r\n",
                        "leader": "J H"
                    }
                  ]
              },
              {
                  "name": "Closed Trips",
                  "trips": [
                    {
                        "tripid": "51",
                        "eventid": "2721",
                        "date": "2016-03-13",
                        "closeDate": "2016-03-13",
                        "isOpen": "0",
                        "length": "Day",
                        "departurePoint": "Z (Shell) Papanui",
                        "grade": "Easy",
                        "cost": "$20",
                        "title": "Takamatua Waterfall Walk",
                        "status": "",
                        "text": "Meander up the creek, past Totara,  bush to the waterfall, then through pasture land up the hill to the hut. Enjoy the views over the Akaroa Harbour and down the valley. Continuing to the ridge for views of the coast looping back to the cars..",
                        "leader": "B C"
                    },
                    {
                        "tripid": "52",
                        "eventid": "2680",
                        "date": "2016-03-14",
                        "closeDate": "2016-03-14",
                        "isOpen": "0",
                        "length": "Day",
                        "departurePoint": "",
                        "grade": "Training",
                        "cost": null,
                        "title": "Trip Leaders Course - CMLC clubrooms",
                        "status": "",
                        "text": "Are you already leading CTC club trips... are you thinking about becoming a trip leader or do you lead or organise private trips for your tramping buddies? Well this is the course for you. It only takes an evening, it covers CTC trip leading procedures, leadership styles, available club resources and equipment, risk management and more. Put your name down on the list. Venue:CMLC clubrooms, 7 pm - 9.30 pm approx.",
                        "leader": "A B"
                    }
                  ]
              }
            ]
        };
    }

    function getMockGetMembersResponse() {
        return {
            "members": [{
                "id": "260",
                "name": "A D",
                "email": "ad@gmail.com",
                "phone": "4432111",
                "role": null
            },
            {
                "id": "520",
                "name": "B J",
                "email": "bj@gmail.com",
                "phone": "3334555",
                "role": "Webmaster"
            }]
        };
    }


});