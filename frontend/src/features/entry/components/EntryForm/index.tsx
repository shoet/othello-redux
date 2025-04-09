import { useForm } from "react-hook-form";
import { useAppSelector } from "../../../../hook";
import React, { useEffect } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { useEntryForm } from "./hooks";
import clsx from "clsx";

export const EntryForm = (props: React.ComponentProps<"div">) => {
  const { ...rest } = props;

  const { joinRoom } = useEntryForm();
  const navigate = useNavigate();
  const roomID = useAppSelector(
    (state) => state.webSocketReducer.currentRoomID
  );
  const clientID = useAppSelector((state) => state.webSocketReducer.clientID);

  const handleJoinRoom = async (clientID: string, roomID: string) => {
    await joinRoom(clientID, roomID);
  };

  const handleVsCPU = async (clientID: string) => {
    // TODO: CPU対戦の実装
  };

  useEffect(() => {
    // サーバーからWebSocketでroomIDを受け取ったら画面遷移する
    if (roomID) {
      navigate("/othello");
    }
  }, [roomID]);

  return (
    <div {...rest}>
      <EntryInnerForm
        initialClientID={clientID}
        onClickJoinRoom={handleJoinRoom}
        onClickVsCPU={handleVsCPU}
      />
    </div>
  );
};

export const EntryInnerForm = (
  props: {
    initialClientID: string | undefined;
    onClickJoinRoom: (clientID: string, roomID: string) => void;
    onClickVsCPU: (clientID: string) => void;
  } & React.ComponentProps<"div">
) => {
  const { initialClientID, onClickJoinRoom, onClickVsCPU, ...rest } = props;
  const { register, reset, trigger, getValues, setError } = useForm<{
    clientID: string;
    roomID: string;
  }>();
  useEffect(() => {
    reset({ clientID: initialClientID });
  }, [initialClientID]);

  const handleClickJoinRoom = async () => {
    const result = await trigger();
    if (!result) {
      return;
    }
    const { clientID, roomID } = getValues();
    if (!roomID || roomID === "") {
      setError("roomID", { message: "RoomID is required" });
      return;
    }
    onClickJoinRoom(clientID, roomID);
  };

  const handleClickVsCPU = async () => {
    const result = await trigger();
    if (!result) {
      return;
    }
    const { clientID } = getValues();
    onClickVsCPU(clientID);
  };

  return (
    <div {...rest}>
      <div className={styles.form}>
        <div className={styles.clientID}>
          <div>
            <label className={styles.formLabel} htmlFor="clientID">
              ClientID
            </label>
            <input
              className={styles.formInput}
              type="text"
              {...register("clientID", { min: 1 })}
              disabled={props.initialClientID !== undefined}
            />
          </div>
        </div>
        <div className={styles.roomID}>
          <div>
            <label className={styles.formLabel} htmlFor="roomID">
              RoomID
            </label>
            <input
              className={styles.formInput}
              type="text"
              {...register("roomID", { required: false })}
            />
          </div>
        </div>
        <div className={styles.buttonArea}>
          <button
            className={clsx(styles.button, styles.joinRoomButton)}
            type="submit"
            onClick={handleClickJoinRoom}
          >
            JoinRoom
          </button>
          <button
            className={clsx(styles.button, styles.vsCPUButton)}
            type="submit"
            onClick={handleClickVsCPU}
          >
            VS CPU
          </button>
        </div>
      </div>
    </div>
  );
};
