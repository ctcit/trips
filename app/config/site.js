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
		var pathMatcher = new RegExp('(.*?)/(tripsignup[^/]*)');
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

    angular.module('tripSignupApp').constant('site',
        {
            url: site_url,
            getresturl:  site_url + '/' + site_api + '/api.get.php',
            postresturl: site_url + '/' + site_api + '/api.post.php',
            newtrippostresturl: site_url + '/' + site_api + '/api.newtrip.post.php',
            printabletriplisturl: site_url + '/tripsignup/printabletriplist.php'
        });

}());


