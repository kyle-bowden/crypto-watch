const webSocketServer = require("./webSocketServer");
const express = require('express');
const favicon = require('express-favicon');
const {createProxyMiddleware} = require('http-proxy-middleware');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();

app.use(favicon(__dirname + '/build/favicon.ico'));

app.use(
    '/coins/**',
    createProxyMiddleware({
        target: 'https://assets.coingecko.com',
        changeOrigin: true,
        onProxyReq: function onProxyReq(proxyReq, req, res) {
            // Log outbound request to remote target
            console.log('-->  ', req.method, req.path, '->', proxyReq.baseUrl + proxyReq.path);
        }
    })
);

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = app.listen(port, () => console.log(`Listening on ${port}`));

webSocketServer.start(server);