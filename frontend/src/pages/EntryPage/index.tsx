import { EntryForm } from "../../features/entry/components/EntryForm";
import styles from "./index.module.scss";

export const EntryPage = () => {
  return (
    <div className={styles.entryPage}>
      <EntryForm className={styles.entryForm} />
    </div>
  );
};
