
(function () {
    'use strict';

    angular.module('tripApp').factory('configService',
        ['tripsService',
        function (tripsService) {

            var _config = {};

            //{ 
            //    "EditorRoles": "'Webmaster','Overnight Trip Organiser','Day Trip Organiser','Club Captain'", 
            //    "EmailFilter": "\/^alastairgbrown@yahoo\\.com\\.au$\/", 
            //    "BaseUrl": "http:\/\/www.ctc.org.nz\/trips", 
            //    "ShowDebugUpdate": false, 
            //    "AdditionalLines": 5, 
            //    "EditRefreshInSec": 30 
            //}
            
            //---------------------------------

            function initConfig() {

                return tripsService.getConfig()
                    .then(function (config) {
                        _config = config;
                        return _config;
                    });
            }

            //---------------------------------

            return {
                initConfig: initConfig,

                showDebugUpdate: function () { return _config && _config.ShowDebugUpdate; } ,

                additionalLines: function () { return _config && _config.AdditionalLines; },

                editRefreshInSec: function () { return _config && _config.EditRefreshInSec; }

            }
        }]
    );

}());
