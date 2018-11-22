const httpServer = require('http-server');

const server = httpServer.createServer({ cache: 0 });
server.listen({port: process.env.PORT || 3000}, () => console.log('started'));