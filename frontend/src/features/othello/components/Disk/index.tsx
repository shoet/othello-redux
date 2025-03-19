import { OthelloDiskIcon } from "../../../../components/Icons";
import { theme } from "../../../../theme";
import { CellColor } from "../../othello";

export const Disk = (props: { color: CellColor }) => {
  const color =
    props.color == "black"
      ? theme.othello.diskBlackColor
      : theme.othello.diskWhiteColor;
  return <OthelloDiskIcon backgroundColor={color} size={40} />;
};
