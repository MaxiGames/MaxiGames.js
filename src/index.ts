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
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as admin from "firebase-admin";
import { config, firebaseConfig, apiConfig } from "./utils/config";
import { commands, events } from "./modules";
import { MGFirebase } from "./lib/firebase";
import { defaultGuild } from "./types/firebase";
import moan from "./lib/moan";
import { trycatcherr } from "./lib/misc";
import MGS from "./lib/statuses";
import DBL from "top.gg-core";
import logToDiscord from "./utils/log";
import ActivityDetails from "./utils/activityPanel";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "REACTION"],
});

/*
 * Top.gg Initialisation
 */

let dbl: any | undefined, webhook: any | undefined;

try {
  dbl = new DBL.Client(apiConfig["top.GG"]["token"]);
  webhook = new DBL.Webhook(apiConfig["top.GG"]["password"]);

  if (process.env.NODE_ENV == "production") {
    webhook.login("/top.gg/bot/863419048041381920/vote", "3000");

    webhook.on("vote", (vote: any) => {
      moan(MGS.Info, `User id: ${vote.user}\nAll data: ${vote}`);
    });
  }
} catch {
  moan(MGS.Error, "Top.gg API not responding!");
}

/*
 * Event Handlers
 */

// Register event handlers

for (const event of events) {
  if (event.once) {
    client.once(event.name, async (...args) => {
      try {
        await event.execute(...args);
      } catch (e) {
        trycatcherr(
          async () =>
            await args[0].channel.send(
              "An has error ocurred. Please check the bot permissions " +
                "(make sure it has administrator permissions in this channel). " +
                "If the issue still persists, please submit a `/bugreport`"
            )
        );
      }
    });
  } else {
    client.on(event.name, async (...args) => {
      try {
        await event.execute(...args);
      } catch (e) {
        trycatcherr(
          async () =>
            await args[0].channel.send(
              "An error ocurred. Please check the bot permissions " +
                "(make sure it has administrator permissions in this channel). " +
                "if the issue still persists, please submit a `\\bugreport`"
            )
        );
      }
    });
  }

  moan(MGS.Info, `Registered event handler for "${event.name}."`);
}

// Wait for interactions & handle commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (e) {
    moan(MGS.Error, (e as Error).stack);

    trycatcherr(
      async () =>
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        })
    );
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

MGFirebase.init(client);

// set bot activity upon guild events
client.login(config.tokenId).then(() => {
  logToDiscord(client);

  // delete all slash commands before
  const user = client.user;
  let currentGuildCount = client.guilds.cache.size;
  if (process.env.NODE_ENV == "production") {
    dbl
      ?.post({ servers: currentGuildCount })
      .then(moan(MGS.Info, "Posted new count to top.gg"));
  }

  if (user === null) {
    throw "User is null and this is very bad!!!";
  }

  // get activity panel rolling!
  const activityManager = new ActivityDetails(currentGuildCount);
  activityManager.updateActivity(client);

  // change activity on guild join
  client.on("guildCreate", (guild) => {
    moan(MGS.Info, `Joined new guild "${guild.name}."`);

    currentGuildCount++;
    activityManager.currentGuildCount++;
    if (process.env.NODE_ENV == "production") {
      dbl
        ?.post({ servers: currentGuildCount })
        .then(moan(MGS.Info, "Posted new count to top.gg"));
    }
    MGFirebase.setData(`server/${guild.id}`, defaultGuild);

    // push slash commands
    const rest = new REST({ version: "9" }).setToken(config.tokenId);
    const commandsjson = [];

    for (const [_, cmd] of commands.entries()) {
      if (cmd.data.toJSON) {
        commandsjson.push(cmd.data.toJSON());
      }
    }

    try {
      rest.put(Routes.applicationGuildCommands(config.clientId, guild.id), {
        body: commandsjson,
      });
    } catch (e) {
      moan(MGS.Error, e);
    }
  });

  // change activity on guild leave
  client.on("guildDelete", (guild) => {
    moan(MGS.Info, `left guild: "${guild.name}"`);
    currentGuildCount--;
    activityManager.currentGuildCount--;
    if (process.env.NODE_ENV == "production") {
      dbl
        ?.post({ servers: currentGuildCount })
        .then(moan(MGS.Info, "Posted new count to top.gg"));
    }
  });
});
