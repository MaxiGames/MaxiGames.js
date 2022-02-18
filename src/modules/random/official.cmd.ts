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
import { MGCommand } from "../../types/command";

const official: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("official")
		.setDescription("Official Server Invite Link"),
	async execute(interaction) {
		const embed = MGEmbed(MGStatus.Info)
			.setTitle("Official Server Invite Link :D")
			.setDescription(
				"[Clicke ye here to join!](https://discord.gg/nGWhxNG2sf)"
			);

		await interaction.reply({ embeds: [embed] });
	},
};

export default official;
