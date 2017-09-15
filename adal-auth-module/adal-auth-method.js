'use strict';

module.exports = function () {

    var adalAuthMethod = function (from, req, resp) {

        var r = req;

        return "http://yahoo.com"; //TODO:  call for adal redirect
    }

    adalAuthMethod.label = 'Azure AD';

    return adalAuthMethod;
}