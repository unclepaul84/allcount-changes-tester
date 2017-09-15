'use strict'

exports.installModule = function (injection) {
    injection.bindMultiple('loginMethods', ['adal-login-method']); //inject module into login methods collection
    injection.bindFactory('adal-login-method', require('./adal-auth-method.js')); //inject module

};



