const httpServer = require('http-server');

const server = httpServer.createServer();
server.listen({port: process.env.PORT || 3000}, () => console.log('started'));