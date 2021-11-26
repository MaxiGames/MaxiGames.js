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

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	SelectMenuInteraction,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";
import fs from "fs";
import { lowerCase, startCase } from "lodash";
import { MGFirebase } from "../../lib/firebase";

//load in all the descriptions beforehand
const commandFiles = getDirectories("./dist/src/commands");

const options: { label: string; description: string; value: string }[] = [];

// forming the select menus
for (let dir of commandFiles) {
	let description: String | null = null;
	fs.readFile(
		`./src/commands/${dir}/description.txt`,
		function (error, data) {
			if ((error === undefined || error === null) && data !== undefined) {
				description = data.toString();
			}
			options.push({
				label: dir,
				description: `${
					description === null ? "No description" : description
				}`,
				value: dir,
			});
		}
	);
}

function getDirectories(path: string) {
	return fs.readdirSync(path).filter(function (file) {
		return fs.statSync(path + "/" + file).isDirectory();
	});
}

function getFiles(path: string) {
	return fs.readdirSync(path).filter(function (file) {
		return fs.statSync(path + "/" + file).isFile();
	});
}

export function getLinks() {
	const inviteButton = new MessageButton()
		.setLabel("Invite the bot!")
		.setStyle("LINK")
		.setURL(
			"https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=261188091120&scope=bot%20applications.commands"
		);
	const topGGVote = new MessageButton()
		.setLabel("Vote (Top.gg)")
		.setStyle("LINK")
		.setURL("https://tinyurl.com/votemaxigamesTopgg");
	const discordsVote = new MessageButton()
		.setLabel("Vote (discords.com)")
		.setStyle("LINK")
		.setURL("https://tinyurl.com/votemaxigamesDiscordcom");
	const supportServer = new MessageButton()
		.setLabel("Support Server")
		.setStyle("LINK")
		.setURL("https://discord.gg/BNm87Cvdx3");
	return [inviteButton, topGGVote, discordsVote, supportServer];
}

export async function mainHelp(
	interaction: SelectMenuInteraction | CommandInteraction,
	page: string
) {
	const row = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId("help-main")
			.setPlaceholder(page === "main" ? "Initial landing page" : page)
			.addOptions(options)
	);

	//making the buttons
	const [inviteButton, topGGVote, discordsVote, supportServer] = getLinks();

	const row2 = new MessageActionRow().addComponents(
		inviteButton,
		topGGVote,
		discordsVote,
		supportServer
	);

	if (page === "main") {
		return {
			embeds: [
				MGEmbed(MGStatus.Success)
					.setTitle("Help!")
					.setDescription(
						"Hallo! Thank you for using MaxiGames, featuring tons of fun and great MiniGames! This bot is built by <@712942935129456671>, <@682592012163481616>, <@676748194956181505>, <@697747732772814921> and <@782247763542016010>."
					)
					.setThumbnail(
						"https://avatars.githubusercontent.com/u/88721933?s=200&v=4"
					),
			],
			components: [row, row2],
		};
	}

	//if its a category page, find the commands
	const cmds = getFiles(`./dist/src/commands/${lowerCase(page)}/`);
	const fields: { name: string; value: string; inline: boolean }[] = [];

	let counter = 1;
	for (const i of cmds) {
		let curDescription = require(`../${lowerCase(page)}/${i}`);
		fields.push({
			name: `${counter}. ${startCase(i.replace(".js", ""))}`,
			value: `${
				curDescription.default.data.description === undefined
					? "No description."
					: curDescription.default.data.description
			}`,
			inline: false,
		});
		counter++;
	}

	let version = await MGFirebase.getData("version");

	return {
		embeds: [
			MGEmbed(MGStatus.Success)
				.setTitle("MaxiGames Help!")
				.setDescription(`Category: **${startCase(page)}**`)
				.addFields(fields)
				.setFooter(`Version: ${version}. Built with discord.js :)`)
				.setThumbnail(
					"https://avatars.githubusercontent.com/u/88721933?s=200&v=4"
				),
		],
		components: [row, row2],
	};
}

const help: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Find out the details of certain commands"),

	async execute(interaction) {
		await interaction.reply(await mainHelp(interaction, "main"));
	},
};

export default help;
