var injection = require('@unclepaul/allcountjs');

var port = process.env.PORT || 9080;

process.env['NODE_ENV'] = 'development';


injection.bindFactory('defaultBaseUrl', 'http://localhost:' + port);

if(process.env.BASE_URL)
    injection.bindFactory('defaultBaseUrl', process.env.BASE_URL);

injection.bindFactory('port', port);
injection.bindFactory('dbUrl', 'mongodb://pkallcounttester:UrhmV7OgZrZwNMhm7vGwtG7l9ipRYsPpERgXqCekKo7KfuTQXgvslnm9WU7pi9M8LaejjITNPL4ZWGOZjjZYdg==@pkallcounttester.documents.azure.com:10255/allcount?ssl=true&replicaSet=globaldb');
injection.bindFactory('gitRepoUrl', 'https://gist.github.com/90492c822dc2d7ed319cdcad9d255de3.git');

const adalmodule = require("./adal-auth-module/adal-auth-module.js");

adalmodule.installModule(injection);

var server = injection.inject('allcountServerStartup');

server.startup(function (errors) {
    if (errors) {
        if (errors.join === "function")
            throw new Error(errors.join('\n'));
        else
            throw new Error(errors);
    }
});