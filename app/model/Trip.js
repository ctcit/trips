(function () {
    "use strict";

    angular.module('tripApp').factory("Trip",
        ['$timeout',
        function ($timeout) {
            
            function Trip(tripData, tripMetadata) {
                //"tripid": "57",
                //"eventid": "2662",
                //"date": "2016-03-20",
                //"closeDate": "2016-03-20",
                //"isOpen": "0",
                //"length": "Day",
                //"departurePoint": "Z (Shell) Papanui",
                //"grade": "Easy",
                //"cost": "$25",
                //"title": "Hawdon Hut",
                //"status": "",
                //"text": "This has been re-scheduled from December. This trip will start at the Hawdon Shelter in Arthurs Pass National Park. Cross the Hawdon River and pick up the rough trail on the edge of the river terraces, following the Hawdon River upstream through delightful glades and open river flats. The track stays near the river bed all the way so the total height gain is about 80m. Look forward to lunch at the spacious Hawdon Hut next to the river with great views and return the same way. There will be lots of minor river crossings so expect wet feet. If there has been some recent rain it can be a little more challenging at the first crossing which is also the biggest. "

                Initialize(this, tripData, tripMetadata);

                this.metadata = tripMetadata;
            }

            angular.extend(Trip.prototype, {

                Date: function tripDate() {
                	return dow[this.date.getDay()] + " " + this.date.getDate() + " " + moy[this.date.getMonth()];
                }

            });

            return Trip;
        }]
    );
})();