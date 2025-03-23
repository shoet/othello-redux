import { useState } from "react";
import { joinRoom } from "../../../../services/joinRoom";

export const useEntryForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const join = async (clientID: string, roomID: string) => {
    setIsLoading(true);
    await joinRoom(clientID, roomID);
    setIsLoading(false);
  };

  return { joinRoom: join, isLoading };
};
