export type MessageCallback = (message: string) => void;

export class WebSocketConnection {
  private host: string;
  private socket?: WebSocket;
  private messageCbs: { [name: string]: MessageCallback } = {};
  connected: boolean = false;

  constructor(props: { host: string }) {
    const { host } = props;

    this.host = host;
  }

  connect = (openCb?: (socket: WebSocket) => void) => {
    this.socket = new WebSocket(`${this.host}`);

    this.socket.addEventListener("open", () => {
      // Connectionが確立したタイミングでpingを送信
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket && openCb && openCb(this.socket);
        this.socket.send("ping");
      }
    });

    this.socket.addEventListener("message", (message) => {
      Object.values(this.messageCbs).forEach((cb) => {
        cb(message.data);
      });
    });
  };

  sendMessage = (message: string) => {
    this.socket?.send(message);
  };

  sendCustomMessage = (message: string) => {
    this.socket?.send(
      JSON.stringify({ action: "custom_event", message: message })
    );
  };

  addMessageCb = (name: string, cb: MessageCallback) => {
    this.messageCbs[name] = cb;
  };

  removeMessageCb = (name: string) => {
    delete this.messageCbs[name];
  };

  close = () => {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket?.close();
    }
  };
}
