//'use strict';
 
//describe('TripYearsController: ', function () {
//    var $scope;
//    var createController;
//    var $httpBackend;
//    var site;

//    //mock Application to allow us to inject our own dependencies
//    beforeEach(angular.mock.module('tripReportApp'));

//    //mock the controller for the same reason and include $rootScope and $controller
//    beforeEach(angular.mock.inject(function ($rootScope, $controller, _$httpBackend_, _site_) {
//        //create an empty scope
//        $scope = $rootScope.$new();

//        createController = function () {
//            return $controller('TripYearsController', { $scope: $scope });
//        };

//        $httpBackend = _$httpBackend_;
//        site = _site_;
//    }));


//    var years = ["2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", "1995", "1994", "1992", "1989", "1977", "1971", "1961", "1956"];
//    var NUM_RECENT = 10;
//    var controller;

//    beforeEach(function () {
//        $httpBackend
//            .whenGET(/app\/.*\.html/).respond(200, ''); // workaround for unexpected requests of views

//        $httpBackend
//            .when('GET', site.url + '/db/index.php/rest/user')
//            .respond({ "id": 0 });

//        $httpBackend
//            .when('GET', site.url + '/db/index.php/rest/tripreportyears')
//            .respond(years);

//        controller = createController();
//        $httpBackend.flush();
//    });

//    afterEach(function () {
//        $httpBackend.verifyNoOutstandingExpectation();
//        $httpBackend.verifyNoOutstandingRequest();
//    });



//    // tests start here
//    it('should return the complete list of years', function () {
//        expect($scope.years).toEqual(years);
//        expect($scope.recentOnly).toEqual(true);
//        expect($scope.numYears).toEqual(NUM_RECENT);
//    });

//    it('should toggle between most recent and all years on checkbox change', function () {
//        $scope.recentOnly = false;
//        $scope.checkboxChanged();
//        expect($scope.numYears).toEqual($scope.years.length);

//        $scope.recentOnly = true;
//        $scope.checkboxChanged();
//        expect($scope.numYears).toEqual(NUM_RECENT);
//    });



//});