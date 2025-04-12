import { Meta, StoryObj } from "@storybook/react";
import { OthelloHeader } from ".";

export default {
  title: "OthelloHeader",
  component: OthelloHeader,
  args: {
    diskColor: "white",
    message: "Your Turn",
    gameScore: {
      black: {
        count: 10,
        color: "black",
        player: { cellColor: "black", clientID: "1234" },
      },
      white: {
        count: 5,
        color: "white",
        player: { cellColor: "white", clientID: "1234" },
      },
    },
  },
} as Meta<typeof OthelloHeader>;

export type Story = StoryObj<typeof OthelloHeader>;

export const Default: Story = {
  render: (args) => {
    return <OthelloHeader {...args} />;
  },
};
