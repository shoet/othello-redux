import { ComponentProps } from "react";
import styles from "./index.module.scss";

export const Logo = (props: ComponentProps<"div">) => {
  return (
    <div className={styles.logo} {...props}>
      <img src="/logo.png" alt="Logo" />
    </div>
  );
};
