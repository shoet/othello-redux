import { EntryForm } from "./_components/EntryForm";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <div className={styles.entryPage}>
      <div className={styles.entryForm}>
        <EntryForm />
      </div>
    </div>
  );
}
