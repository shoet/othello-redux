"use client";

import { useOthelloContext } from "@/app/(othello)/_components/OthelloContextProvider";
import { useRouter } from "next/navigation";

export const EntryForm = () => {
  const { websocketState } = useOthelloContext();
  const router = useRouter();
  return (
    <div>
      <div>client_id: {websocketState.clientID}</div>
      <div onClick={() => router.push("/othello")}>To othello</div>
    </div>
  );
};
