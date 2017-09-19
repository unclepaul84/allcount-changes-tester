module.exports = function () {
    return {
        appId: 'adal',
        appName: 'Azure Active Directory',


        accessTokenUrl: function () {
            return '/oauth/azureAD';
        },
        compile: function (objects) {
            var self = this;
            objects.forEach(function (obj) {

                const adalCfg = obj.propertyValue('adal');
                
                if (adalCfg)
                    self.adalCfg = adalCfg.obj;

            });

            if (!self.adalCfg.appId)
                console.warn("'appId' is not configured!");
            if (!self.adalCfg.appSecret)
                console.warn("'appSecret' is not configured!");
            if (!self.adalCfg.tenant)
                console.warn("'tenant' is not configured!");
        }
    }
};


