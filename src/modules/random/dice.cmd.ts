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
import { MGCommand } from "../../types/command";
import Discord from "discord.js";

const dice: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("dice")
		.setDescription("Roll some dice :O")
		.addIntegerOption((option) =>
			option
				.setName("sides")
				.setDescription("How many sides does each die have?")
				.setRequired(false)
		)
		.addIntegerOption((option) =>
			option
				.setName("dice_count")
				.setDescription("Number of dice you want to roll!")
				.setRequired(false)
		),
	async execute(interaction) {
		const sides: number = interaction.options.getInteger("sides") || 6;
		const dice: number = interaction.options.getInteger("dice_count") || 1;
		if (dice > 200) {
			await interaction.reply({
				content: "Maxigames doesn't own that many dice :(",
				ephemeral: true,
			});
			return;
		}
		if (sides > 1000) {
			await interaction.reply({
				content: "Maxigames doesn't have dice with that many sides :(",
				ephemeral: true,
			});
			return;
		}
		if (dice < 1) {
			await interaction.reply({
				content: ":thinking: Maxigames won't do that.",
				ephemeral: true,
			});
			return;
		}
		if (sides < 2) {
			await interaction.reply({
				content: "Dice can't have that many sides :(",
				ephemeral: true,
			});
			return;
		}
		let dice_rolls = "";
		for (let i = 0; i < dice; i++) {
			const die_roll = Math.ceil(Math.random() * sides);
			dice_rolls += die_roll;
			dice_rolls += " ";
		}
		const Embed = new Discord.MessageEmbed()
			.setColor("#00ff00")
			.setTitle(`Dice roll results for ${dice} dice with ${sides} sides:`)
			.setDescription(`${dice_rolls}`);
		await interaction.reply({
			embeds: [Embed],
		});
	},
};

export default dice;
