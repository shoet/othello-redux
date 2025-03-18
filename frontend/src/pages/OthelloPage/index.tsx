import { Othello } from "../../features/othello/components/Othello";
import styles from "./index.module.scss";

export const OthelloPage = () => {
  return (
    <div className={styles.page}>
      <Othello />
    </div>
  );
};
