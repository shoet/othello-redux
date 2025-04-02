import { OthelloContextProvider } from "./_components/OthelloContextProvider";
import { ReceiveWebSocketMessageContainer } from "./_components/ReceiveWebSocketMessageContainer";
import { WebSocketContextProvider } from "./_components/WebSocketContextProvider";

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props;
  const host = process.env.NEXT_PUBLIC_WEB_SOCKET_HOST || "";
  return (
    <WebSocketContextProvider host={host}>
      <OthelloContextProvider>
        <ReceiveWebSocketMessageContainer>
          {children}
        </ReceiveWebSocketMessageContainer>
      </OthelloContextProvider>
    </WebSocketContextProvider>
  );
}
