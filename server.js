const injection = require('@unclepaul/allcountjs');
const fs = require('fs');
const path = require('path');
process.env['NODE_ENV'] = 'development'; //this is needed because of bug in asset minification. TODO: take out this line when minification bugs are fixed.

const port = process.env.PORT || 9080;
const baseUrl = process.env.BASE_URL || 'http://localhost:' + port;
const dbUrl = process.env.MONGO_DB_URL;

if (!dbUrl)
    throw new Error("Must set MONGO_DB_URL env variable!");

const gitRepoUrl = process.env.CONFIG_GIT_URL;

if (!gitRepoUrl)
    throw new Error("Must set CONFIG_GIT_URL env variable!");


injection.bindFactory('defaultBaseUrl', baseUrl);
injection.bindFactory('port', port);
injection.bindFactory('dbUrl', dbUrl);
injection.bindFactory('gitRepoUrl', gitRepoUrl);

if (fs.existsSync("package.json")) {
    injection.installModulesFromPackageJson("package.json");
}

InstallAllCountModulesFromCurrentWorkingDirectory(injection, 'allcount-modules');

var server = injection.inject('allcountServerStartup');

server.startup(function (errors) {
    if (errors) {
        if (errors.join === "function")
            throw new Error(errors.join('\n'));
        else
            throw new Error(errors);
    }
});

///TODO move into allcount package
function InstallAllCountModulesFromCurrentWorkingDirectory(injection, localPackagesRootFolder) {
   
    const allCountNodesPath = path.join(process.cwd(), localPackagesRootFolder);

    const items = fs.readdirSync(allCountNodesPath);

    items.forEach(function (file) {

        const subDir = path.join(allCountNodesPath, file);

        const files = fs.readdirSync(subDir);

        files.forEach((f) => {

            const filePath = path.join(subDir, f);

            if (filePath.endsWith('module.js')) {
                const module = require(filePath);
                injection.installModule(module);

            }

        });

    });

}