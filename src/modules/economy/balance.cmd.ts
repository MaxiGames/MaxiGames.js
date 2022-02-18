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
 * File: src/commands.economy/balance.ts
 * Description: Handles balance command
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import type { MGCommand } from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import commandLog from "../../lib/comamndlog";

const balance: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("balance")
		.setDescription("Check your balance! Do you have money to spare? :D")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"You can use this option to check another users' balance."
				)
				.setRequired(false)
		),

	async execute(interaction) {
		let user = interaction.options.getUser("user");
		if (user === null) {
			user = interaction.user;
		}
		const data = await MGFirebase.getData(`user/${user.id}`);

		if (data === undefined) {
			return;
		}

		const embed = MGEmbed(MGStatus.Info)
			.setTitle(`${user.username} #${user.discriminator}'s balance!`)
			.setDescription("MaxiCoins!")
			.addFields({ name: "Balance", value: `${data.money} MaxiCoins` });

		commandLog(
			"balance",
			`${interaction.user.id}`,
			`User checked their balance: ${data.money} MaxiCoins`
		);

		await interaction.reply({ embeds: [embed] });
	},
};

export default balance;
