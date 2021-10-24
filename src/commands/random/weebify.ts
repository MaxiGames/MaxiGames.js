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
import MGCommand from "../../types/command";
import Discord from "discord.js";

const weebify: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("weebify")
		.setDescription("Change your message to become a weeb!")
		.addStringOption((option) =>
			option
				.setName("message")
				.setDescription(
					"can only contain alphabetical characters or spaces"
				)
				.setRequired(true)
		),
	async execute(interaction) {
		let msg = interaction.options.getString("message") || "Invalid :(";
		if (msg.length > 1000) {
			const Embed = new Discord.MessageEmbed()
				.setColor("#ff0000")
				.setTitle("Your message is too long! Try a shorter one.");
			await interaction.reply({
				embeds: [Embed],
				ephemeral: true,
			});
			return;
		}
		msg = msg.toLowerCase();
		const alphabet = "abcdefghijklmnopqrstuvwxyz ";
		for (let i = 0; i < msg.length; i++) {
			if (!alphabet.includes(msg[i])) {
				await interaction.reply({
					content:
						"Your string contains non-alphabetical characters!",
					ephemeral: true,
				});
				return;
			}
		}
		let message_2 = msg;
		for (let i = 0; i < 26; i++) {
			let message_1 = message_2;
			message_2 = message_2.replace(
				alphabet[i] + alphabet[i],
				alphabet[i]
			);
			let message_2_storage = message_2;
			while (message_1 != message_2) {
				message_2_storage = message_2;
				message_2 = message_2.replace(
					alphabet[i] + alphabet[i],
					alphabet[i]
				);
				message_1 = message_2_storage;
			}
		}
		let number_of_chars_added = 0;
		for (let ii = 0; ii < message_2.length; ii++) {
			const i = ii + number_of_chars_added;
			if (i != message_2.length) {
				const mchar = message_2[i];
				const nchar = message_2[i + 1];
				if (
					mchar != "a" &&
					mchar != "e" &&
					mchar != "i" &&
					mchar != "o" &&
					mchar != "u" &&
					nchar != "a" &&
					nchar != "e" &&
					nchar != "i" &&
					nchar != "o" &&
					nchar != "u"
				) {
					if (
						mchar === "b" ||
						mchar === "f" ||
						mchar === "l" ||
						mchar === "r" ||
						mchar === "z"
					) {
						message_2 =
							message_2.substring(0, i + 1) +
							"u" +
							message_2.substring(i + 1, message_2.length);
					} else if (
						mchar === "d" ||
						mchar === "h" ||
						mchar === "p" ||
						mchar === "s" ||
						mchar === "w"
					) {
						message_2 =
							message_2.substring(0, i + 1) +
							"a" +
							message_2.substring(i + 1, message_2.length);
					} else if (
						mchar === "g" ||
						mchar === "m" ||
						mchar === "n" ||
						mchar === "t" ||
						mchar === "y"
					) {
						message_2 =
							message_2.substring(0, i + 1) +
							"o" +
							message_2.substring(i + 1, message_2.length);
					} else if (mchar === "j" || mchar === "k") {
						message_2 =
							message_2.substring(
								0,
								i + 1 + number_of_chars_added
							) +
							"i" +
							message_2.substring(
								i + 1 + number_of_chars_added,
								message_2.length
							);
					}
					number_of_chars_added += 1;
				}
			} else {
				const mchar = message_2[i];
				if (
					mchar != "a" &&
					mchar != "e" &&
					mchar != "i" &&
					mchar != "o" &&
					mchar != "u"
				) {
					if (
						mchar === "b" ||
						mchar === "f" ||
						mchar === "l" ||
						mchar === "r" ||
						mchar === "z"
					) {
						message_2 =
							message_2.substring(0, i + 1) +
							"u" +
							message_2.substring(i + 1, message_2.length);
					} else if (
						mchar === "d" ||
						mchar === "h" ||
						mchar === "p" ||
						mchar === "s" ||
						mchar === "w"
					) {
						message_2 =
							message_2.substring(0, i + 1) +
							"a" +
							message_2.substring(i + 1, message_2.length);
					} else if (
						mchar === "g" ||
						mchar === "m" ||
						mchar === "n" ||
						mchar === "t" ||
						mchar === "y"
					) {
						message_2 =
							message_2.substring(0, i + 1) +
							"o" +
							message_2.substring(i + 1, message_2.length);
					} else if (mchar === "j" || mchar === "k") {
						message_2 =
							message_2.substring(
								0,
								i + 1 + number_of_chars_added
							) +
							"i" +
							message_2.substring(
								i + 1 + number_of_chars_added,
								message_2.length
							);
					}
					number_of_chars_added += 1;
				}
			}
		}

		const Embed = new Discord.MessageEmbed()
			.setColor("#00ff00")
			.setTitle("Your weebified message: ")
			.setDescription(`${message_2}`);
		await interaction.reply({
			embeds: [Embed],
		});
	},
};

export default weebify;
