'use strict'
const geoip = require('geoip-lite');
const http = require('http');
const telemetry = require('vscode-extension-telemetry-wrapper');

const handler = (oid, req, res) => {
    const version = process.env.version;
    //const version = "0.1.0";

    //Analyze request headers and send info
    try {
        const requestHeaders = req.headers;
        const {referer} = requestHeaders;
        const ip = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
        console.log(req.headers['x-forwarded-for'] );
        console.log(req.connection.remoteAddress);
        console.log(req.socket.remoteAddress);
        telemetry.sendInfo(oid, {
            name: "requestInfo",
            "user-agent": requestHeaders["user-agent"],
            referer,
            "downloadVersion": version,
            "ip": ip,
            "language": requestHeaders["accept-language"]
        }, {});
        if(ip !== null){
            const geo = geoip.lookup(ip);
            if(geo !== null) {
                telemetry.sendInfo(oid, {
                    name: "requestInfo",
                    "country": geo.country,
                    "region": geo.region,
                    "city": geo.city
                }, {});
            }
        }
    } catch (err) {
        console.log(err);
    }

    // Parse request url
    let parsedUrl= req.url.split("/");
    if(parsedUrl[parsedUrl.length - 1] == "")
        parsedUrl.pop();
    const reqInstaller = parsedUrl[parsedUrl.length - 1];
    let installerInfo = reqInstaller.split("-");
    
    const oslist = ["win"];
    if (installerInfo.length == 2) { 
        const os = installerInfo[1];
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

server.listen(port,"0.0.0.0");