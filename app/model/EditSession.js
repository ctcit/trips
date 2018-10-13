(function () {
    "use strict";

    angular.module('tripSignupApp').factory("EditSession",
        [
        function () {

            function EditSession(editId, changes, edits, modifications) {

                this.editId = editId;
                this.changes = changes;
                this.edits = edits;
                this.modifications = modifications;

            }

            //angular.extend(EditSession.prototype, {
            //});

            return EditSession;
        }]
    );
})();