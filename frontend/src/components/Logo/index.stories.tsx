import { Meta, StoryObj } from "@storybook/react";
import { Logo } from ".";

export default {
  component: Logo,
  title: "Logo",
} as Meta<typeof Logo>;

export type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  render: (args) => {
    return (
      <div
        style={{
          backgroundColor: "gray",
          height: "100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Logo {...args} />
      </div>
    );
  },
};
