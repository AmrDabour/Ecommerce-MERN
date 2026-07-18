const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Proxy API requests to backend and strip the /api prefix
app.use('/api', createProxyMiddleware({ 
    target: 'http://127.0.0.1:5000', 
    changeOrigin: true, 
    pathRewrite: { '^/api': '' } 
}));

app.use('/ai-api', createProxyMiddleware({ 
    target: 'http://127.0.0.1:8000', 
    changeOrigin: true, 
    pathRewrite: { '^/ai-api': '' } 
}));

const wsProxy = createProxyMiddleware({ 
    target: 'http://127.0.0.1:5000', 
    changeOrigin: true, 
    ws: true,
    pathFilter: '/socket.io'
});
app.use(wsProxy);

// Serve static frontend files
const distPath = path.join(__dirname, 'dist/standalone-app/browser');
app.use(express.static(distPath));

// For SPA routing
app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        next();
    }
});

const server = app.listen(4200, '0.0.0.0', () => {
    console.log('PWA test server running at http://localhost:4200');
    console.log('If testing on mobile, use your local IP address (e.g. http://192.168.x.x:4200)');
});

server.on('upgrade', wsProxy.upgrade);
