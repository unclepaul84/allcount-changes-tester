'use strict';

module.exports = function () {

    var adalAuthMethod = function (from, req, resp) {

        return "/oauth/azureAD"; //point to our adal route
    }

    adalAuthMethod.label = 'Azure AD';

    return adalAuthMethod;
}