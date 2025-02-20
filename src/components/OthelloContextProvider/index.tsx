import { createContext, PropsWithChildren, useReducer } from "react";
import { OthelloReducer } from "../../features/othello/reducer";
import { OthelloState } from "../../features/othello/state";
import { OthelloAction } from "../../features/othello/actions";
import { Board, getEmptyBoard } from "../../features/othello/othelloSlice";

export const OthelloContext = createContext<{
  state: OthelloState;
  dispatcher: React.ActionDispatch<[OthelloAction]>;
}>({ state: {} as OthelloState, dispatcher: () => {} });

export const OthelloContextProvider = (props: PropsWithChildren) => {
  const initBoard: Board = getEmptyBoard(4);
  const [state, dispatcher] = useReducer(OthelloReducer, {
    board: initBoard,
    currentTermColor: "black",
    players: [
      { name: "taro", cellColor: "white" },
      { name: "jiro", cellColor: "black" },
    ],
    currentPlayerIndex: 0,
  });
  return (
    <OthelloContext.Provider value={{ state: state, dispatcher: dispatcher }}>
      {props.children}
    </OthelloContext.Provider>
  );
};
