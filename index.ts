import { Database } from 'bun:sqlite';

export const db = new Database(":memory:");
export const query = db.query("Select 'Hello world' as message;");
console.log(query.get());


const server = Bun.serve<{ authToken: string }>({
    fetch(req, server) {
        const success = server.upgrade(req);
        const url = new URL(req.url);
        if (success) {
            return undefined;
        }
        if (url.pathname === "/" || url.pathname === "/index.html") {
            return new Response(Bun.file('./client/index.html'));
        }

        if (url.pathname === "/login.html") {
            return new Response(Bun.file('./client/login.html'));
            // return new Response("this is login page");
        }

        // handle HTTP request normally
        return new Response("Hello world!");
    },
    websocket: {
        // when user joins a chat
        open(ws) {
            const msg = `User has entered the chat!`;
            ws.subscribe("gc2");
            ws.publish("gc2", msg);
            ws.send(msg);

        },

        // this is called when a message is received
        async message(ws, message: string) {

            const content = JSON.parse(message);
            const { user, data } = content;
            console.log(`Received ${data} from ${user}`);

            // send back a message
            ws.publish("gc2", `${data}`);
            ws.send(data);
        },

        close(ws) {
            const msg = `User has left the chat`;
            ws.send(msg);
            ws.unsubscribe("gc2");
            ws.publish("gc", msg);

        },
        perMessageDeflate: true,
    },

});

console.log(`Listening on localhost:${server.port}`);

