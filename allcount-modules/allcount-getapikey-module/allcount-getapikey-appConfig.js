'use strict';

module.exports = function ( securityService, A) {

    A.app({
        entities: function (Fields, Crud, Security) {
            return {

                User: {
                    actions: [
                        {
                            id: 'getAccessToken',
                            name: "Reveal API Key",
                            perform: function (Actions) {

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