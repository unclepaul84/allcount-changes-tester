'use strict';

exports.installModule = function (injection) {

    //we are registering application configuration module
    
    injection.bindMultiple('appConfigs', ['allcount-getapikey-appConfig']); //gives this service access to app manifest file 
    injection.bindFactory('allcount-getapikey-appConfig',  require('./allcount-getapikey-appConfig.js')); //inject module
    
};
