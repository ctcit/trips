function TripSummary(source) {
    Initialize(this, source, metadata["trips"]);
}

angular.extend(TripSummary.prototype, {

    Date: function() {
        return dow[this.date.getDay()] + " " + this.date.getDate() + " " + moy[this.date.getMonth()];
    }

});