
(function () {
    'use strict';

    angular.module('tripSignupApp').factory('configService',
        ['$q', '$http', 'site',
        function ($q, $http, site) {

            var _config = undefined;

            //{ 
            //    "EditorRoles": "'Webmaster','Overnight Trip Organiser','Day Trip Organiser','Club Captain'", 
            //    "EmailFilter": "\/^alastairgbrown@yahoo\\.com\\.au$\/", 
            //    "BaseUrl": "http:\/\/www.ctc.org.nz\/trips", 
            //    "ShowDebugUpdate": false, 
            //    "AdditionalLines": 5, 
            //    "EditRefreshInSec": 30 
            //}
            
            //---------------------------------

            function load() {

                return _config ? $q.when(_config) : $http.get(site.restUrl('config', 'get'))
                    .then(function (response) {
                        if (ValidateResponse(response)) {
                            _config = response.data.config;
                            return _config;
                        }
                    });
            }

            //---------------------------------

            return {
                load: load,

                config: function () { return _config; },

                showDebugUpdate: function () { return _config && _config.ShowDebugUpdate; } ,

                additionalLines: function () { return _config && _config.AdditionalLines; },

                editRefreshInSec: function () { return _config && _config.EditRefreshInSec; },

                printLines: function () { return _config && _config.PrintLines; }
            }
        }]
    );

}());
