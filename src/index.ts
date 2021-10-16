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
import { config, firebaseConfig, apiConfig } from "./utils/config";
import commands from "./commands";
import events from "./events";
import * as admin from "firebase-admin";
import { MGFirebase } from "./utils/firebase";
import { initialGuild } from "./types/firebase";
import moan from "./lib/moan";
import MGS from "./lib/statuses";
import DBL from "top.gg-core";

export const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
	],
	// partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

/*
 * Top.gg Initialisation
 */

const dbl = new DBL.Client(apiConfig["top.GG"]["token"]);
const webhook = new DBL.Webhook(apiConfig["top.GG"]["password"]);

if (process.env.NODE_ENV == "production") {
	webhook.login("/top.gg/bot/863419048041381920/vote", "3000");

	webhook.on("vote", (vote: any) => {
		console.log(`User id: ${vote.user}\nAll data: ${vote}`);
	});
}

/*
 * Event Handlers
 */

// Register event handlers

for (const event of events) {
	if (event.once) {
		client.once(event.name, event.execute);
	} else {
		client.on(event.name, event.execute);
	}

	moan(MGS.Info, `Registered event handler for "${event.name}."`);
}

// Wait for interaction & handle commands
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
	} catch (error) {
		moan(MGS.Error, JSON.stringify(error));

		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
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
	// delete all slash commands before
	const user = client.user;
	let currentGuildCount = client.guilds.cache.size;
	if (process.env.NODE_ENV == "production") {
		dbl.post({ servers: currentGuildCount }).then(
			moan(MGS.Info, "Posted new count to top.gg")
		);
	}

	if (user === null) {
		throw "User is null and this is very bad!!!";
	}

	user.setActivity(`/help on ${currentGuildCount} servers!`, {
		type: "WATCHING",
	}); // initialize activity as "Watching m!help on <number> servers!"

	// change activity on guild join
	client.on("guildCreate", (guild) => {
		moan(MGS.Info, `joined new guild "${guild.name}"`);
		currentGuildCount++;
		if (process.env.NODE_ENV == "production") {
			dbl.post({ servers: currentGuildCount }).then(
				moan(MGS.Info, "Posted new count to top.gg")
			);
		}

		if (user === null) {
			throw "User is null and this is very bad!!!";
		}

		MGFirebase.setData(`server/${guild.id}`, initialGuild);

		user.setActivity(`/help on ${currentGuildCount} servers!`, {
			type: "WATCHING",
		});
	});

	// change activity on guild leave
	client.on("guildDelete", (guild) => {
		moan(MGS.Info, `left guild: "${guild.name}"`);
		currentGuildCount--;
		if (process.env.NODE_ENV == "production") {
			dbl.post({ servers: currentGuildCount }).then(
				moan(MGS.Info, "Posted new count to top.gg")
			);
		}

		if (user === null) {
			throw "User is null and this is very bad!!!";
		}

		user.setActivity(`/help on ${currentGuildCount} servers!`, {
			type: "WATCHING",
		});
	});
});

// Firebase init
MGFirebase.init(client);
