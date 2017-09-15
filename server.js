var injection = require('@unclepaul/allcountjs');

injection.bindFactory('port', 9080);
injection.bindFactory('dbUrl', 'mongodb://pkallcounttester:UrhmV7OgZrZwNMhm7vGwtG7l9ipRYsPpERgXqCekKo7KfuTQXgvslnm9WU7pi9M8LaejjITNPL4ZWGOZjjZYdg==@pkallcounttester.documents.azure.com:10255/allcount?ssl=true&replicaSet=globaldb');
injection.bindFactory('gitRepoUrl', 'C:/temp/allcount-configs/allcount-changes-tester');

const adalmodule =  require("./adal-auth-module/adal-auth-module.js");

adalmodule.installModule(injection);

var server = injection.inject('allcountServerStartup');

server.startup(function (errors) {
    if (errors) {
        throw new Error(errors.join('\n'));
    }
});