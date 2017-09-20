'use strict'
// "implements"  allcount js module "interface"
exports.installModule = function (injection) {
    
    //register our components with DI

   
    injection.bindMultiple('compileServices', ['adalintergrationprovider', 'adal-login-method']); //gives this service access to app manifest file 
    injection.bindFactory('adalintergrationprovider', require('./adal-intergration-provider.js')); //inject module
   
  
    injection.bindMultiple('appConfigurators', ['adal-oauth-route']); //allows service to edit routes
    injection.bindFactory('adal-oauth-route', require('./adal-oauth-route.js'));

    injection.bindMultiple('loginMethods', ['adal-login-method']); //inject module into login methods collection, this makes the alternative login button appear
    injection.bindFactory('adal-login-method', require('./adal-auth-method.js')); //inject module
  
};



