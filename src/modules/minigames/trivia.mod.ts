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
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageInteraction,
} from "discord.js";
import cooldownTest from "../../lib/checks/cooldown";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import withChecks from "../../lib/checks";
import type { MGModule } from "../../types/command";
import { MGFirebase } from "../../lib/firebase";
import { XMLHttpRequest } from "xhr2";
import { decode } from "base-64";

const trivia: MGModule = {
	command: withChecks([cooldownTest(10)], {
		data: new SlashCommandBuilder()
			.setName("trivia")
			.setDescription("Want to play a game of trivia?")
			.addIntegerOption((option) =>
				option
					.setName("questions")
					.setDescription("How many questions do you want? (< 5)")
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName("difficulty")
					.setDescription(
						"What is the difficulty level you want? (harder = more points)"
					)
					.setRequired(true)
					.addChoice("easy", "easy")
					.addChoice("medium", "medium")
					.addChoice("hard", "hard")
			),
		async execute(interaction) {
			const no = interaction.options.getInteger("questions") ?? 1;
			const difficulty =
				interaction.options.getString("difficulty") ?? "hard";
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
			const url = `https://opentdb.com/api.php?amount=${no}&difficulty=${difficulty}&type=multiple&encode=base64`;
			const xhr = new XMLHttpRequest();

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
					const msg: any[] = [];
					const responseText = xhr.responseText;
					const results = JSON.parse(responseText).results;
					const sentMessages: Message[] = [];
					// prettier-ignore
					const timeGiven = difficulty === "easy" ? 5000 : difficulty === "medium" ? 7500 : 10000;

					for (const i of results) {
						const category = decode(i.category);
						const difficulty = decode(i.difficulty);
						const question = decode(i.question);
						const correct_answer = decode(i.correct_answer);
						const incorrect_answers = i.incorrect_answers;
						const incorrect_answers_arr = [];
						for (const j of incorrect_answers) {
							const k = decode(j);
							incorrect_answers_arr.push(k);
						}
						let answers_arr = incorrect_answers_arr;
						answers_arr.push(correct_answer);
						answers_arr = shuffle(answers_arr);

						const embed = MGEmbed(MGStatus.Success)
							.setTitle(`TRIVIA! Question: ${question}`)
							.setDescription(
								`Category: ${category}, Difficulty: ${difficulty}`
							)
							.addFields({
								name: "User ID:",
								value: `${interaction.user.id}`,
							})
							.setFooter(
								`Time Given: ${timeGiven / 1000} seconds`
							);

						const component = new MessageActionRow();
						let count = 1;
						for (const j of answers_arr) {
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
					for (const i of msg) {
						const message = (await interaction.channel?.send({
							embeds: [i[0]],
							components: [i[1]],
						})) as Message;
						sentMessages.push(message);
					}
					setTimeout(async () => {
						// edit messages to disable stuff
						let count = 0;
						for (const i of msg) {
							const oldMessage = sentMessages[count];
							const newMessage =
								await oldMessage.channel.messages.fetch(
									oldMessage.id
								);
							const newMessageComponents = newMessage
								.components[0] as MessageActionRow;
							if (
								newMessageComponents.components[0].customId?.startsWith(
									"DONE"
								)
							) {
								continue;
							}
							const ratingChange = await changeRating(
								interaction,
								false,
								difficulty
							);
							const embed = i[0] as MessageEmbed;
							const component = i[1] as MessageActionRow;
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
							const components =
								component.components as MessageButton[];
							const newComponents = new MessageActionRow();
							for (const j of components) {
								j.setDisabled(true);
								if (j.customId?.startsWith("true")) {
									j.setStyle("SUCCESS");
								} else {
									j.setStyle("DANGER");
								}
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
	}),

	events: [
		{
			name: "interactionCreate",
			async execute(interaction: Interaction) {
				if (!interaction.isButton()) {
					return;
				}

				if (
					interaction.customId.endsWith("trivia") &&
					interaction.message.embeds[0].fields![0].value ===
						interaction.user.id
				) {
					const won = interaction.customId.startsWith("true");
					const difficulty =
						interaction.message.embeds[0].description?.split(":");
					const newRating = await changeRating(
						interaction,
						won,
						difficulty![difficulty!.length - 1] as string
					);
					const message = interaction.message;
					const component = (
						message.components as MessageActionRow[]
					)[0];
					const buttons = component.components as MessageButton[];
					const newComponents = new MessageActionRow();
					const embed = message.embeds[0] as MessageEmbed;
					let count = 0;
					for (const i of buttons) {
						if (i.customId?.startsWith("true")) {
							i.setStyle("SUCCESS");
						} else {
							i.setStyle("DANGER");
						}
						if (i.customId === interaction.customId) {
							i.setStyle("PRIMARY");
						}
						i.setCustomId(`DONE ${count}`);
						i.setDisabled(true);
						newComponents.addComponents(i);
						count++;
					}
					embed.setFooter(`You are ${won ? "CORRECT" : "WRONG"}!`);
					embed.setColor(won ? "GREEN" : "RED");
					embed.addField(
						"Rating Change",
						`${newRating > 0 ? "+" + newRating : newRating}`
					);
					interaction.update({
						embeds: [embed],
						components: [newComponents],
					});
				}
			},
		},
	],
};

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
	const rating = await MGFirebase.getData(`user/${interaction.user.id}`);
	let triviaRating = rating.minigames.trivia;
	let toChange: number;
	const difficultyMultiplier =
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

export default trivia;
