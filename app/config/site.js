(function () {
    'use strict';

    // change as appropriate; comment out to set it from window.location
    //var site_url = 'http://localhost/ctc34';

    if (!site_url) {
        // Set global constant site.url from window.location
        var full_url = window.location.href,
            pathMatcher = new RegExp('(.*?)/tripsignup.*'),
            bits = pathMatcher.exec(full_url),
            site_url = 'invalidurl';
        if (bits != null) {
            site_url = bits[1];
        } else {
            console.log("Trip sign-up module fetched from an unexpected address");
        }
    }

    console.log("Setting site url to " + site_url);

    angular.module('tripSignupApp').constant('site',
        {
            url: site_url,
            getresturl: site_url + '/tripsignup/api/api.get.php',
            postresturl: site_url + '/tripsignup/api/api.post.php'
    });

}());


