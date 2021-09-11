"use strict";

const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { config } = require("../dist/src/config.js");

const commands = [];

// NOTE: The directory "commands" should contain subdirectories to organise js commands.
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
    commands.push(command.default.data.toJSON());
    console.log(`Registered ${name}`);
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
