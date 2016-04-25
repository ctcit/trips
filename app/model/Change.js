(function () {
    "use strict";

    angular.module('tripApp').factory("Change",
        [
        function () {

            function Change(source, verb) {
                Initialize(this, source);
                this.verb = verb || "Changed";
                this.classname = "";
            }

            //angular.extend(Change.prototype, {
            //});

            return Change;
        }]
    );
})();