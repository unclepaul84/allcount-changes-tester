'use strict';

module.exports = function ( securityService, A) {

    A.app({
        entities: function (Fields, Crud, Security) {
            return {

                User: {
                    actions: [
                        {
                            id: 'getAccessToken',
                            name: "Get Access Token",
                            perform: function (Crud, User, Actions, Security) {

                                return Actions.modalResult('API Key', securityService.generateToken(User));
                            },
                            actionTarget: 'single-item'
                        }
                    ]
                }
            };

        }
    });

};