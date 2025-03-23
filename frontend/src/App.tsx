import { Outlet } from "react-router-dom";
import { WebSocketContextProvider } from "./features/websocket/components/WebSocketConnectionProvider";
import { store } from "./store.ts";
import { Provider as StoreProvider } from "react-redux";
import { ReceiveWebSocketMessageContainer } from "./components/ReceiveWebSocketMessageContainer/index.tsx";

function App() {
  const webSocketHost = import.meta.env.VITE_WEB_SOCKET_API_HOST;
  return (
    <WebSocketContextProvider host={webSocketHost}>
      <StoreProvider store={store}>
        <ReceiveWebSocketMessageContainer>
          <Outlet />
        </ReceiveWebSocketMessageContainer>
      </StoreProvider>
    </WebSocketContextProvider>
  );
}

export default App;
