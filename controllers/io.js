const socketIO = require('socket.io');

const initIO = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        }
    });
    return io;
};

module.exports={initIO};