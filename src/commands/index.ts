/*
 * File: <src root>/commands/index.ts
 * Description: indexes all commands in this directory.
 */

import fs from "fs";
import path from "path";
import type MGCommand from "../types/command";

const commands: Map<string, MGCommand> = new Map();

// NOTE: The directory "commands" should contain subdirectories to organise commands.
// get command files
const commandFiles: Array<Array<string>> = fs
  .readdirSync("./dist/src/commands") // list of dirs in path
  .map((file: string) => path.join("./dist/src/commands", file)) // ./dist/src/commands/dir
  .filter((file: string) => fs.lstatSync(file).isDirectory())
  .map((dir: string) =>
    fs
      .readdirSync(dir)
      .filter((cdir: string) =>
        fs.lstatSync(path.join(dir, cdir)).isDirectory()
      )
      .flatMap((cdir: string) =>
        fs
          .readdirSync(path.join(dir, cdir))
          .filter((file: string) => file.endsWith(".js"))
          .map((file: string) => path.join(cdir, file))
      )
      .map((file: string) => path.join(dir, file))
  );

// load 'em in!
for (const filecol of commandFiles) {
  for (const name of filecol) {
    const command = require(`./${name}`);
    commands.set(command.default.data.name, command.default);
  }
}

export default commands;
