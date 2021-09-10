import { ColorResolvable } from "discord.js";
import { MGStatus as s } from "./statuses";

const COLOR_PALETTE: { [k in s]: ColorResolvable } = {
  [s.MGInfo]: "#81a1c1",
  [s.MGDefault]: "#4c566a",
  [s.MGSuccess]: "#4c566a",
  [s.MGWarn]: "#a3be8c",
  [s.MGError]: "#bf616a",
};

export default COLOR_PALETTE;
