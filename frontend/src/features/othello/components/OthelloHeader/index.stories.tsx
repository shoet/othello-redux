import { Meta, StoryObj } from "@storybook/react";
import { OthelloHeader } from ".";
import { theme } from "../../../../theme";

export default {
  title: "OthelloHeader",
  component: OthelloHeader,
  args: {
    turnPlayer: {
      clientID: "shoet",
      cellColor: "black",
    },
  },
} as Meta<typeof OthelloHeader>;

export type Story = StoryObj<typeof OthelloHeader>;

export const Default: Story = {
  render: (args) => {
    return (
      <div style={{ backgroundColor: theme.othello.backgrounddColor }}>
        <OthelloHeader {...args} />
      </div>
    );
  },
};
