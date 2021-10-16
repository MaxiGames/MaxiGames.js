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

const Discord = require("discord.js");
const fibo: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("fibo")
		.setDescription("Find the Nth fibonacci number! :D")
		.addIntegerOption((option) =>
			option
				.setName("number")
				.setDescription("Which fibonacci number do you want?")
				.setRequired(true)
		),
	async execute(interaction) {
		const num = interaction.options.getInteger("number") || 1;
		if (num > 1000) {
			await interaction.reply({
				content: "Oh no we have a character limit that's too big :(",
				ephemeral: true,
			});
		} else if (num < 1) {
			await interaction.reply({
				content: "hMmmmMmm sussy baka :D",
				ephemeral: true,
			});
		} else {
			let pog = 1;
			let pog2 = 1;
			let pog2store = 1;
			// fibo variables :D
			for (let i = 0; i < num - 1; i++) {
				pog2store = pog2;
				pog2 = pog + pog2;
				pog = pog2store;
			}
			const Embed = new Discord.MessageEmbed()
				.setColor("#00ff00")
				.setTitle(
					`The ${num}${
						num > 3 ? "th" : ["st", "nd", "rd"][num - 1]
					} fibonacci number is:`
				)
				.setDescription(`${pog2}! :D`);
			await interaction.reply({
				embeds: [Embed],
			});
		}
	},
};

export default fibo;
