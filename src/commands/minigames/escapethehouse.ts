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
	ButtonInteraction,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageInteraction,
} from "discord.js";
import cooldownTest from "../../lib/cooldown";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import withChecks from "../../lib/withs";
import MGCommand from "../../types/command";
import { MGFirebase } from "../../utils/firebase";

export async function changeRating(
	interaction: MessageInteraction | ButtonInteraction,
	won: boolean
) {
	let escapeRating = await MGFirebase.getData(
		`user/${interaction.user.id}/minigames/guessthecolour`
	);
	let toChange: number;
	if (won) {
		toChange = Math.ceil(escapeRating * 2 * Math.random() * 3);
		escapeRating += toChange;
	} else {
		toChange = -Math.ceil(escapeRating * 0.2 * Math.random() * 3);
		escapeRating += toChange;
	}
	await MGFirebase.setData(
		`user/${interaction.user.id}/minigames/escapethehouse`,
		escapeRating
	);
	return toChange;
}

const escapeTheHouse: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("escapethehouse")
		.setDescription("Guess which door leads to the right place!"),
	async execute(interaction) {
		let doorNumber = Math.ceil(Math.random() * 2);
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Default)
					.setTitle("Escape the house!")
					.setDescription(
						"Select which door leads to the right location"
					)
					.setFields([
						{ name: "Player-ID", value: `${interaction.user.id}` },
					]),
			],
			components: [
				new MessageActionRow().addComponents([
					new MessageButton()
						.setLabel("1")
						.setEmoji("🚪")
						.setStyle("PRIMARY")
						.setCustomId(
							`${
								doorNumber === 1 ? "Correct" : "Wrong"
							}1escapethehouse`
						),
					new MessageButton()
						.setLabel("2")
						.setEmoji("🚪")
						.setStyle("PRIMARY")
						.setCustomId(
							`${
								doorNumber === 2 ? "Correct" : "Wrong"
							}2escapethehouse`
						),
					new MessageButton()
						.setLabel("3")
						.setEmoji("🚪")
						.setStyle("PRIMARY")
						.setCustomId(
							`${
								doorNumber === 3 ? "Correct" : "Wrong"
							}3escapethehouse`
						),
				]),
			],
		});
	},
};

export default escapeTheHouse;
