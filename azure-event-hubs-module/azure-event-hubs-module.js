'use strict';

exports.installModule = function (injection) {
  
    injection.bindMultiple('compileServices', ['azureEventHubsPublisherService']); //gives this service access to app manifest file 
    injection.bindFactory('azureEventHubsPublisherService', require('./azure-event-hubs-publisher-service.js')); //inject module
   

};
