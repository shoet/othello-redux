export class WebSocketConnection {
  private host: string;
  private socket: WebSocket;

  constructor(props: {
    host: string;
    /**
     * 接続が確立した際に実行されるコールバック関数
     */
    openCb?: (socket: WebSocket) => void;
    /**
     * メッセージを受信した際に実行されるコールバック関数
     */
    messageCb?: (message: string) => void;
  }) {
    const { host, openCb, messageCb } = props;

    this.host = host;
    this.socket = new WebSocket(`${this.host}`);

    this.socket.addEventListener("open", () => {
      // Connectionが確立したタイミングでpingを送信
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send("ping");
      }

      openCb && openCb(this.socket);
    });

    this.socket.addEventListener("message", (message) => {
      messageCb && messageCb(message.data);
    });
  }

  sendMessage = (message: string) => {
    this.socket.send(message);
  };

  sendCustomMessage = (message: string) => {
    this.socket.send(
      JSON.stringify({ action: "custom_event", message: message })
    );
  };

  close = () => {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  };
}
