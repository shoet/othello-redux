import { Meta, StoryObj } from "@storybook/react";
import { Board } from ".";
import { Cell } from "../../othello";

const cells: Cell[][] = [
  [
    { position: { x: 0, y: 0 }, cellColor: "black" },
    { position: { x: 1, y: 0 }, cellColor: "white" },
    { position: { x: 2, y: 0 } },
    { position: { x: 3, y: 0 } },
    { position: { x: 4, y: 0 } },
    { position: { x: 5, y: 0 } },
    { position: { x: 6, y: 0 } },
    { position: { x: 7, y: 0 } },
  ],
  [
    { position: { x: 0, y: 1 } },
    { position: { x: 1, y: 1 } },
    { position: { x: 2, y: 1 } },
    { position: { x: 3, y: 1 } },
    { position: { x: 4, y: 1 } },
    { position: { x: 5, y: 1 } },
    { position: { x: 6, y: 1 } },
    { position: { x: 7, y: 1 } },
  ],
  [
    { position: { x: 0, y: 2 } },
    { position: { x: 1, y: 2 } },
    { position: { x: 2, y: 2 } },
    { position: { x: 3, y: 2 } },
    { position: { x: 4, y: 2 } },
    { position: { x: 5, y: 2 } },
    { position: { x: 6, y: 2 } },
    { position: { x: 7, y: 2 } },
  ],
  [
    { position: { x: 0, y: 3 } },
    { position: { x: 1, y: 3 } },
    { position: { x: 2, y: 3 } },
    { position: { x: 3, y: 3 } },
    { position: { x: 4, y: 3 } },
    { position: { x: 5, y: 3 } },
    { position: { x: 6, y: 3 } },
    { position: { x: 7, y: 3 } },
  ],
  [
    { position: { x: 0, y: 4 } },
    { position: { x: 1, y: 4 } },
    { position: { x: 2, y: 4 } },
    { position: { x: 3, y: 4 } },
    { position: { x: 4, y: 4 } },
    { position: { x: 5, y: 4 } },
    { position: { x: 6, y: 4 } },
    { position: { x: 7, y: 4 } },
  ],
  [
    { position: { x: 0, y: 5 } },
    { position: { x: 1, y: 5 } },
    { position: { x: 2, y: 5 } },
    { position: { x: 3, y: 5 } },
    { position: { x: 4, y: 5 } },
    { position: { x: 5, y: 5 } },
    { position: { x: 6, y: 5 } },
    { position: { x: 7, y: 5 } },
  ],
  [
    { position: { x: 0, y: 6 } },
    { position: { x: 1, y: 6 } },
    { position: { x: 2, y: 6 } },
    { position: { x: 3, y: 6 } },
    { position: { x: 4, y: 6 } },
    { position: { x: 5, y: 6 } },
    { position: { x: 6, y: 6 } },
    { position: { x: 7, y: 6 } },
  ],
  [
    { position: { x: 0, y: 7 } },
    { position: { x: 1, y: 7 } },
    { position: { x: 2, y: 7 } },
    { position: { x: 3, y: 7 } },
    { position: { x: 4, y: 7 } },
    { position: { x: 5, y: 7 } },
    { position: { x: 6, y: 7 } },
    { position: { x: 7, y: 7 } },
  ],
];

export default {
  title: "Board",
  component: Board,
  args: {
    cells: cells,
  },
} as Meta<typeof Board>;

type Story = StoryObj<typeof Board>;

export const Basic: Story = {};
