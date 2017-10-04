'use strict';

const request = require('request');
const Q = require('q');
const _ = require('underscore');

module.exports = function (Q, storageDriver, entityDescriptionService, baseUrlService, injection, UUID) {

    return {

        compile: function (objects) {
            var self = this;
            objects.forEach(function (obj) {

                const evtHubsCfg = obj.propertyValue('azureEventGridPublish');

                if (evtHubsCfg)
                    self.evtHubsCfg = evtHubsCfg.obj;
            });

            if (self.evtHubsCfg) {
                if (!self.evtHubsCfg.url)
                    console.warn("'url' is not configured!");
                if (!self.evtHubsCfg.key)
                    console.warn("'key' is not configured!");
            }

            if (self.evtHubsCfg) {

                function publishToEventGrid(eventType, subject, data) {

                    var options = {
                        uri: self.evtHubsCfg.url,
                        method: 'POST',
                        headers: {
                            "aeg-sas-key": self.evtHubsCfg.key,
                        },
                        json: [{
                            "id": UUID().toUpperCase(),
                            "eventType": eventType,
                            "subject": subject,
                            "eventTime": new Date(),
                            "data": data
                        }]

                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            console.warn(error, options);
                        }

                        if (response.statusCode != 200) {
                            console.warn(body, options);
                        }
                    });
                }

                injection.bindFactory('AzureEventGridPublisher', {
                    publish: function (eventType, subject, payload) {

                        publishToEventGrid(eventType, subject, payload);
                    }
                });


                if (self.evtHubsCfg.autoPublishCrudActions) {
                    _.forEach(entityDescriptionService.entityDescriptions, function (entityDescriptor, entityTypeId) {

                        if (entityDescriptor.tableDescription.tableName != entityDescriptor.tableDescription.entityTypeId)
                            return;


                        if (self.evtHubsCfg.entityTypeIdIncludeFilter) {
                            var fRx = new RegExp(self.evtHubsCfg.autoPublishCrudActionsEntityIncludeFilter);

                            if (!fRx.test(entityTypeId))
                                return;
                        }

                        var tableDescriptor = entityDescriptionService.tableDescription(entityTypeId);

                        var handler = function (oldEntity, newEntity) {

                            const lEntityTypeId = entityTypeId;

                            const lTableDescriptor = tableDescriptor;

                            buildJsonAndSendPayload(lEntityTypeId, lTableDescriptor, oldEntity, newEntity);

                        };

                        handler.handlerTitle = "azure-event-grid-publisher-service";

                        storageDriver.addAfterCrudListener(tableDescriptor, handler);

                    });
                }

                function buildJsonAndSendPayload(entityTypeId, tableDescriptor, oldEntity, newEntity) {

                    let  actionType = 'update';

                    if (oldEntity === null)
                        actionType = 'create';
                    else if (newEntity === null)
                        actionType = 'delete';

                    let entity = oldEntity;

                    if (actionType === 'create')
                        entity = newEntity;

                    if (actionType === 'update') { //for update callback, only changed fields will be populated in the call back, we want all of them, that is why we have to look them up
                        storageDriver.readEntity(tableDescriptor, oldEntity.id).then(function (entityFromDb) {

                            entity = entityFromDb;

                            publish();

                        }).catch(x => deferred.reject(x));
                    }
                    else {

                        publish();
                    }

                    function publish()
                    {
                        publishToEventGrid('entity_' + actionType, baseUrlService.getBaseUrl() + '/entity/' + tableDescriptor.tableName, entity);
                        
                    }

                }
                
            }
        }

    };
};
