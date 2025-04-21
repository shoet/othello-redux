"use client";

import { useOthelloContext } from "../_components/OthelloContextProvider";

export default function Page() {
  const { websocketState } = useOthelloContext();
  return <div>othello: {websocketState.clientID}</div>;
}
