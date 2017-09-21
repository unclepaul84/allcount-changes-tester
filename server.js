var injection = require('@unclepaul/allcountjs');
const fs = require('fs');

var port = process.env.PORT || 9080;

process.env['NODE_ENV'] = 'development';


injection.bindFactory('defaultBaseUrl', 'http://localhost:' + port);
injection.bindFactory('port', port);
injection.bindFactory('dbUrl', 'mongodb://pkallcounttester:UrhmV7OgZrZwNMhm7vGwtG7l9ipRYsPpERgXqCekKo7KfuTQXgvslnm9WU7pi9M8LaejjITNPL4ZWGOZjjZYdg==@pkallcounttester.documents.azure.com:10255/allcount?ssl=true&replicaSet=globaldb');
injection.bindFactory('gitRepoUrl', 'https://gist.github.com/90492c822dc2d7ed319cdcad9d255de3.git');



if (process.env.CONFIG_GIT_URL)
    injection.bindFactory('gitRepoUrl', process.env.CONFIG_GIT_URL);

if (process.env.MONGO_DB_URL)
    injection.bindFactory('dbUrl', process.env.MONGO_DB_URL);

if (process.env.BASE_URL)
    injection.bindFactory('defaultBaseUrl', process.env.BASE_URL);


//const adalmodule = require("@unclepaul/allcount-adal-auth-module");

//adalmodule.installModule(injection);

//const eventHubModule = require("@unclepaul/allcount-azure-event-hubs-module");

//eventHubModule.installModule(injection);


if (fs.existsSync("package.json")) {
    injection.installModulesFromPackageJson("package.json");
}

var server = injection.inject('allcountServerStartup');

server.startup(function (errors) {
    if (errors) {
        if (errors.join === "function")
            throw new Error(errors.join('\n'));
        else
            throw new Error(errors);
    }
});