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

import { SlashCommandBuilder } from '@discordjs/builders';
import {
	CommandInteraction,
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import _ from 'lodash';
import { MGEmbed } from '../../lib/flavoured';
import MGStatus from '../../lib/statuses';
import MGCommand from '../../types/command';
import { MGFirebase } from '../../utils/firebase';

export async function generateTTT(
	board: string[][],
	player1: string,
	player1ID: string,
	player2: string,
	player2ID: string,
	player1Turn: boolean
) {
	const embed = MGEmbed(MGStatus.Success)
		.setTitle('Tic Tac Toe')
		.setDescription(
			`**Player 1** (${player1ID}): ${player1}, **Player 2** (${player2ID}): ${player2}`
		)
		.addFields([
			{
				name: "Player's Turn:",
				value: `${player1Turn ? player1 : player2}`,
			},
			{ name: `${player1} Symbol:`, value: 'O' },
			{ name: `${player2} Symbol:`, value: 'X' },
		]);

	const components = [];
	let count1 = 0;
	for (const i of board) {
		const row = new MessageActionRow();
		count1++;
		let count2 = 0;
		for (const j of i) {
			count2++;
			row.addComponents(
				new MessageButton()
					.setLabel(j)
					.setDisabled(j === '_' ? false : true)
					.setStyle(
						j === 'X' ? 'DANGER' : j === 'O' ? 'SUCCESS' : 'PRIMARY'
					)
					.setCustomId(`tictactoe-${count1}-${count2}-${j}`)
			);
		}
		components.push(row);
	}
	return { embeds: [embed], components: components };
}

export async function generateEndResult(
	board: string[][],
	player1: string,
	player1ID: string,
	player2: string,
	player2ID: string,
	result: endResult
) {
	const components = [];
	let count1 = 0;
	for (const i of board) {
		const row = new MessageActionRow();
		count1++;
		let count2 = 0;
		for (const j of i) {
			count2++;
			row.addComponents(
				new MessageButton()
					.setLabel(j)
					.setDisabled(true)
					.setStyle(
						j === 'X' ? 'DANGER' : j === 'O' ? 'SUCCESS' : 'PRIMARY'
					)
					.setCustomId(`tictactoe-${count1}-${count2}-${j}`)
			);
		}
		components.push(row);
	}

	let embed: MessageEmbed;

	const userData1 = await MGFirebase.getData(`user/${player1ID}`);
	const userData2 = await MGFirebase.getData(`user/${player2ID}`);

	const diff =
		Math.abs(
			userData1['minigames']['tictactoe'] -
				userData2['minigames']['tictactoe']
		) + Math.ceil(Math.random() * 50);

	if (result === endResult.draw) {
		const multFactor = Math.ceil(Math.random() * 25 - Math.random() * 50);
		const change = Math.ceil(diff * multFactor * 0.1);
		userData1['minigames']['tictactoe'] += change;
		userData2['minigames']['tictactoe'] += change;
		embed = MGEmbed(MGStatus.Success)
			.setTitle(`${player1} and ${player2} drew!`)
			.setDescription('Draw by stalemate :O')
			.addFields([
				{ name: `${player1} Rating Change:`, value: `${change}` },
				{
					name: `${player2} Rating Change:`,
					value: `${Math.ceil(change * 1.5)}`,
				},
				{
					name: `${player1} Rating:`,
					value: `${userData1['minigames']['tictactoe']}`,
				},
				{
					name: `${player2} Rating:`,
					value: `${userData2['minigames']['tictactoe']}`,
				},
			]);
	} else if (result === endResult.player1Win) {
		const multFactor = Math.ceil(Math.random() * 50);
		const change = Math.ceil(diff * multFactor * 0.1);
		userData1['minigames']['tictactoe'] += change;
		userData2['minigames']['tictactoe'] -= Math.ceil(change * 1.5);
		embed = MGEmbed(MGStatus.Success)
			.setTitle(`${player2} Won!`)
			.setDescription('Yay!')
			.addFields([
				{ name: `${player1} Rating Change:`, value: `${change}` },
				{
					name: `${player2} Rating Change:`,
					value: `-${Math.ceil(change * 1.5)}`,
				},
				{
					name: `${player1} Rating:`,
					value: `${userData1['minigames']['tictactoe']}`,
				},
				{
					name: `${player2} Rating:`,
					value: `${userData2['minigames']['tictactoe']}`,
				},
			]);
	} else if (result === endResult.player2Win) {
		const multFactor = Math.ceil(Math.random() * 50);
		const change = Math.ceil(diff * multFactor * 0.1);
		userData1['minigames']['tictactoe'] -= Math.ceil(change * 1.5);
		userData2['minigames']['tictactoe'] += change;
		embed = MGEmbed(MGStatus.Success)
			.setTitle(`${player2} Won!`)
			.setDescription('Yay!')
			.addFields([
				{
					name: `${player1} Rating Change:`,
					value: `-${Math.ceil(change * 1.5)}`,
				},
				{ name: `${player2} Rating Change:`, value: `${change}` },
				{
					name: `${player1} Rating:`,
					value: `${userData1['minigames']['tictactoe']}`,
				},
				{
					name: `${player2} Rating:`,
					value: `${userData2['minigames']['tictactoe']}`,
				},
			]);
	} else {
		return;
	}

	await MGFirebase.setData(`user/${player1ID}`, userData1);
	await MGFirebase.setData(`user/${player2ID}`, userData2);
	return { embeds: [embed], components: components };
}

export enum endResult {
	draw = 1,
	player1Win = 2,
	player2Win = 3,
	continue = 4,
}

export function checkForResult(board: string[][]): endResult {
	for (let i = 0; i < board.length; i++) {
		//horizontal
		if (board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
			if (board[0][i] === 'O') {
				return endResult.player1Win;
			} else if (board[0][i] === 'X') {
				return endResult.player2Win;
			}
		}

		//vertical
		if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
			if (board[i][0] === 'O') {
				return endResult.player1Win;
			} else if (board[i][0] === 'X') {
				return endResult.player2Win;
			}
		}
	}

	//diagonal
	if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
		if (board[0][0] === 'O') {
			return endResult.player1Win;
		} else if (board[0][0] === 'X') {
			return endResult.player2Win;
		}
	}
	if (board[2][0] === board[1][1] && board[1][1] === board[0][2]) {
		if (board[0][2] === 'O') {
			return endResult.player1Win;
		} else if (board[0][2] === 'X') {
			return endResult.player2Win;
		}
	}

	//check if the whole board is filled so its a draw
	for (const i of board) {
		for (const j of i) {
			if (j === '_') {
				return endResult.continue;
			}
		}
	}
	return endResult.draw;
}

const tictactoe: MGCommand = {
	data: new SlashCommandBuilder()
		.setName('tictactoe')
		.setDescription('Want to play a tic tac toe game with someone?')
		.addUserOption((option) =>
			option
				.setRequired(true)
				.setName('player2')
				.setDescription('Who else do you want to play with')
		),
	async execute(interaction) {
		const player1 = interaction.user;
		const player2 = interaction.options.getUser('player2', true);

		//disallow playing against yourself
		if (player1 === player2) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error).setTitle(
						"Hey you can't play against yourself!"
					),
				],
			});
			return;
		} else if (player1.bot || player2.bot) {
			//no bots!
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error).setTitle(
						"Hey you can't play against bots!"
					),
				],
			});
			return;
		}

		const board = [
			['_', '_', '_'],
			['_', '_', '_'],
			['_', '_', '_'],
		];

		const ttt = await generateTTT(
			board,
			player1.username,
			player1.id,
			player2.username,
			player2.id,
			true
		);
		await interaction.reply(ttt);
	},
};

export default tictactoe;
