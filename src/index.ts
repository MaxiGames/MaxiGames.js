import { Client, Intents } from "discord.js";
import { tokenIdBeta } from "../config.json"; // TODO switch to dotenv

import commands from "./commands";
import events from "./events";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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
