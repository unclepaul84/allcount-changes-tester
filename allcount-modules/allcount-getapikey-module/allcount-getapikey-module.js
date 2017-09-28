'use strict';

exports.installModule = function (injection) {

    injection.bindMultiple('appConfigs', ['allcount-getapikey-appConfig']);
    injection.bindFactory('allcount-getapikey-appConfig',  require('./allcount-getapikey-appConfig.js')); //inject module
    
};
