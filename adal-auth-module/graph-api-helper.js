'use strict';

const request = require('superagent');

module.exports.getUserGroupMembership = function (tenant, accessToken, callback) {
    request
        .get('https://graph.windows.net/' + tenant + '/me/memberOf?api-version=1.5')
        .set('Authorization', 'Bearer ' + accessToken)
        .end((err, res) => {
            if (err)
                callback(err);
            else {

                try {
                    const memberOf = JSON.parse(res.text);

                    var groups = [];
                    
                    memberOf.value.forEach(function (e) {
                        groups.push(e.displayName);
                    });

                    callback(null, groups);
                } catch (e) {
                    callback(e);
                }
            }

        });
};


module.exports.getUserInformation = function (tenant, accessToken, callback) {
    request
        .get('https://graph.windows.net/' + tenant + '/me?api-version=1.5')
        .set('Authorization', 'Bearer ' + accessToken)
        .end((err, res) => {
            if (err)
                callback(err);
            else {

                try {
                    const me = JSON.parse(res.text);
      
                    callback(null, me);
                } catch (e) {
                    callback(e);
                }
            }

        });
};


/*

{"odata.metadata":"https://graph.windows.net/paulkotlyarhotmail.onmicrosoft.com/$metadata#directoryObjects","value":[{"odata.type":"Microsoft.DirectoryServices.DirectoryRole","objectType":"Role","objectId":"fd263c71-15f1-430d-9cbc-505d1666d059","deletionTimestamp":null,"description":"Company Administrator role has full access to perform any operation in the company scope.","displayName":"Company Administrator","isSystem":true,"roleDisabled":false,"roleTemplateId":"62e90394-69f5-4237-9190-012177145e10"},{"odata.type":"Microsoft.DirectoryServices.Group","objectType":"Group","objectId":"e35f4d21-9368-4466-bf60-91a88d19aab6","deletionTimestamp":null,"description":null,"dirSyncEnabled":null,"displayName":"siteadmins","lastDirSyncTime":null,"mail":null,"mailNickname":"622464b1-56ee-47db-8b9f-e8b14715cce8","mailEnabled":false,"onPremisesSecurityIdentifier":null,"provisioningErrors":[],"proxyAddresses":[],"securityEnabled":true}]}
*/