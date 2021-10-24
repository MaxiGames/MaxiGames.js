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
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const choose: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("choose")
		.setDescription("Choose a random item from a list of items!")
		.addStringOption((option) =>
			option
				.setName("choice_list")
				.setDescription(
					"list of possible choices separated by discriminator (default set as space)"
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("discriminator")
				.setDescription(
					"string used to denote the end of a choice (default set as space)"
				)
				.setRequired(false)
		),

	async execute(interaction) {
		let choices = interaction.options.getString("choice_list");
		const discriminator =
			interaction.options.getString("discriminator") || " ";
		if (choices == null) {
			choices = "javascript is stupid";
			// because javascript is stupid and it doesnt realise that this value can't even be null
			// but if it's null then javascript hates me :(
		}
		const choice_list = choices.split(discriminator);
		const item =
			choice_list[Math.floor(Math.random() * choice_list.length)];

		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Info)
					.setTitle("Item Chosen:")
					.setDescription(`${item}`),
			],
		});
	},
};

export default choose;
