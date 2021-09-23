/*
 * This file is part of the MaxiGames.js bot.
 * Copyright (C) 2021  the MaxiGames dev team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * File: src/index.ts
 * Description: Main file of MaxiGames
 */

import { Client, Intents } from "discord.js";
import { config, firebaseConfig } from "./utils/config";
import commands from "./commands";
import events from "./events";
import * as admin from "firebase-admin";
import { MGfirebase } from "./utils/firebase";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

/*
 * Event Handlers
 */

// Register event handlers
for (const event of events) {
  if (event.once) client.once(event.name, event.execute);
  else client.on(event.name, event.execute);
}

// Wait for interaction & handle commands
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

/*
 * Utilities like logins
 */

// firebase and maxigames bot login
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseConfig,
});

// set bot activity upon guild events
client.login(config.tokenId).then(() => {
  let user = client.user;
  let currentServerCount = client.guilds.cache.size;

  if (user === null) {
    throw "User is null and this is very bad!!!"; // corner case where user is null (and this is very bad!!!)
  }

  user.setActivity(`m!help on ${currentServerCount} servers!`, {
    type: "WATCHING",
  }); // initialize activity as "Watching m!help on <number> servers!"
  // @AJR Shouldn't this be updated to something like "/mghelp" bcos slash cmds? (AV3_08)

  // change activity on guild join
  client.on("guildCreate", (guild) => {
    console.log("Joined a new guild: " + guild.name); // log it!
    currentServerCount--;

    if (user === null) {
      throw "User is null and this is very bad!!!"; // corner case again
    }

    user.setActivity(`m!help on ${currentServerCount} servers!`, {
      type: "WATCHING",
    });
  });

  // change activity on guild leave
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
MGfirebase.init(client);
