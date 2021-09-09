import type MyCommand from "../types/command";
import current from "./general/current";
import hallo from "./general/hallo";
import ping from "./general/ping";
import pog from "./general/pog";

const commands: { [k: string]: MyCommand } = { current, hallo, ping, pog };

export default commands;
