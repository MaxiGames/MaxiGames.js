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

import { Interaction } from "discord.js";
import { changeRating } from "../../commands/minigames/escapethehouse";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

const escapethehouse = {
	name: "interactionCreate",
	async execute(interaction: Interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (
			interaction.customId.endsWith("escapethehouse") &&
			interaction.message.embeds[0].fields![0].value ===
				interaction.user.id
		) {
			const correct = interaction.customId.startsWith("Correct");
			if (correct) {
				await interaction.update({
					embeds: [
						MGEmbed(MGStatus.Success)
							.setTitle("You guessed correctly!")
							.setDescription(
								`You step inside the door and discover a pot of ${await changeRating(
									interaction,
									correct
								)} rating`
							),
					],
					components: [],
				});
			} else {
				await interaction.update({
					embeds: [
						MGEmbed(MGStatus.Error)
							.setTitle("You guessed wrongly!")
							.setDescription(
								Math.round(Math.random()) === 0
									? `You step inside the door fall into lava, losing ${await changeRating(
											interaction,
											correct
									  )} rating`
									: `You step inside the door and got locked inside, losing ${await changeRating(
											interaction,
											correct
									  )} rating`
							),
					],
					components: [],
				});
			}
		}
	},
};

export default escapethehouse;
