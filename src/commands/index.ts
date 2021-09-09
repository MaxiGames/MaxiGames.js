import type MyCommand from "../types/command";
import current from "./general/current";
import hallo from "./general/hallo";
import invite from "./general/invite";
import whoami from "./general/whoami";
import epoch from "./general/epoch";
import official from "./general/official";

const commands: { [k: string]: MyCommand } = {
  current,
  hallo,
  invite,
  whoami,
  epoch,
  official,
};

export default commands;
