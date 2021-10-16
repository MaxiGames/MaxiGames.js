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

import type MGEvent from "../../types/event";
import moan from "../../lib/moan";
import MGS from "../../lib/statuses";
import {
	CommandInteraction,
	EmbedField,
	Interaction,
	MessageActionRow,
	MessageEmbed,
} from "discord.js";
import {
	checkForResult,
	endResult,
	generateEndResult,
	generateTTT,
} from "../../commands/minigames/tictactoe";

const tictactoe = {
	name: "interactionCreate",
	async execute(interaction: Interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId.startsWith("tictactoe")) {
			const row = interaction.message.components as MessageActionRow[];
			const board: string[][] = [];
			let count1 = 0;
			const content = interaction.message.embeds[0].description as string;
			const players = content.split(",");
			const player1 = players[0].split(": ")[1];
			const player2 = players[1].split(": ")[1];
			const player1ID = players[0]
				.split(")")[0]
				.replace("**Player 1** (", "");
			const player2ID = players[1]
				.split(")")[0]
				.replace("**Player 2** (", "")
				.replace(" ", "");
			const fields = interaction.message.embeds[0].fields as EmbedField[];
			const player1Playing = fields[0].value === player1 ? false : true;
			if (fields[0].value === interaction.user.username) {
				//if its the right user pressing button
				const buttonInformation = interaction.customId.split("-");
				for (const i of row) {
					count1++;
					let count2 = 0;
					const components = i.components;
					const row = [];
					for (const j of components) {
						count2++;
						const customID = j.customId!;
						const information = customID.split("-");
						if (
							count1 === parseInt(buttonInformation[1]) &&
							count2 === parseInt(buttonInformation[2])
						) {
							information[3] = player1Playing ? "X" : "O";
						}
						row.push(information[3]);
					}
					board.push(row);
				}

				const result = checkForResult(board);
				if (result === endResult.continue) {
					const msg = await generateTTT(
						board,
						player1,
						player1ID,
						player2,
						player2ID,
						player1Playing
					);
					await interaction.update(msg);
				} else {
					const msg = (await generateEndResult(
						board,
						player1,
						player1ID,
						player2,
						player2ID,
						result
					)) as {
						embeds: MessageEmbed[];
						components: MessageActionRow[];
					};
					await interaction.update(msg);
				}
			}
		}
	},
};

export default tictactoe;
