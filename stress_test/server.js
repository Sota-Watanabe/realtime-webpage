const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 }, () => {
    console.log("server is now listening localhost:3000");
});

let connections = [];

wss.on("connection", ws => {
    connection.onerror = error => {
        console.log(`WebSocket error: ${error}`)
    };
    connections.push(ws);
    console.log(`new connection established. connections: ${connections.length}`);
    ws.on("close", () => {
        console.log(`connection closeed: ${connections.length}`);
        connections = connections.filter((conn, i) => conn !== ws);
    });
    ws.on("message", message => {
        // console.log('message.toString=', message.toString('UTF-8'))
        broadcast(message.toString('UTF-8'));
    });
});

const broadcast = message => {
    connections.forEach((con, i) => {
        con.send(message);
    });
};