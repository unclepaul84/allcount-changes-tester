'use strict';

module.exports = function (adalintergrationprovider) {

    var adalAuthMethod = function (from, req, resp) {

        return "/oauth/azureAD"; //point to our adal route
    }

    adalAuthMethod.label = 'Azure AD';

    adalAuthMethod.compile = function () {

        if (adalintergrationprovider.adalCfg && adalintergrationprovider.adalCfg.isDefaultLoginMethod) {
            adalAuthMethod.forceRedirect = true;
        }

    }

    return adalAuthMethod;
}