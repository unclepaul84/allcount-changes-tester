'use strict';

const EventHubClient = require('azure-event-hubs').Client;
const _ = require('underscore');

module.exports = function (Q, storageDriver, entityDescriptionService, baseUrlService, injection) {

    return {

        compile: function (objects) {
            var self = this;
            objects.forEach(function (obj) {

                const evtHubsCfg = obj.propertyValue('azureEventHubsPublish');

                if (evtHubsCfg)
                    self.evtHubsCfg = evtHubsCfg.obj;
            });

            if (self.evtHubsCfg) {
                if (!self.evtHubsCfg.connectionString)
                    console.warn("'connectionString' is not configured!");
                if (!self.evtHubsCfg.path)
                    console.warn("'path' is not configured!");
            }

            if (self.evtHubsCfg) {

                var client = EventHubClient.fromConnectionString(self.evtHubsCfg.connectionString, self.evtHubsCfg.path);

                var sender = null;

                client.open()
                    .then(function () {
                        return client.createSender();
                    })
                    .then(function (tx) {
                        tx.on('errorReceived', function (err) { console.error("Error in event hub:", err); });

                        sender = tx;

                        injection.bindFactory('AzureEventHubPublisher', {
                            publish: function (payload) {

                                var envelope = { sender: baseUrlService.getBaseUrl(), actionTime: new Date().toISOString(), payload: payload };

                                tx.send(envelope, null);
                            }
                        });

                    }).catch((x) => {
                        console.error("Error setting up azure-event-hubs-publisher-service", x);
                    });

                if (self.evtHubsCfg.autoPublishCrudActions) {
                    _.forEach(entityDescriptionService.entityDescriptions, function (entityDescriptor, entityTypeId) {

                        if (self.evtHubsCfg.entityTypeIdIncludeFilter) {
                            var fRx = new RegExp(self.evtHubsCfg.autoPublishCrudActionsEntityIncludeFilter);

                            if (!fRx.test(entityTypeId))
                                return;
                        }

                        var tableDescriptor = entityDescriptionService.tableDescription(entityTypeId);

                        var handler = function (oldEntity, newEntity) {

                            const lEntityTypeId = entityTypeId;

                            const lTableDescriptor = tableDescriptor;

                            buildJsonPayload(lEntityTypeId, lTableDescriptor, oldEntity, newEntity).then(x => {

                                if (sender)
                                    sender.send(x, null).catch(x => { console.error("Error sending to azure-event-hubs-publisher-service", x) });

                            }).catch(x => console.warn(x));

                        };

                        handler.handlerTitle = "azure-event-hubs-publisher-service";

                        storageDriver.addAfterCrudListener(tableDescriptor, handler);

                    });
                }

                function buildJsonPayload(entityTypeId, tableDescriptor, oldEntity, newEntity) {

                    var deferred = Q.defer();

                    var actionType = 'update';
                    if (oldEntity === null)
                        actionType = 'create';
                    else if (newEntity === null)
                        actionType = 'delete';

                    var entity = oldEntity;

                    var payload = { sender: baseUrlService.getBaseUrl(), actionTime: new Date().toISOString(), actionType: actionType, entityName: entityTypeId, entity: entity };

                    if (actionType != 'delete') {
                        storageDriver.readEntity(tableDescriptor, oldEntity.id).then(function (entityFromDb) {

                            payload.entity = entityFromDb;

                            deferred.resolve(payload);

                        }).catch(x => deferred.reject(x));
                    }
                    else
                        deferred.resolve(payload);
                    return deferred.promise;
                }
            }
        }

    };
};


