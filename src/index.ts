import { Client, Intents } from "discord.js";
import { config, firebaseConfig } from "./utils/config";
import commands from "./commands";
import events from "./events";
import * as admin from "firebase-admin";
import { FirebaseManager } from "./utils/firebase";

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Register event handler
for (const event of events) {
  if (event.once) client.once(event.name, event.execute);
  else client.on(event.name, event.execute);
}

// Handle commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);
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

//!firebase and maxigames bot login
console.log({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseConfig,
});
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseConfig,
});

client.login(config.tokenId).then(() => {
  // set activity
  let user = client.user;
  let currentServerCount = client.guilds.cache.size;

  if (user === null) {
    throw "User is null and this is very bad!!!";
  }
  user.setActivity(`m!help on ${currentServerCount} servers!`, {
    type: "WATCHING",
  });

  //set activity to change on guild join
  client.on("guildCreate", (guild) => {
    console.log("Joined a new guild: " + guild.name);
    currentServerCount--;

    if (user === null) {
      throw "User is null and this is very bad!!!";
    }
    user.setActivity(`m!help on ${currentServerCount} servers!`, {
      type: "WATCHING",
    });
  });

  client.on("guildDelete", (guild) => {
    console.log("Left a guild: " + guild.name);
    currentServerCount++;

    if (user === null) {
      throw "User is null and this is very bad!!!";
    }
    user.setActivity(`m!help on ${currentServerCount} servers!`, {
      type: "WATCHING",
    });
  });
});

//! Firebase init
let firebase = new FirebaseManager();
