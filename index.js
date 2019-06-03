'use strict'

const http = require('http');

const server = http.createServer(function(req, res) {
    const version = process.env.version;
    //const version = "0.1.0";
    let array = req.url.split("/");
    if(array[array.length - 1] == "")
        array.pop();
    const reqInstaller = array[array.length - 1];
    let installerArray = reqInstaller.split("-");
    if (installerArray.length == 2 && installerArray[0] == "online") { 
        const os = installerArray[1];
        res.writeHead(302, {
            location: `https://vscjavaci.blob.core.windows.net/vscodejavainstaller/latest/VSCodeJavaInstaller-online-${os}-${version}.exe`});
    } else if (installerArray.length == 3) {
        const os = installerArray[0];
        const arch = installerArray[1];
        const jdk = installerArray[2].substring(3);
        res.writeHead(302, {
            location: `https://vscjavaci.blob.core.windows.net/vscodejavainstaller/latest/VSCodeJava${jdk}Installer-${os}-${arch}-${version}.exe`});
    } 
    return res.end();
})
const port = process.env.PORT || 1337;
server.listen(port);