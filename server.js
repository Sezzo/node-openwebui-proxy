process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const app = express();

const API_KEY = process.env.API_KEY || "";
const TARGET = process.env.TARGET || '';

// Log
app.use((req, res, next) => {
    console.log('➡️ ', req.method, req.path);
    next();
});

// Proxy  /api/*-
app.use('/api', createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    secure: false,
    logLevel: 'info',
    pathRewrite: {
        '^/api': '/api',
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Host', new URL(TARGET).host);
        proxyReq.setHeader('Authorization', `Bearer ${API_KEY}`);

        console.log('Authorization header added');
    },
    onError: (err, req, res, target) => {
        console.error('Proxy error:', err.message);
        res.status(500).send('Proxy error: Target unreachable');
    }
}));

// Optional health route
app.get('/', (req, res) => {
    res.json({
        status: 'Proxy is running',
        api: 'http://0.0.0.0:3000/api/models',
        message: 'All /api requests are forwarded with API key.',
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy is running at http://0.0.0.0:${PORT}`);
    console.log(`/api → ${TARGET}/api (with API key)`);
    console.log(`Test: http://0.0.0.0:3000/api/models`);
});