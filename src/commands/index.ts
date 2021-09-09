import fs from "fs";
import path from "path";
import type MyCommand from "../types/command";

const commands: Map<string, MyCommand> = new Map();

// NOTE: The directory "commands" should contain subdirectories to organise js commands.
const commandFiles: Array<[string, Array<string>]> = fs
  .readdirSync("./dist/src/commands")
  .map((file: string) => path.join("./dist/src/commands", file))
  .filter((file: string) => fs.lstatSync(file).isDirectory())
  .map((dir: string) => [
    path.basename(dir),
    fs.readdirSync(dir).filter((file: string) => file.endsWith(".js")),
  ]);

for (const filecol of commandFiles) {
  for (const name of filecol[1]) {
    const command = require(`./${path.join(filecol[0], name)}`);
    commands.set(command.default.data.name, command.default);
  }
}

export default commands;
