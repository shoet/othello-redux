"use client";

import React, { ComponentProps, useEffect } from "react";
import { Board, Player } from "@/features/othello";
import { useOthelloContext } from "../OthelloContextProvider";
import { useWebSocket } from "../WebSocketContextProvider";

type ReceiveMessagePayload =
  | { type: "init_profile"; data: { client_id: string } }
  | { type: "update_profile"; data: { client_id: string; room_id: string } }
  | { type: "system_message"; data: { message: string } }
  | {
      type: "start_game";
      data: {
        board: Board;
        board_id: string;
        players: Player[];
        current_turn_index: 0;
      };
    }
  | {
      type: "update_board";
      data: {
        board: Board;
        is_end_game: boolean;
        current_turn_index: number;
      };
    };

const tryParseMessage = (
  message: string
): ReceiveMessagePayload | undefined => {
  try {
    return JSON.parse(message);
  } catch (e) {
    console.log("failed to parse request");
  }
};
/**
 * ReceiveWebSocketMessageContainer は、WebSocketから受け取ったメッセージからdispatchするコンポーネントです。
 */
export const ReceiveWebSocketMessageContainer = (
  props: ComponentProps<"div">
) => {
  const { updateProfile, startGame, updateBoard } = useOthelloContext();
  const { connect, disconnect, registerCallback, removeCallback } =
    useWebSocket();
  const handleReceiveMessage = (message: string) => {
    const request = tryParseMessage(message);
    if (!request) {
      return;
    }
    const { type, data } = request;
    switch (type) {
      case "init_profile":
        updateProfile({ clientID: data.client_id });
        break;
      case "update_profile":
        updateProfile({ clientID: data.client_id, roomID: data.room_id });
        break;
      case "start_game":
        startGame({
          board: data.board,
          boardID: data.board_id,
          players: data.players,
          currentTurnIndex: data.current_turn_index,
        });
        break;
      case "update_board":
        updateBoard({
          board: data.board,
          isEndGame: data.is_end_game,
          currentTurnIndex: data.current_turn_index,
        });
        break;
      case "system_message":
        console.log(data.message);
        break;
      default:
        console.log("unknown action", type);
    }
  };

  useEffect(() => {
    registerCallback("receive_message", handleReceiveMessage);
    connect();
    return () => {
      removeCallback("receive_message");
      disconnect();
    };
  }, []);

  return <div>{props.children}</div>;
};
