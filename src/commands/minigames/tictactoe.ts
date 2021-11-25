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
	InteractionReplyOptions,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

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
		board
			.map((a) => a.filter((x) => x === 4).length)
			.reduce((x, y) => x + y) === 0
	) {
		return true;
	} else {
		return false;
	}
}

// extdata is appended to the id
function board2components(
	board: TTTBoard,
	extdata: string
): MessageActionRow[] {
	return board.map((a, row) =>
		new MessageActionRow().setComponents(
			...a.map((x, col) =>
				new MessageButton()
					.setLabel(x === 0 ? "X" : x === 1 ? "O" : " ")
					.setDisabled(x === 4 ? false : true)
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
			.setTitle(`Game over!`)
			.setDescription(
				`Congratulations, ${p1ping}, you won! Rating +100.`
			);
	} else if (check_win(board, false)) {
		return MGEmbed(MGStatus.Success)
			.setTitle(`Game over!`)
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
			`${p1id}-${p2id}-${p1turnp}-${lockedp}`
		),
	};
}

const tictactoe: MGCommand = {
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
};

export { TTTBoard, TTTToken, gen_disc_msg, put_token, check_win, check_draw };
export default tictactoe;
