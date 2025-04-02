"use client";

import {
  MessageCallback,
  WebSocketConnection,
} from "@/lib/webSocketConnection";
import React, { useContext } from "react";

type WebSocketContextType = {
  connect: () => void;
  disconnect: () => void;
  registerCallback: (name: string, cb: (message: string) => void) => void;
  removeCallback: (name: string) => void;
  sendCustomMessage: (message: string) => void;
};

const WebSocketContext = React.createContext<WebSocketContextType>({
  connect: () => {},
  disconnect: () => {},
  registerCallback: () => {},
  removeCallback: () => {},
  sendCustomMessage: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketContextProvider = (props: {
  host: string;
  children: React.ReactNode;
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
