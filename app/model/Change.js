(function () {
    "use strict";

    angular.module('tripSignupApp').factory("Change",
        [
        function () {

            function Change(source, verb) {

                Initialize(this, source);

                this.verb = verb || "Changed";
                this.classname = "";
                this.line = parseInt(this.line); // get this back as string - but simpler to deal with it as an number
            }

            //angular.extend(Change.prototype, {
            //});

            return Change;
        }]
    );
})();
