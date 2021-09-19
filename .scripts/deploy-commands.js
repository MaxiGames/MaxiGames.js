"use strict";

const fs = require("fs");
const path = require("path");
const env = require("process").env;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { config } = require("../dist/src/utils/config.js");

const commands = [];

// NOTE: The directory "commands" should contain subdirectories to organise commands.
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
    if (env.NODE_ENV === "production") {
      await rest.put(Routes.applicationCommands(config.clientId), {
        body: commands,
      });
    } else {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        {
          body: commands,
        }
      );
    }

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
