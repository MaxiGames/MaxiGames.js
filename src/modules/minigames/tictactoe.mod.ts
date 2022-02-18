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
	Interaction,
	InteractionReplyOptions,
	MessageActionRow,
	MessageActionRowComponent as MARC,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import type { MGModule } from "../../types/command";
import { MGFirebase as MGFB } from "../../lib/firebase";

const tictactoe: MGModule = {
	command: {
		data: new SlashCommandBuilder()
			.setName("tictactoe")
			.setDescription("Want to play a tic tac toe game with someone?")
			.addUserOption((option) =>
				option
					.setRequired(true)
					.setName("player2")
					.setDescription("the player you want to play with")
			),
		async execute(interaction) {
			const player1 = interaction.user;
			const player2 = interaction.options.getUser("player2", true);

			// disallow playing against yourself
			if (player1 === player2) {
				await interaction.reply({
					embeds: [
						MGEmbed(MGStatus.Error).setTitle(
							"Hey, you can't play against yourself!"
						),
					],
				});
				return;
			} else if (player1.bot || player2.bot) {
				// no bots!
				await interaction.reply({
					embeds: [
						MGEmbed(MGStatus.Error).setTitle(
							"Hey, you can't play against a bot!"
						),
					],
				});
				return;
			}

			const board = [
				[4, 4, 4],
				[4, 4, 4],
				[4, 4, 4],
			] as TTTBoard;

			await interaction.reply(
				gen_disc_msg(board, player1.id, player2.id, true, false)
			);
		},
	},

	events: [
		{
			name: "interactionCreate",
			async execute(interaction: Interaction) {
				const info_str =
					(interaction as ButtonInteraction).customId ?? "";
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
				const lockedp = info_split[7] === "true";

				const board = interaction.message.components!.map((r) =>
					r.components.map((x) =>
						parseInt((x as MARC).customId!.split("-")[3])
					)
				) as TTTBoard;

				if (lockedp) {
					await interaction.reply({
						embeds: [
							MGEmbed(MGStatus.Error)
								.setTitle("Go away, this game is over.")
								.setDescription(
									"...wait, how did you even trigger this?"
								),
						],
						ephemeral: true,
					});
					return;
				}

				if (
					p2id !== interaction.user.id &&
					p1id !== interaction.user.id
				) {
					await interaction.reply({
						embeds: [
							MGEmbed(MGStatus.Info).setTitle(
								"Go away, you're not even part of this game."
							),
						],
						ephemeral: true,
					});
					return;
				}

				if (
					!(
						sel_val === 4 &&
						(p1id === interaction.user.id) === p1turnp
					)
				) {
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

				if (check_gameover(board)) {
					// (this is before the board update)
					await interaction.editReply(
						gen_disc_msg(board, p1id, p2id, p1turnp, true)
					);
					return;
				}

				const newboard = put_token(board, row, col, p1turnp);
				if (check_gameover(newboard)) {
					// (this is before the board update)
					if (!check_draw(newboard)) {
						const p = check_win(newboard, true) ? p1id : p2id;
						await MGFB.setData(
							`user/${p}/minigames/tictactoe`,
							(await MGFB.getData(
								`user/${p}/minigames/tictactoe`
							)) + 100
						);
					}

					await interaction.update(
						gen_disc_msg(newboard, p1id, p2id, p1turnp, true)
					);
					return;
				}

				await interaction.update(
					gen_disc_msg(newboard, p1id, p2id, !p1turnp, false)
				);
			},
		},
	],
};

type TTTToken = 0 | 1 | 4;
type TTTBoard = [
	[TTTToken, TTTToken, TTTToken],
	[TTTToken, TTTToken, TTTToken],
	[TTTToken, TTTToken, TTTToken]
];

// 0 is X, 1 is O, 4 is blank
function put_token(
	board: TTTBoard,
	row: number,
	col: number,
	player1p: boolean
): TTTBoard {
	const ret = board.map((a) => a.map((x) => x)) as TTTBoard;
	ret[row][col] = player1p ? 0 : 1;
	return ret;
}

function check_win(board: TTTBoard, player1p: boolean): boolean {
	const chkval = player1p ? 0 : 3;
	if (
		board[0][0] + board[0][1] + board[0][2] === chkval || // row 0
		board[1][0] + board[1][1] + board[1][2] === chkval || // row 1
		board[2][0] + board[2][1] + board[2][2] === chkval || // row 2
		board[0][0] + board[1][0] + board[2][0] === chkval || // col 0
		board[0][1] + board[1][1] + board[2][1] === chkval || // col 1
		board[0][2] + board[1][2] + board[2][2] === chkval || // col 2
		board[0][0] + board[1][1] + board[2][2] === chkval || // dia 0
		board[0][2] + board[1][1] + board[2][0] === chkval || // dia 1
		false
	) {
		return true;
	} else {
		return false;
	}
}

function check_draw(board: TTTBoard): boolean {
	if (
		!check_win(board, true) &&
		!check_win(board, false) &&
		board
			.map((a) => a.filter((x) => x === 4).length)
			.reduce((x, y) => x + y) === 0
	) {
		return true;
	} else {
		return false;
	}
}

function check_gameover(board: TTTBoard): boolean {
	return (
		check_win(board, true) || check_win(board, false) || check_draw(board)
	);
}

// extdata is appended to the id
function board2components(
	board: TTTBoard,
	extdata: string,
	lockedp: boolean
): MessageActionRow[] {
	return board.map((a, row) =>
		new MessageActionRow().setComponents(
			...a.map((x, col) =>
				new MessageButton()
					.setLabel(x === 0 ? "X" : x === 1 ? "O" : " ")
					.setDisabled(x === 4 && !lockedp ? false : true)
					.setStyle(
						x === 0 ? "DANGER" : x === 1 ? "SUCCESS" : "PRIMARY"
					)
					.setCustomId(`ttt-${row}-${col}-${x}-${extdata}`)
			)
		)
	);
}

function gen_disc_embed(
	board: TTTBoard,
	p1id: string,
	p2id: string,
	p1turnp: boolean
): MessageEmbed {
	const p1ping = `<@${p1id}>`;
	const p2ping = `<@${p2id}>`;

	if (check_draw(board)) {
		return MGEmbed(MGStatus.Success)
			.setTitle("It's a draw!")
			.setDescription(`Well played, ${p1ping} and ${p2ping}!`);
	} else if (check_win(board, true)) {
		return MGEmbed(MGStatus.Success)
			.setTitle("Game over!")
			.setDescription(
				`Congratulations, ${p1ping}, you won! Rating +100.`
			);
	} else if (check_win(board, false)) {
		return MGEmbed(MGStatus.Success)
			.setTitle("Game over!")
			.setDescription(
				`Congratulations, ${p2ping}, you won! Rating +100.`
			);
	}

	return MGEmbed(MGStatus.Info)
		.setTitle("Tic-tac-toe")
		.setDescription(
			`${p1ping} vs ${p2ping}... glhf! ${
				p1turnp ? p1ping : p2ping
			}'s turn.`
		);
}

function gen_disc_msg(
	board: TTTBoard,
	p1id: string,
	p2id: string,
	p1turnp: boolean,
	lockedp: boolean
): InteractionReplyOptions {
	return {
		embeds: [gen_disc_embed(board, p1id, p2id, p1turnp)],
		components: board2components(
			board,
			`${p1id}-${p2id}-${p1turnp}-${lockedp}`,
			lockedp
		),
	};
}

export {
	TTTBoard,
	TTTToken,
	gen_disc_msg,
	put_token,
	check_win,
	check_draw,
	check_gameover,
};
export default tictactoe;
