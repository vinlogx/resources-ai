import express, { Express, Request, Response } from "express";
import fs from 'fs';
import https from "https"
import http from "http"
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { decryptMessage, encryptMessage } from "./utils/crypto";
import { v4 as uuidv4 } from 'uuid';


import { UserSocketMap } from "./types/"
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require("path");
dotenv.config();

import AuthRoute from "./routes/auth"
import { handleMessage } from './routes/WebSocketRouter';
import AIRouter from "./routes/AIRouter";


const app: Express = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';
let server: any = null;

const JWT_SECRET = process.env.JWT_SECRET!;

const staticPath = path.join(__dirname, "../public");
const corsOption = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  origin(_origin: any, callback: any) {
    callback(null, true);
  },
  credentials: true,
};
app.use(cors(corsOption));
app.use(express.static(staticPath));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("All Good here.");
});

app.use("/auth", AuthRoute);
app.use("/ai", AIRouter);

const userSockets: Map<string, any> = new Map();



//if(isDev){
server = http.createServer(app);
//}else{
//    server = https.createServer({
//        key: fs.readFileSync(process.env.SSL_KEY_PATH!),
//        cert: fs.readFileSync(process.env.SSL_CERT_PATH!)
//    }, app);
//}

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: any, req: Request) => {
  const socketId = uuidv4(); // generate unique ID
  (ws as any).id = socketId; // assign to socket


  const token = req.headers['sec-websocket-protocol'];

  // if (!token) return ws.close(1008, 'Missing token');

  /* try {
    const user = jwt.verify(token, JWT_SECRET);
    ws.user = user;
  } catch {
    return ws.close(1008, 'Invalid token');
  } */

  ws.on('message', (msg: string) => {

    try {
      handleMessage(ws, msg, userSockets);
      /* const payload = JSON.parse(msg);
       console.log("message:", payload) 
      //const decrypted = isDev ? msg : decryptMessage(msg.toString());
      const decrypted = msg;
      //console.log(`From ${ws.user.sub}:`, decrypted);
      console.log("Message Received:", msg) 

      // const response = isDev ? "Hello" :  encryptMessage(`Hello ${ws.user.sub}`);
      const response = {action: "test", body: "hello"};
      ws.send(JSON.stringify(response)); */
    } catch (err: any) {
      console.log("Socket Error: ", err, err.message);
      ws.send(JSON.stringify({ action: 'error', body: { message: err.message } }))
    }
  });

  ws.on('close', () => {
    const userId = ws['userId'];
    if (userId) {
      userSockets.delete(userId);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const service = new (require('./services/WebSocketService').WebSocketService)();
      service.markUserDisconnected(userId);
    }
  });


});

server.listen(port, '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
