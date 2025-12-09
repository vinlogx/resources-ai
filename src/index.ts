import express, { Express, Request, Response } from "express";
import http from "http"
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require("path");
dotenv.config();

import AuthRoute from "./routes/auth"
import AIRouter from "./routes/AIRouter";


const app: Express = express();
const port = process.env.PORT || 3000;
// const isDev = process.env.NODE_ENV !== 'production';
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


server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
