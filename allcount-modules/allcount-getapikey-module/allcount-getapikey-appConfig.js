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
                            perform: function (User, Actions) {
                                
                                const crud = Crud.actionContextCrud();

                                return crud.readEntity(Actions.selectedEntityId()).then(function (entity) {
                                
                                    return Actions.modalResult('Api Key', securityService.generateToken(entity));

                                });
                                
                            },
                            actionTarget: 'single-item'
                        }
                    ]
                }
            };

        }
    });

};