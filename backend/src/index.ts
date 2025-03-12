import { Hono } from "hono";
import { getBoardUsecase } from "./usecase/getBoard";

export const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/get_board", (c) => {
  const roomID = c.req.query("room_id");
  if (!roomID) {
    return c.json({ error: "room_id is required" }, 400);
  }
  const board = getBoardUsecase(roomID);
  return c.json({ board }, 200);
});

export default app;
