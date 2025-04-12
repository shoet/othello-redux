import { Meta, StoryObj } from "@storybook/react";
import { ScoreDisk } from ".";

export default {
  title: "ScoreDisk",
  component: ScoreDisk,
} as Meta<typeof ScoreDisk>;

export type Story = StoryObj<typeof ScoreDisk>;

export const Default: Story = {
  args: {
    color: "white",
    count: 5,
  },

  render: (args) => {
    return (
      <div
        style={{
          backgroundColor: "green",
          width: "100px",
          height: "100px",
        }}
      >
        <ScoreDisk {...args} />
      </div>
    );
  },
};
