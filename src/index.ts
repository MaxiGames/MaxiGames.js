// import fs from "fs";
// import path from "path";
import { Client, Intents } from "discord.js";
import { tokenId, tokenIdBeta } from "../config.json"; // TODO switch to dotenv

import type MyCommand from "./types/command";
import hallo from "./commands/general/hallo";
import current from "./commands/general/current";
import ping from "./commands/general/ping";

import type MyEvent from "./types/event";
import ready from "./events/ready";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands: { [k: string]: MyCommand } = {
  hallo,
  current,
  ping,
};

const events: MyEvent[] = [ready];

// {{{
// NOTE: The directory "commands" should contain subdirectories to organise js commands.
// const commandFiles: Array<[string, Array<string>]> = fs
//   .readdirSync("./commands")
//   .map((file: string) => "./commands/" + file)
//   .filter((file: string) => fs.lstatSync(file).isDirectory())
//   .map((dir: string) => [
//     dir,
//     fs.readdirSync(dir).filter((file: string) => file.endsWith(".js")),
//   ]);

// const eventFiles = fs
//   .readdirSync("./events")
//   .filter((file) => file.endsWith(".js"));

// for (const file of eventFiles) {
//   const event = require(`./events/${file}`);
//   if (event.once) {
//     client.once(event.name, (...args) => event.execute(...args));
//   } else {
//     client.on(event.name, (...args) => event.execute(...args));
//   }
// }

// for (const filecol of commandFiles) {
//   for (const name of filecol[1]) {
//     const command = require(`./${path.join(filecol[0], name)}`);
//     client.commands.set(command.data.name, command);
//   }
// }
// }}}

// Register event handlers
for (const event of events) {
  if (event.once) client.once(event.name, event.execute);
  else client.on(event.name, event.execute);
}

// Handle commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands[interaction.commandName];
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(tokenIdBeta);
