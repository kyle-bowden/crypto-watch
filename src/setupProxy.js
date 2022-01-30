const {createProxyMiddleware} = require('http-proxy-middleware');
const morgan = require("morgan");

module.exports = app => {
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

    // app.use(
    //     '/api/v3/**',
    //     createProxyMiddleware({
    //         target: 'https://api.coingecko.com',
    //         changeOrigin: true,
    //         onProxyReq: function onProxyReq(proxyReq, req, res) {
    //             // Log outbound request to remote target
    //             console.log('-->  ', req.method, req.path, '->', proxyReq.baseUrl + proxyReq.path);
    //         }
    //     })
    // );
    //
    // app.use(
    //     '/api/**',
    //     createProxyMiddleware({
    //         target: 'https://finnhub.io',
    //         changeOrigin: true,
    //         onProxyReq: function onProxyReq(proxyReq, req, res) {
    //             // Log outbound request to remote target
    //             console.log('-->  ', req.method, req.path, '->', proxyReq.baseUrl + proxyReq.path);
    //         }
    //     })
    // );

    app.use(morgan('combined'));
};
