(function () {
    'use strict';

    // change as appropriate; comment out to set it from window.location
    var site_url = 'http://www.ctc.org.nz';

    if (!site_url) {
        // Set global constant site.url from window.location
        var full_url = window.location.href,
            pathMatcher = new RegExp('(.*?)/tripreports.*'),
            bits = pathMatcher.exec(full_url),
            site_url = 'invalidurl';
        if (bits != null) {
            site_url = bits[1];
        } else {
            console.log("Trip sign-up module fetched from an unexpected address");
        }
    }

    console.log("Setting site url to " + site_url);

    angular.module('tripApp').constant('site',
        {
            url: site_url,
            getresturl: site_url + '/trips/api.get.php',
            postresturl: site_url + '/trips/api.get.php'
    });

}());


