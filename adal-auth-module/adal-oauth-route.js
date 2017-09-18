'use strict';

module.exports = function (appAccessRouter, integrationService, adalintergrationprovider, baseUrlService, Q, keygrip, securityService, securityConfigService) {
    var route = {};


    const AuthenticationContext = require('adal-node').AuthenticationContext;

    const graphApihelper = require('./graph-api-helper.js');

    const authorityHostUrl = 'https://login.windows.net';

    const authorityUrl = authorityHostUrl + '/' + adalintergrationprovider.adalTenant;

    const redirectUri = baseUrlService.getBaseUrl() + '/oauth/azureAD/callback';

    const resource = 'https://graph.windows.net';

    const templateAuthzUrl = 'https://login.windows.net/' + adalintergrationprovider.adalTenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>';

    function createAuthorizationUrl(state) {
        var authorizationUrl = templateAuthzUrl.replace('<client_id>', adalintergrationprovider.adalAppId);
        authorizationUrl = authorizationUrl.replace('<redirect_uri>', redirectUri);
        authorizationUrl = authorizationUrl.replace('<state>', state);
        authorizationUrl = authorizationUrl.replace('<resource>', resource);
        return authorizationUrl;
    }


    route.configure = function () {

        appAccessRouter.get('/oauth/azureAD', function (req, res) {
            res.redirect(createAuthorizationUrl(req.query.integrationId));
        });

        appAccessRouter.get('/oauth/azureAD/callback', function (req, res, next) {

            const integrationId = req.query.state;


            var authenticationContext = new AuthenticationContext(authorityUrl);

            authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, adalintergrationprovider.adalAppId, adalintergrationprovider.adalAppSecret, function (err, response) {

                if (err) {
                    throw err;
                }

                graphApihelper.getUserInformation(adalintergrationprovider.adalTenant, response.accessToken, (x, me) => {

                    const userName = me.userPrincipalName;

                    function loginUser(user) {
                        
                        const userId = user.id.toString();

                        res.redirect('/login?' + [ 
                            ['user_id', userId],
                            ['sign', keygrip.sign(userId)]
                        ].map(function (s) {
                            return s.join('=')
                        }).join('&'));
                    }

                    securityService.findUser(userName).then((u) => {

                        if (u) {

                            loginUser(u);

                        } else {
                            //create user
                            ///TODO: check if user is allowed to this site from app config (ie only users of certain AAD groups are allowed to join)
                            ///TODO: map AAD group memberships to roles
                            securityService.createUser(userName, response.accessToken,[]).then(user => {

                                loginUser(user);
                            });
                        }

                    });

                });

            });
        });
    };

    return route;
};