(function () {
    'use strict';

	var site_url = null;
	var site_api = null;
    // change as appropriate; comment out to set it from window.location
    //site_url = 'http://localhost/ctc34';
	//site_api = 'tripsignup/api';

    if (!site_url) {
        // Set global constant site.url from window.location
        var full_url = window.location.href;
		var pathMatcher = new RegExp('(.*?)/(trips[^/]*)');
		var bits = pathMatcher.exec(full_url);

		site_url = 'invalidurl';

        if (bits != null) {
            site_url = bits[1];
			site_api = bits[2] + '/api';
        } else {
            console.log("Trip sign-up module fetched from an unexpected address");
        }
    }

    console.log("Setting site url to " + site_url);
    console.log("Setting site api to " + site_api);

    angular.module('tripSignupApp').factory('site',
        [
        function () {

            return {
                url: site_url,
                currenttripsbaseurl: site_url + '/index.php/trip-signup',

                set: function(url, api) {
                    site_url = url;
                    site_api = api;
                },

                restUrl: function restUrl(method, verb) {
                    return site_url + '/' + site_api + '/api.{{method}}.{{verb}}.php'.replace('{{method}}', method).replace('{{verb}}', verb);
                }

            };
        }]);

    // Disable caching of JSON requests (which screws the app when using IE).
    // See http://stackoverflow.com/questions/16971831/better-way-to-prevent-ie-cache-in-angularjs
    angular.module('tripSignupApp').config(['$httpProvider', function($httpProvider) {
            //initialize get if not there
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }

            // Answer edited to include suggestions from comments
            // because previous version of code introduced browser-related errors

            //disable IE ajax request caching
            $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
            // extra
            $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
            $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
        }]);
}());


