import path from 'path';
import { WebSocketService } from '../services/WebSocketService';
import { WebSocketMessage, UserSocketMap } from '../types/';
import fs from "fs";

const service = new WebSocketService();

export interface ExtendedWebSocket extends WebSocket {
  id?: string
  userId?: string;
  deviceId?: string;
  _socket?: any;
}



export async function handleMessage(
  ws: ExtendedWebSocket,
  rawMessage: string,
  userSockets: Map<string, WebSocket>

): Promise<void> {
  let data: WebSocketMessage;
  let eventType: string;
  let eventBody: any;

  try {
    data = JSON.parse(rawMessage);
    eventType = data.action ?? 'unknown';
    eventBody = data.body ?? {};
    if (eventType == 'SCAN_INIT' || eventType == 'SCAN_RESULT') {
      // const shortTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // // Output: 2025-10-15-13-11-45
      // const fileName = "request_" + shortTimestamp + '.json';
      // fs.writeFileSync(path.join(__dirname, "/../../requests/" + fileName), JSON.stringify(data, null, 2));
      writeLog(data);
    }
  } catch {
    console.error('Invalid JSON:', rawMessage);
    writeLog(rawMessage);
    return;
  }
  let response: any = null;
  switch (eventType) {
    case 'REGISTER':
      if (eventBody.user_id) {
        ws['userId'] = eventBody.user_id;
        ws['deviceId'] = eventBody.device_id;
        eventBody.socket_id = ws.id;
        userSockets.set(eventBody.user_id, ws);
        await service.registerUser(eventBody);
      }
      break;

    case 'disconnect':
      if (ws['userId'] && ws['deviceId']) {
        userSockets.delete(ws['userId']);
        await service.markUserDisconnected(ws['deviceId']);
      }
      break;

    case 'SCAN_INIT':
      response = await service.addScanInitRequest(eventBody).catch((err: any) => {
        ws.send(JSON.stringify({ action: 'error', 'body': err.message }))
      })
      if (response) {
        ws.send(JSON.stringify({ action: 'SCAN_INIT_COMPLETE', ...response }))
      }
      break
    case 'SCAN_RESULT':
      // console.log("Result payload", eventBody)
      response = await service.addVintelScanInitRequest(eventBody).catch((err: any) => {
        ws.send(JSON.stringify({ action: 'error', 'body': err.message }))
      })
      if (response) {
        ws.send(JSON.stringify({ action: 'SCAN_RESULT_COMPLETE', ...response }))
      }
      break
    case 'SCAN_QUERY':
      // console.log("Result payload", eventBody)
      response = await service.checkScan(eventBody).catch((err: any) => {
        ws.send(JSON.stringify({ action: 'error', 'body': err.message }))
      })
      if (response) {
        ws.send(JSON.stringify({ action: 'SCAN_QUERY_COMPLETE', ...response }))
      }
      break
    case 'ping':
      ws.send("pong");
      break
    case 'message':
      if (data.toUserId && data.message) {
        await service.sendMessageToUser(data.toUserId, data.message, userSockets);
      }
      break;

    default:
      console.log('Unknown action:', data.action);
      break;
  }
}

const writeLog = async (content: any) => {
  const now = new Date();

  // Format folder name as YYYY-MM-DD
  const folderName = now.toISOString().slice(0, 10); // e.g., "2025-10-15"

  // Format timestamp for filename
  const timestamp = now.toISOString().replace(/[:.]/g, '-'); // e.g., "2025-10-15T13-11-45-123Z"

  // Define paths
  const baseDir = path.join(__dirname, '/../../requests');
  const folderPath = path.join(baseDir, folderName);
  const fileName = `request_${timestamp}.json`;
  const filePath = path.join(folderPath, fileName);

  // Create folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

  // console.log(`File saved to ${filePath}`);


}