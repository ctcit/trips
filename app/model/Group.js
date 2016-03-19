function Group(source) {

    this.name = source.name;
    this.showdetail = this.isMyTrips = source.isMyTrips;
    this.trips = source.trips.map(function (tripData) {
        return new TripSummary(tripData);
    });
}

//angular.extend(Group.prototype, {
//});
