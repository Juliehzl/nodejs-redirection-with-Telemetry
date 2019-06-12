'use strict'

const http = require('http');
const telemetry = require('vscode-extension-telemetry-wrapper');
//const Id = require ("../telemetry/Id.ts");
const handler = (req, res) => {
    //const version = process.env.version;
    const version = "0.1.0";
    let array = req.url.split("/");
    if(array[array.length - 1] == "")
        array.pop();
    const reqInstaller = array[array.length - 1];
    let installerArray = reqInstaller.split("-");
    if (installerArray.length == 2 && installerArray[0] == "online") { 
        const os = installerArray[1];
        const operationName = `download-online-${os}`;
        
        res.writeHead(302, {
                location: `https://vscjavaci.blob.core.windows.net/vscodejavainstaller/latest/VSCodeJavaInstaller-online-${os}-${version}.exe`});
      
    } else if (installerArray.length == 3) {
        const os = installerArray[0];
        const arch = installerArray[1];
        const jdk = installerArray[2].substring(3);
        const operationName = `download-jdk${jdk}-${os}-${arch}`;
        
        res.writeHead(302, {
                location: `https://vscjavaci.blob.core.windows.net/vscodejavainstaller/latest/VSCodeJava${jdk}Installer-${os}-${arch}-${version}.exe`});
        
    } else {
        res.writeHead(400);
    }
    return res.end();
};
const initialized = telemetry.initializeFromJsonFile("./package.json", true);
const instrumentedHandler = telemetry.instrumentOperation("download", (oid, ...args) => handler(...args));
const server = http.createServer(instrumentedHandler);
const port = process.env.PORT || 1337;

server.listen(port);

