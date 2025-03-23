import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAppDispatch } from "../../../../hook";
import { WebSocketConnection } from "./wsConnection";
import { updateProfileAction } from "../../webSocketSlice";
import { Board, Player } from "../../../othello/othello";
import { startGameAction } from "../../../othello/othelloSlice";

type WebSocketContextValue = {
  operation: () => void;
};

const WebSocketContext = createContext<WebSocketContextValue>({
  operation: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

type MessagePayload =
  | { type: "init_profile"; data: { client_id: string } }
  | { type: "update_profile"; data: { client_id: string; room_id: string } }
  | { type: "system_message"; data: { message: string } }
  | {
      type: "start_game";
      data: { board: Board; players: Player[]; current_turn_index: 0 };
    }
  | { type: "operation"; data: {} };

const tryParseMessage = (message: string): MessagePayload | undefined => {
  try {
    return JSON.parse(message);
  } catch (e) {
    console.log("failed to parse request");
  }
};

export const WebSocketContextProvider = (props: {
  host: string;
  children: ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const [connection, setConnection] = useState<WebSocketConnection>();

  useEffect(() => {
    const connection = new WebSocketConnection({
      host: props.host,
      openCb: () => {
        console.log("connected server");
      },
      messageCb: (message) => {
        if (message === "") {
          // 空文字のメッセージが飛んでくることがあるため無視する
          return;
        }
        const request = tryParseMessage(message);
        if (!request) {
          return;
        }
        const { type, data } = request;
        switch (type) {
          case "init_profile":
            dispatch(updateProfileAction({ clientID: data.client_id }));
            break;
          case "update_profile":
            if (data.client_id) {
              dispatch(updateProfileAction({ clientID: data.client_id }));
            }
            if (data.room_id) {
              dispatch(updateProfileAction({ roomID: data.room_id }));
            }
            break;
          case "start_game":
            dispatch(
              startGameAction({
                board: data.board,
                players: data.players,
                currentTurnIndex: data.current_turn_index,
              })
            );
            break;
          case "system_message":
            console.log(data.message);
            break;
          default:
            console.log("unknown action", type);
        }
      },
    });
    setConnection(connection);
    return connection.close();
  }, []);

  const operation = () => {
    // TODO: ボードの操作
  };

  return (
    <WebSocketContext.Provider
      value={{
        operation,
      }}
    >
      {props.children}
    </WebSocketContext.Provider>
  );
};
