'use strict';

module.exports = function (appAccessRouter, integrationService, adalintergrationprovider, baseUrlService, Q, keygrip, securityService, securityConfigService) {

    var route = {};

    const AuthenticationContext = require('adal-node').AuthenticationContext; //TODO: make testable by passing thru injector

    const graphApihelper = require('./graph-api-helper.js'); //TODO: make testable by passing thru injector

    const adalCfg = adalintergrationprovider.adalCfg;

    const authorityHostUrl = 'https://login.windows.net';

    const authorityUrl = authorityHostUrl + '/' + adalCfg.tenant;

    const redirectUri = baseUrlService.getBaseUrl() + '/oauth/azureAD/callback';

    const resource = 'https://graph.windows.net';

    const templateAuthzUrl = 'https://login.windows.net/' + adalCfg.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';

    function createAuthorizationUrl(state) {
        var authorizationUrl = templateAuthzUrl.replace('<client_id>', adalCfg.appId);
        authorizationUrl = authorizationUrl.replace('<redirect_uri>', redirectUri);
        authorizationUrl = authorizationUrl.replace('<state>', state);
        authorizationUrl = authorizationUrl.replace('<resource>', resource);
        return authorizationUrl;
    }

    function loginUser(res, user) {

        const userId = user.id.toString();

        res.redirect('/login?' + [
            ['user_id', userId],
            ['sign', keygrip.sign(userId)]
        ].map(function (s) {
            return s.join('=')
        }).join('&'));
    }

    function isAuthorized(aadGroups) {
        var ok = false;

        if (adalCfg.authorizedAADGroups) {

            adalCfg.authorizedAADGroups.forEach(function (aadg) {

                aadGroups.forEach(function (g) {

                    if (aadg === g) {
                        ok = true;
                        return;
                    }
                });

            });

            if (ok)
                return true;
            else
                return false;
        }
        else
            return true;
    }

    function buildRolesList(aadGroups) {
        const roles = [];

        if (adalCfg.aadGroup2RoleMapping) {
            adalCfg.aadGroup2RoleMapping.forEach(m => {

                aadGroups.forEach(g => {

                    if (g === m.group) {
                        roles.push(m.role);
                    }

                });

            });

        }

        return roles;
    }

    route.configure = function () {

        appAccessRouter.get('/oauth/azureAD', function (req, res) {
            res.redirect(createAuthorizationUrl(req.query.integrationId));
        });

        appAccessRouter.get('/oauth/azureAD/callback', function (req, res, next) {

            var authenticationContext = new AuthenticationContext(authorityUrl);

            authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, adalCfg.appId, adalCfg.appSecret, function (err, response) {

                if (err) {
                    console.warn(err);
                    throw err;
                }

                graphApihelper.getUserInformation(adalCfg.tenant, response.accessToken, (x, me) => {

                    if (x) {
                        console.warn(x);
                        throw x;
                    }

                    graphApihelper.getUserGroupMembership(adalCfg.tenant, response.accessToken, (ex, groups) => {

                        if (ex) {
                            console.warn(ex);
                            throw ex;
                        }

                        if (!isAuthorized(groups))
                            throw new Error("AAD user is not a member of AAD group permissioned for access!");

                        const userName = me.userPrincipalName;

                        securityService.findUser(userName).then((u) => {

                            if (u) {
                                //TODO update roles when user logs in
                                loginUser(res, u);
                            } else {

                                const roles = buildRolesList(groups);

                                securityService.createUser(userName, response.accessToken, roles).then(user => {
                                    loginUser(res, user);
                                }).catch(function (error) {

                                    console.error("Could not login user", error);

                                    throw error;
                                });
                            }

                        }).catch(function (error) {

                            console.error("Could not login user", error);

                            throw error;
                        });
                    });

                });


            });
        });
    };

    return route;
};