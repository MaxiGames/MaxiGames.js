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

import {
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { changeRating } from "../../commands/minigames/guessthecolour";
import MGStatus from "../../lib/statuses";

const guessthecolour = {
	name: "interactionCreate",
	async execute(interaction: Interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (
			interaction.customId.endsWith("guessthecolour") &&
			interaction.message.embeds[0].fields![0].value ===
				interaction.user.id
		) {
			let won = interaction.customId.startsWith("CORRECT");
			let valueChange = await changeRating(interaction, won);
			let embed = interaction.message.embeds[0] as MessageEmbed;
			let components = interaction.message.components![0];
			embed.setDescription(`${won === true ? "Correct!" : "Wrong!"}`);
			embed.addFields([
				{
					name: "Rating Change:",
					value: `${valueChange > 0 ? "+" : ""}${valueChange}`,
				},
			]);
			let newComponents = new MessageActionRow();
			for (let i of components.components) {
				let button = i as MessageButton;
				if (button.customId?.startsWith("CORRECT"))
					button.setStyle("SUCCESS");
				else if (button.customId === interaction.customId)
					button.setStyle("PRIMARY");
				else button.setStyle("DANGER");
				button.setDisabled(true);
				newComponents.addComponents([button]);
			}
			await interaction.update({
				embeds: [embed],
				components: [newComponents],
			});
		}
	},
};

export default guessthecolour;
