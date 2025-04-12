import { OthelloDiskIcon } from "../../../../components/Icons";
import { theme } from "../../../../theme";
import { CellColor } from "../../othello";

export const Disk = (props: { color: CellColor; size?: number }) => {
  const { color: cellColor, size = 40 } = props;
  const color =
    cellColor == "black"
      ? theme.othello.diskBlackColor
      : theme.othello.diskWhiteColor;
  return <OthelloDiskIcon backgroundColor={color} size={size} />;
};
