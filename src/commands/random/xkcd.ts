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
import MGCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import https from "https";

const xkcd: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("xkcd")
		.setDescription("Fetch a random xkcd comic or a specific number")
		.addIntegerOption((option) =>
			option
				.setName("number")
				.setDescription("comic #")
				.setRequired(false)
		),
	async execute(interaction) {
		const comicno = interaction.options.getInteger("number") ?? 221;
		const embed = MGEmbed(MGStatus.Info);

		if (!interaction.options.getInteger("number")) {
			embed.title = "Random xkcd";
		} else {
			embed.title = `xkcd #${comicno}`;
		}

		let xkcdjson_str = "";
		https
			.get(`https://xkcd.com/${comicno}/info.0.json`, (response) => {
				response.on("data", (chunk) => (xkcdjson_str += chunk));
				response.on("end", async () => {
					try {
						const xkcdjson = JSON.parse(xkcdjson_str);
						embed.title += `: ${xkcdjson.safe_title}`;
						embed.description = xkcdjson.alt;
						embed.image = { url: xkcdjson.img };
						embed.footer = {
							text: `Comic released on ${xkcdjson.month}/${xkcdjson.day}/${xkcdjson.year}.`,
						};

						await interaction.reply({ embeds: [embed] });
					} catch {
						await interaction.reply(
							"Oops, something went wrong..."
						);
					}
				});
			})
			.on(
				"error",
				(_) =>
					(xkcdjson_str = JSON.stringify({
						month: "3",
						num: "0",
						link: "",
						year: "1984",
						news: "",
						safe_title: "Oopsies",
						transcript: "",
						alt: "Fetch failed to bad comic number/network error.",
						img: "",
						title: "",
						day: "14",
					}))
			);
	},
};

export default xkcd;
