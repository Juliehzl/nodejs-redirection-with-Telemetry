'use strict'
const geoip = require('geoip-lite');
const http = require('http');
const telemetry = require('vscode-extension-telemetry-wrapper');

const handler = (oid, req, res) => {
    try {
    //const version = process.env.version;
        const version = "0.1.0";
        //Analyze request headers and send info
    
        const requestHeaders = req.headers;
        const referer = "";
        if ("referer" in Object.keys(requestHeaders))
            referer = req.headers["referer"];
        const ip = req.headers['x-forwarded-for'] || "";
        let ipAddress = ip.split(":")[0];
        const geo = geoip.lookup(ipAddress);
        const country = geo == null ? null : geo.country;
        const region = geo == null ? null : geo.region;
        const city = geo == null ? null : geo.city;
        
        telemetry.sendInfo(oid, {
            name:"requestInfo",
            "user-agent": requestHeaders["user-agent"],
            "referer": referer,
            "downloadVersion": version,
            "accept-language": requestHeaders["accept-language"],
            "country": country,
            "region": region,
            "city": city,
        }, {});

        // Parse request url
        let parsedUrl= req.url.split("/");
        if(parsedUrl[parsedUrl.length - 1] == "")
            parsedUrl.pop();
        const reqInstaller = parsedUrl[parsedUrl.length - 1];
        let installerInfo = reqInstaller.split("-");
        
        const oslist = ["win"];
        if (installerInfo.length == 2) { 
            const os = installerInfo[1];
            if(oslist.includes(os)) {
                res.writeHead(302, {
                   location: `https://vscjavaci.blob.core.windows.net/vscodejavainstaller/latest/VSCodeJavaInstaller-online-${os}-${version}.exe`});
            }
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
    } catch (err) {
        console.log(err);
    }
};

const initialized = telemetry.initializeFromJsonFile("./package.json", true);
const instrumentedHandler = telemetry.instrumentOperation("download", (oid, ...args) => handler(oid, ...args));
const server = http.createServer(instrumentedHandler);
server.on('request', (request, response) => {
    const { method, url } = request;
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
    body = Buffer.concat(body).toString();
    // at this point, `body` has the entire request body stored in it as a string
    });
});

const port = process.env.PORT || 1337;

server.listen(port);