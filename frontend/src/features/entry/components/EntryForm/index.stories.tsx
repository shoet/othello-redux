import { EntryInnerForm } from ".";
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "EntryInnerForm",
  component: EntryInnerForm,
} as Meta<typeof EntryInnerForm>;

type Story = StoryObj<typeof EntryInnerForm>;

export const Default: Story = {};

export const DisableClientID: Story = {
  args: {
    initialClientID: "xxxxxxxxxx",
  },
};
