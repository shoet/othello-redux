import { createContext, ReactNode, useContext } from "react";
import { MessageCallback, WebSocketConnection } from "./wsConnection";

type WebSocketContextValue = {
  connect: () => void;
  disconnect: () => void;
  registerCallback: (name: string, cb: (message: string) => void) => void;
  removeCallback: (name: string) => void;
  sendCustomMessage: (message: string) => void;
};

const WebSocketContext = createContext<WebSocketContextValue>({
  connect: () => {},
  disconnect: () => {},
  registerCallback: () => {},
  removeCallback: () => {},
  sendCustomMessage: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketContextProvider = (props: {
  host: string;
  children: ReactNode;
}) => {
  const connection = new WebSocketConnection({
    host: props.host,
  });

  const connect = () => {
    connection?.connect(() => {
      console.log("connected");
    });
  };

  const disconnect = () => {
    connection?.close();
  };

  const registerCallback = (name: string, cb: MessageCallback) => {
    connection?.addMessageCb(name, cb);
  };

  const removeCallback = (name: string) => {
    connection?.removeMessageCb(name);
  };

  const sendCustomMessage = (message: string) => {
    connection?.sendCustomMessage(message);
  };

  return (
    <WebSocketContext.Provider
      value={{
        connect,
        disconnect,
        registerCallback,
        removeCallback,
        sendCustomMessage,
      }}
    >
      {props.children}
    </WebSocketContext.Provider>
  );
};
