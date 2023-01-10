const http = require('http');
const fs = require('fs');
const ws = new require('ws');

const wss = new ws.Server({ noServer: true });

const clients = new Set();

function accept(req, res) {
    if (req.url == '/ws' && req.headers.upgrade && req.headers.upgrade.toLowerCase() == 'websocket' && req.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    } else if (req.url == '/') {
        // index.html
        fs.createReadStream('./index.html').pipe(res);
    } else {
        // page not found
        res.writeHead(404);
        res.end();
    }
}

function onSocketConnect(ws) {
    clients.add(ws);
    console.log(`new connection`);

    ws.on('message', function (message) {
        const obj = JSON.parse(message);

        console.log('message received: ', obj);

        for (let client of clients) {
            client.send(JSON.stringify(obj));
        }
    });

    ws.on('close', function () {
        console.log(`connection closed`);
        clients.delete(ws);
    });
}

http.createServer(accept).listen(8080);
