'use strict'
const geoip = require('geoip-lite');
const http = require('http');
const telemetry = require('vscode-extension-telemetry-wrapper');
//const Id = require ("../telemetry/Id.ts");
const handler = (oid, req, res) => {
    const version = process.env.version;

    //Analyze request
    try {
        const requestHeaders = req.headers;
        const ip = req.client["localAddress"];
        const geo = geoip.lookup(ip);
        const { referer} = requestHeaders;
        telemetry.sendInfo(oid, {
            name: "metadata",
            "user-agent": requestHeaders["user-agent"],
            referer,
            "country": geo.country,
            "region": geo.region,
            "city": geo.city,
            "version": version
        }, {});
    } catch (err) {
        //do nothing
    }
    
    let array = req.url.split("/");
    if(array[array.length - 1] == "")
        array.pop();
    const reqInstaller = array[array.length - 1];
    let installerArray = reqInstaller.split("-");
    const oslist = ["win"];
    const jdklist = ["8", "11", "12"];
    const archlist = ["x64", "x86"];
    if (installerArray.length == 2) { 
        const os = installerArray[1];
        if(oslist.includes(os))
            res.writeHead(302, {
                    location: `https://vscjavaci.blob.core.windows.net/vscodejavainstaller/latest/VSCodeJavaInstaller-online-${os}-${version}.exe`});
        else {
            const err = new Error("No request handler found for " + req.url);
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 Not found");
            res.end();
            telemetry.setUserError(err);
            throw(err);
        }

    } else { // Unvalid format
        const err = new Error("No request handler found for " + req.url);
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not found");
        res.end();
        telemetry.setUserError(err);
        throw(err);
    }
    return res.end();
};

const initialized = telemetry.initializeFromJsonFile("./package.json", true);
const instrumentedHandler = telemetry.instrumentOperation("download", (oid, ...args) => handler(oid, ...args));
const server = http.createServer(instrumentedHandler);
const port = process.env.PORT || 1337;

server.listen(port);