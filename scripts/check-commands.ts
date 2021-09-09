export {};

const fs = require("fs");
const path = require("path");
import { exit } from "process";

const commands: Array<JSON> = [];

// NOTE: The directory "commands" should contain subdirectories to organise js commands.
const commandFiles: Array<[string, Array<string>]> = fs
  .readdirSync("./dist/src/commands")
  .map((file: string) => path.join("./dist/src/commands", file))
  .filter((file: string) => fs.lstatSync(file).isDirectory())
  .map((dir: string) => [
    dir,
    fs.readdirSync(dir).filter((file: string) => file.endsWith(".js")),
  ]);

for (const filecol of commandFiles) {
  for (const name of filecol[1]) {
    const command = require(`../${path.join(filecol[0], name)}`); // funny path-fu
    try {
      command.default.data.toJSON();
    } catch {
      exit(1);
    }
  }
}

exit(0);
