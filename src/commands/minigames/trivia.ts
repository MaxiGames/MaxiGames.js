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

function shuffle(array: any[]) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}

export async function changeRating(
	interaction: MessageInteraction | ButtonInteraction,
	won: boolean,
	difficulty: string
) {
	let rating = await MGFirebase.getData(`user/${interaction.user.id}`);
	let triviaRating = rating.minigames.trivia;
	let toChange: number;
	let difficultyMultiplier =
		difficulty === "easy" ? 0.2 : difficulty === "medium" ? 0.5 : 1;
	if (won) {
		toChange = Math.ceil(
			triviaRating * 0.05 * Math.random() * 3 * difficultyMultiplier
		);
		triviaRating += toChange;
	} else {
		toChange = -Math.ceil(
			triviaRating * 0.02 * Math.random() * 3 * difficultyMultiplier
		);
		triviaRating += toChange;
	}
	await MGFirebase.setData(
		`user/${interaction.user.id}/minigames/trivia`,
		triviaRating
	);
	return toChange;
}

const trivia: MGCommand = withChecks([cooldownTest(10)], {
	data: new SlashCommandBuilder()
		.setName("trivia")
		.setDescription("Want to play a game of trivia?")
		.addIntegerOption((option) =>
			option
				.setName("questions")
				.setDescription(
					"How many questions do you want? It MUST be less than 5."
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("difficulty")
				.setDescription(
					"What is the difficulty level you want? (The harder the more points you get)"
				)
				.setRequired(true)
				.addChoice("easy", "easy")
				.addChoice("medium", "medium")
				.addChoice("hard", "hard")
		),
	async execute(interaction) {
		let no = interaction.options.getInteger("questions") ?? 1;
		let difficulty = interaction.options.getString("difficulty") ?? "hard";
		if (no > 5) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle("Too many questions!")
						.setDescription(
							"Maximum number of questions to request at one go is 10."
						),
				],
			});
			return;
		}
		let url = `https://opentdb.com/api.php?amount=${no}&difficulty=${difficulty}&type=multiple&encode=base64`;
		let XMLHttpRequest = require("xhr2");
		let xhr = new XMLHttpRequest();

		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Success)
					.setTitle("Retrieving questions!")
					.setDescription("Sending..."),
			],
		});
		xhr.open("GET", url);

		xhr.setRequestHeader("Accept", "application/json");

		xhr.onreadystatechange = async () => {
			if (xhr.readyState === 4) {
				let msg: any[] = [];
				let responseText = xhr.responseText;
				let results = JSON.parse(responseText).results;
				let decode = require("base-64").decode;
				let sentMessages: Message[] = [];
				let timeGiven =
					difficulty === "easy"
						? 5000
						: difficulty === "medium"
						? 7500
						: 10000;
				for (let i of results) {
					let category = decode(i.category);
					let difficulty = decode(i.difficulty);
					let question = decode(i.question);
					let correct_answer = decode(i.correct_answer);
					let incorrect_answers = i.incorrect_answers;
					let incorrect_answers_arr = [];
					for (let j of incorrect_answers) {
						let k = decode(j);
						incorrect_answers_arr.push(k);
					}
					let answers_arr = incorrect_answers_arr;
					answers_arr.push(correct_answer);
					answers_arr = shuffle(answers_arr);

					let embed = MGEmbed(MGStatus.Success)
						.setTitle(`TRIVIA! Question: ${question}`)
						.setDescription(
							`Category: ${category}, Difficulty: ${difficulty}`
						)
						.setFooter(`Time Given: ${timeGiven / 1000} seconds`);

					let component = new MessageActionRow();
					let count = 1;
					for (let j of answers_arr) {
						embed.addField(`Option ${count}:`, j);
						component.addComponents(
							new MessageButton()
								.setLabel(`${count}`)
								.setStyle("SUCCESS")
								.setCustomId(
									j === correct_answer
										? `true${count}trivia`
										: `false${count}trivia`
								)
						);
						count++;
					}
					msg.push([embed, component]);
				}
				for (let i of msg) {
					let message = (await interaction.channel?.send({
						embeds: [i[0]],
						components: [i[1]],
					})) as Message;
					sentMessages.push(message);
				}
				setTimeout(async () => {
					//edit messages to disable stuff
					let count = 0;
					for (let i of msg) {
						let oldMessage = sentMessages[count];
						let newMessage =
							await oldMessage.channel.messages.fetch(
								oldMessage.id
							);
						let newMessageComponents = newMessage
							.components[0] as MessageActionRow;
						if (
							newMessageComponents.components[0].customId?.startsWith(
								"DONE"
							)
						)
							continue;
						let ratingChange = await changeRating(
							interaction,
							false,
							difficulty
						);
						let embed = i[0] as MessageEmbed;
						let component = i[1] as MessageActionRow;
						embed.setFooter("Time's up!");
						embed.addField(
							"Rating Change",
							`${
								ratingChange > 0
									? "+" + ratingChange
									: ratingChange
							}`
						);
						embed.setColor("DARK_NAVY");
						let components =
							component.components as MessageButton[];
						let newComponents = new MessageActionRow();
						for (let j of components) {
							j.setDisabled(true);
							if (j.customId?.startsWith("true"))
								j.setStyle("SUCCESS");
							else j.setStyle("DANGER");
							newComponents.addComponents(j);
						}
						await sentMessages[count].edit({
							embeds: [embed],
							components: [newComponents],
						});
						count++;
					}
				}, timeGiven);
			}
		};
		xhr.send();
	},
});

export default trivia;
