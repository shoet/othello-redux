import { useNavigate } from "react-router-dom";
import { EntryForm } from "../../features/entry/components/EntryForm";
import styles from "./index.module.scss";

export const EntryPage = () => {
  const navigate = useNavigate();

  // 入室処理が完了して、WebSocketから返信があったらothelloページに遷移する
  return (
    <div className={styles.entryPage}>
      <EntryForm className={styles.entryForm} />
    </div>
  );
};
