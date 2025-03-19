import { useForm } from "react-hook-form";
import { useAppSelector } from "../../../../hook";
import React, { useMemo } from "react";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";

export const EntryForm = (props: React.ComponentProps<"div">) => {
  const { ...rest } = props;

  const navigate = useNavigate();
  const roomID = useAppSelector(
    (state) => state.webSocketReducer.currentRoomID
  );
  const clientID = useAppSelector((state) => state.webSocketReducer.clientID);

  const handleOnSubmit = (clientID: string, roomID: string) => {
    if (clientID && roomID) {
      // HTTPエンドポイントにjoin_roomリクエストを送り、成功したら画面遷移して待機する
      // 返されたroom_idをセットする
    }
  };

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
  const { register, handleSubmit } = useForm<{
    clientID: string;
    roomID: string;
  }>();
  return useMemo(() => {
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
                value={props.initialClientID}
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
  }, [initialClientID, submit]);
};
