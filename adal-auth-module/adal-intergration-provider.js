module.exports = function () {
    return {
        appId: 'adal',
        appName: 'Azure Active Directory',

        //this tell gui to show button for AD and the redirect to this url when clicked
        accessTokenUrl: function () {
            return '/oauth/azureAD';
        },
        compile: function (objects) {
            var self = this;
            objects.forEach(function (obj) {

                var adalAppId = obj.propertyValue('adalAppId');
                if (adalAppId) {
                    self.adalAppId = adalAppId;
                }

                var adalAppSecret = obj.propertyValue('adalAppSecret');
                if (adalAppSecret) {
                    self.adalAppSecret = adalAppSecret;
                }

                var adalTenant = obj.propertyValue('adalTenant');
                if (adalTenant) {
                    self.adalTenant = adalTenant;
                }

            });

            if (!self.adalAppId)
                console.warn("'adalAppId' is not configured!");
            if (!self.adalAppSecret)
                console.warn("'adalAppSecret' is not configured!");
            if (!self.adalTenant)
                console.warn("'adalTenant' is not configured!");
        }
    }
};