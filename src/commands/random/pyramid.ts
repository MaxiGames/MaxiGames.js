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

const pyramid: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("pyramid")
		.setDescription("Print a pyramid")
		.addIntegerOption((option) =>
			option
				.setName("height")
				.setDescription("Height of pyramid")
				.setRequired(true)
		),

	async execute(interaction) {
		// RePLiCate a string c n times
		function rplc(c: string, n: number) {
			let r = "";
			for (let i = 0; i < n; i++) {
				r += c;
			}
			return r;
		}

		const height: number = interaction.options.getInteger("height")!;

		// ¡C°NSTRÜCT LE PYRÁMÏD!
		let pyr = "```";
		for (let i = 1; i <= height; i++) {
			pyr += rplc(" ", height - i);
			pyr += rplc("*", 2 * i - 1);
			pyr += "\n";
		}
		pyr += "```";

		const embed = MGEmbed().setTitle("Pyramid!").setDescription(pyr);

		await interaction.reply({ embeds: [embed] });
	},
};

export default pyramid;
