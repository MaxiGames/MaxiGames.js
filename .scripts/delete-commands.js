"use strict";

const fs = require("fs");
const path = require("path");
const env = require("process").env;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { config } = require("../dist/src/utils/config.js");

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

const rest = new REST({ version: "9" }).setToken(config.tokenId);

//delete slash commands
rest.get(Routes.applicationCommands(config.clientId)).then((data) => {
  const promises = [];
  for (const command of data) {
    const deleteUrl = `${Routes.applicationCommands(config.clientId)}/${
      command.id
    }`;
    promises.push(rest.delete(deleteUrl));
  }
  console.log("Successfully deleted all commands.");
  return Promise.all(promises);
});
