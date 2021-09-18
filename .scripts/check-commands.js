"use strict";
const fs = require("fs");
const path = require("path");
const process = require("process");

const commandFiles = fs
  .readdirSync("./dist/src/commands")
  .map((file) => path.join("./dist/src/commands", file))
  .filter((file) => fs.lstatSync(file).isDirectory())
  .map((dir) =>
    fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".js"))
      .map((file) => path.join(dir, file))
  );

const commandexps = [];

for (const filecol of commandFiles) {
  for (const fname of filecol) {
    const command = require(`../${fname}`); // funny path-fu
    try {
      commandexps.push([command.default.data.name, fname]);
      command.default.data;
      command.default.execute;
    } catch {
      console.error(`Invalid command file: ${fname}`);
      console.error(
        "Error: file containst no default export, or the default export"
      );
      console.error("       does not contain attributes 'data' or 'execute'.");
      console.error(
        "Hint: delete it and its corresponding typescript source file,"
      );
      console.error(
        "      or export placeholder data (e.g. an empty execute function"
      );
      console.error("      with a bare newSlashCommand).");
      process.exit(1);
    }
  }
}

// Handle duplicate command names
let prev = commandexps.sort()[0];
for (const c of commandexps.sort().splice(1)) {
  if (c[0] === prev[0]) {
    console.error(`Invalid command files: ${prev[1]} and ${c[1]}`);
    console.error(`Error: duplicate command name '${c[0]}'.`);
    console.error("Hint: Rename the command in one of the files.");
    process.exit(1);
  }
  prev = c;
}
