import { ColorResolvable } from "discord.js";
import MGStatus from "./statuses";

const COLOR_PALETTE: { [k in MGStatus]: ColorResolvable } = {
  [MGStatus.Info]: "#81a1c1",
  [MGStatus.Default]: "#4c566a",
  [MGStatus.Warn]: "#ebcb8b",
  [MGStatus.Success]: "#a3be8c",
  [MGStatus.Error]: "#bf616a",
};

export default COLOR_PALETTE;
