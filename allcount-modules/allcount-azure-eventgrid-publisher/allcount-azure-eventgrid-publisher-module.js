'use strict';

exports.installModule = function (injection) {

    injection.bindMultiple('compileServices', ['allcount-azure-eventgrid-publisher-service']);
    injection.bindFactory('allcount-azure-eventgrid-publisher-service',  require('./allcount-azure-eventgrid-publisher-service.js')); //inject module
    
};
