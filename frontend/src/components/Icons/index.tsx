import { CSSProperties, ReactNode } from "react";
import styles from "./index.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

type IconProps = {
  backgroundColor: string;
  size: number;
};

export const withIconStyle = (Icon: ReactNode) => {
  return (props: IconProps) => {
    const style = {
      "--color": props.backgroundColor,
      "--font-size": `${props.size}px`,
    } as CSSProperties;
    return (
      <span className={styles.icon} style={style} {...props}>
        {Icon}
      </span>
    );
  };
};

export const OthelloDiskIcon = withIconStyle(
  <FontAwesomeIcon icon={faCircle} />
);
