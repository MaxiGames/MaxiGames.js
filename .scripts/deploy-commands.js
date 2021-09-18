"use strict";

const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { config } = require("../dist/src/utils/config.js");

const commands = [];

// NOTE: The directory "commands" should contain subdirectories to organise commands.
const commandFiles = fs
  .readdirSync("./dist/src/commands") // list of dirs in path
  .map((file) => path.join("./dist/src/commands", file)) // ./dist/src/commands/dir
  .filter((file) => fs.lstatSync(file).isDirectory())
  .map((dir) =>
    fs
      .readdirSync(dir)
      .filter((cdir) => fs.lstatSync(path.join(dir, cdir)).isDirectory())
      .flatMap((cdir) =>
        fs
          .readdirSync(path.join(dir, cdir))
          .filter((file) => file.endsWith(".js"))
          .map((file) => path.join(cdir, file))
      )
      .map((file) => path.join(dir, file))
  );

for (const filecol of commandFiles) {
  for (const name of filecol) {
    const command = require(`../${name}`); // funny path-fu
    commands.push(command.default.data.toJSON());
    console.log(`Registered ${name}.`);
  }
}

const rest = new REST({ version: "9" }).setToken(config.tokenId);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: commands,
      }
    );

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
