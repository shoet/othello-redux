import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./store.ts";
import { WebSocketContextProvider } from "./features/websocket/components/WebSocketConnectionProvider/index.tsx";

const webSocketHost = "ws://dummy";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider store={store}>
      <WebSocketContextProvider host={webSocketHost}>
        <App />
      </WebSocketContextProvider>
    </StoreProvider>
  </StrictMode>
);
