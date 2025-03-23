import { useForm } from "react-hook-form";
import { useAppSelector } from "../../../../hook";
import React, { useEffect } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { useEntryForm } from "./hooks";

export const EntryForm = (props: React.ComponentProps<"div">) => {
  const { ...rest } = props;

  const { joinRoom } = useEntryForm();
  const navigate = useNavigate();
  const roomID = useAppSelector(
    (state) => state.webSocketReducer.currentRoomID
  );
  const clientID = useAppSelector((state) => state.webSocketReducer.clientID);

  const handleOnSubmit = async (clientID: string, roomID: string) => {
    if (clientID && roomID) {
      await joinRoom(clientID, roomID);
    }
  };

  useEffect(() => {
    // サーバーからWebSocketでroomIDを受け取ったら画面遷移する
    if (roomID) {
      navigate("/othello");
    }
  }, [roomID]);

  return (
    <div {...rest}>
      <EntryInnerForm initialClientID={clientID} submit={handleOnSubmit} />
    </div>
  );
};

export const EntryInnerForm = (
  props: {
    initialClientID: string | undefined;
    submit: (clientID: string, roomID: string) => void;
  } & React.ComponentProps<"div">
) => {
  const { initialClientID, submit, ...rest } = props;
  const { register, handleSubmit, reset } = useForm<{
    clientID: string;
    roomID: string;
  }>();
  useEffect(() => {
    reset({ clientID: initialClientID });
  }, [initialClientID]);
  return (
    <div {...rest}>
      <form
        className={styles.form}
        onSubmit={handleSubmit((args) => {
          props.submit(args.clientID, args.roomID);
        })}
      >
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
              {...register("roomID", { min: 1 })}
            />
          </div>
        </div>
        <button className={styles.submitButton} type="submit">
          JoinRoom
        </button>
      </form>
    </div>
  );
};
