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

import { Client, Intents, TextChannel } from "discord.js";
import { config, firebaseConfig, apiConfig } from "./utils/config";
import commands from "./commands";
import events from "./events";
import * as admin from "firebase-admin";
import { MGFirebase } from "./lib/firebase";
import { initialGuild } from "./types/firebase";
import moan, { setMoan, toLog } from "./lib/moan";
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
			console.log(`User id: ${vote.user}\nAll data: ${vote}`);
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

//setup logging
function logToDiscord() {
	const arr = toLog;
	for (const i of arr) {
		const { status, logged } = i;
		const maxigamesOfficial = client.guilds.cache.get(
			`${
				process.env.NODE_ENV == "production"
					? "837522963389349909"
					: "866939574419849216"
			}`
		)!;
		maxigamesOfficial.channels
			.fetch(
				`${
					process.env.NODE_ENV == "production"
						? "904995742349922304"
						: "905023522278113320"
				}`
			)
			.then((logs) => {
				const botlogs = logs as TextChannel;
				let title: string;
				let colour: string;
				let append: string;
				let toPing = "";
				if (status === MGS.Error) {
					title = "❌";
					colour = "diff";
					append = "-";
					toPing =
						"<@712942935129456671>, <@676748194956181505>, <@782247763542016010>, <@682592012163481616>, <@697747732772814921>";
				} else if (status === MGS.Success) {
					title = "✅";
					colour = "diff";
					append = "+";
				} else if (status === MGS.Info) {
					title = "ℹ️";
					colour = "fix";
					append = ".";
				} else if (status === MGS.Warn) {
					title = "⚠️";
					colour = "fix";
					append = "";
				} else {
					title = "📝";
					colour = "";
					append = "";
				}
				botlogs.send(
					`${toPing}\n\`\`\`${colour}\n${append}${title}: ${logged}\`\`\``
				);
			});
	}
	setMoan();
	setTimeout(() => {
		logToDiscord();
	}, 5000);
}

// set bot activity upon guild events
client.login(config.tokenId).then(() => {
	logToDiscord();

	// delete all slash commands before
	const user = client.user;
	let currentGuildCount = client.guilds.cache.size;
	if (process.env.NODE_ENV == "production") {
		dbl?.post({ servers: currentGuildCount }).then(
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
			dbl?.post({ servers: currentGuildCount }).then(
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
			dbl?.post({ servers: currentGuildCount }).then(
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
