module.exports = {
    start: function () {
        // FINNHUB websocket
        const FINNHUB_WEB_SOCKET_URL = 'wss://ws.finnhub.io?token=c622n1qad3iacs611jv0';
        const WebSocket = require("ws").WebSocket;
        let socket = new WebSocket(FINNHUB_WEB_SOCKET_URL);
        console.log("CONNECTED TO FINNHUB WEB SOCKET");

        socket.on('open', function () {
            console.log(`CONNECTED TO ${FINNHUB_WEB_SOCKET_URL}`);
        });

        socket.on('close', function close() {
            console.log('finnhub disconnected');
        });

        // Web socket server
        const WebSocketServer = require("ws").Server;
        const wss = new WebSocketServer({ port: 8100 });
        console.log("WEB SOCKET SERVER STARTED ON PORT 8100");

        wss.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
                console.log('received: %s', data);
                socket.send(data); // subscribe to ticker
            });
        });

        socket.on('message', function message(d) {
            const data = JSON.parse(d);
            // console.log("finnhub message received: " + data);

            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data)); // broadcast FINNHUB tracker data to all connected clients
                }
            });
        });
    }
};