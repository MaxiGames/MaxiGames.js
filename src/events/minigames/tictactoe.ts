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
	ButtonInteraction,
	Interaction,
	MessageActionRowComponent as MARC,
} from "discord.js";
import {
	TTTBoard,
	gen_disc_msg,
	put_token,
	check_win,
	check_draw,
} from "../../commands/minigames/tictactoe";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

const tictactoe = {
	name: "interactionCreate",
	async execute(interaction: Interaction) {
		const info_str = (interaction as ButtonInteraction).customId ?? "";
		if (!(interaction.isButton() && info_str.startsWith("ttt"))) {
			return;
		}

		// parse the info string
		const info_split = info_str.split("-");
		const row = parseInt(info_split[1]);
		const col = parseInt(info_split[2]);
		const sel_val = parseInt(info_split[3]);
		const p1id = info_split[4];
		const p2id = info_split[5];
		const p1turnp = info_split[6] === "true";

		if (!(sel_val === 4 && (p1id === interaction.user.id) === p1turnp)) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Info).setTitle(
						"It's not your turn yet..."
					),
				],
				ephemeral: true,
			});
			return;
		}

		if (p2id !== interaction.user.id && p1id !== interaction.user.id) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Info).setTitle(
						"Go away, you're not even part of this game"
					),
				],
				ephemeral: true,
			});
			return;
		}

		const board = interaction.message.components!.map((r) =>
			r.components.map((x) =>
				parseInt((x as MARC).customId!.split("-")[3])
			)
		) as TTTBoard;

		if (
			check_win(board, true) ||
			check_win(board, false) ||
			check_draw(board)
		) {
			return;
		}

		await interaction.update(
			gen_disc_msg(
				put_token(board, row, col, p1turnp),
				p1id,
				p2id,
				!p1turnp
			)
		);
	},
};

export default tictactoe;
