module.exports = {
    start: function (server) {
        // FINNHUB websocket
        const FINNHUB_WEB_SOCKET_URL = 'wss://ws.finnhub.io?token=c622n1qad3iacs611jv0';
        const { WebSocket } = require("ws");
        let socket = new WebSocket(FINNHUB_WEB_SOCKET_URL);

        socket.on('open', function () {
            console.log(`CONNECTED TO ${FINNHUB_WEB_SOCKET_URL}`);
        });

        socket.on('close', function close() {
            console.log(`DISCONNECTED FROM ${FINNHUB_WEB_SOCKET_URL}`);
        });

        // Web socket server
        const { Server } = require('ws');
        const wss = new Server({ server });

        wss.on('connection', function connection(ws) {
            console.log("WEB SOCKET SERVER STARTED");
            ws.on('message', function message(data) {
                console.log('received: %s', data);
                socket.send(data); // subscribe to ticker
            });
        });

        socket.on('message', function message(d) {
            const data = JSON.parse(d);
            
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data)); // broadcast FINNHUB tracker data to all connected clients
                }
            });
        });
    }
};