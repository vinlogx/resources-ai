export interface WebSocketMessage {
  action: string;
  body?:any;
  userId?: string;
  toUserId?: string;
  message?: string;

}

export interface UserSocketMap {
  [userId: string]: WebSocket;
}

