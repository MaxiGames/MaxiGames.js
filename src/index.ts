import { Client, Intents } from "discord.js";
import { tokenIdBeta } from "../config.json"; // TODO switch to dotenv

import type MyCommand from "./types/command";
import current from "./commands/general/current";
import hallo from "./commands/general/hallo";
import pog from "./commands/general/pog";
import ping from "./commands/general/ping";

import type MyEvent from "./types/event";
import ready from "./events/ready";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands: { [k: string]: MyCommand } = {
  hallo,
  current,
  ping,
  pog,
};

const events: MyEvent[] = [ready];

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
