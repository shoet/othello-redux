import { Outlet } from "react-router-dom";
import { WebSocketContextProvider } from "./features/websocket/components/WebSocketConnectionProvider";
import { store } from "./store.ts";
import { Provider as StoreProvider } from "react-redux";

function App() {
  const webSocketHost = import.meta.env.VITE_WEB_SOCKET_API_HOST;
  return (
    <StoreProvider store={store}>
      <WebSocketContextProvider host={webSocketHost}>
        <Outlet />
      </WebSocketContextProvider>
    </StoreProvider>
  );
}

export default App;
