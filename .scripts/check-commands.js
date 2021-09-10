"use strict";
const fs = require("fs");
const path = require("path");
const process = require("process");

const commands = [];

const commandFiles = fs
  .readdirSync("./dist/src/commands")
  .map((file) => path.join("./dist/src/commands", file))
  .filter((file) => fs.lstatSync(file).isDirectory())
  .map((dir) => [
    dir,
    fs.readdirSync(dir).filter((file) => file.endsWith(".js")),
  ]);

for (const filecol of commandFiles) {
  for (const name of filecol[1]) {
    const command = require(`../${path.join(filecol[0], name)}`); // funny path-fu
    try {
      commands.push(command.default.data.toJSON());
    } catch {
      console.error(`Invalid command file: ${path.join(filecol[0], name)}`);
      console.error(`Hint: delete it and its corresponding typescript source`);
      console.error(`      file, or export placeholder data (e.g. an empty`);
      console.error(`      execute function with a bare newSlashCommand).`);
      process.exit(1);
    }
  }
}
