import { Client, Intents } from "discord.js";
import { config, firebaseConfig } from "./utils/config";
import commands from "./commands";
import events from "./events";
import * as admin from "firebase-admin";
import { MGfirebase } from "./utils/firebase";

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Register event handlers
for (const event of events) {
  if (event.once) client.once(event.name, event.execute);
  else client.on(event.name, event.execute);
}

// Wait for interaction wo handle commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return; // do nothing if the interaction isn't a command

  const command = commands.get(interaction.commandName);
  if (!command) return; // same ^

  try {
    await command.execute(interaction); // try to execute function associated with command
    
  } catch (error) {
    console.error(error); // Error encountered! log it ;)
    
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    }); // this should be self-explanatory
    
  }
});

// firebase and maxigames bot login
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseConfig,
});

// Log in bot...
client.login(config.tokenId).then(() => {
  // set activity
  let user = client.user;
  let currentServerCount = client.guilds.cache.size;

  if (user === null) {
    throw "User is null and this is very bad!!!"; // corner case where user is null (and this is very bad!!!)
  }
  user.setActivity(`m!help on ${currentServerCount} servers!`, {
    type: "WATCHING", // ???
  });

  // set activity to change on guild join
  client.on("guildCreate", (guild) => {
    console.log("Joined a new guild: " + guild.name);
    currentServerCount--;

    if (user === null) {
      throw "User is null and this is very bad!!!"; // corner case again
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

// Firebase init
MGfirebase.init();
