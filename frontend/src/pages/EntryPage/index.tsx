import { Logo } from "../../components/Logo";
import { EntryForm } from "../../features/entry/components/EntryForm";
import styles from "./index.module.scss";

export const EntryPage = () => {
  return (
    <div className={styles.entryPage}>
      <div className={styles.centering}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <EntryForm className={styles.entryForm} />
      </div>
    </div>
  );
};
