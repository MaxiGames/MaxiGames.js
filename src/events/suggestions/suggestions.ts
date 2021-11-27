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

import { ButtonInteraction, Message, TextChannel } from "discord.js";
import { MGFirebase } from "../../lib/firebase";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

const escapethehouse = {
	name: "interactionCreate",
	async execute(interaction: ButtonInteraction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId.endsWith("suggestions")) {
			if (
				interaction.user.id! in
				[
					"697747732772814921",
					"682592012163481616",
					"712942935129456671",
					"782247763542016010",
					"676748194956181505",
				]
			)
				await interaction.reply({
					ephemeral: true,
					content: "Only bot owners can trigger this.",
				});
			else {
				//is a bot owner
				let message = interaction.message as Message;
				let suggestion = message.embeds[0].description;
				let author = message.embeds[0]
					.title!.split("(")[1]
					.replace(")", "")!;
				let user = interaction.client.users.cache.get(author)!;
				await interaction.reply({
					content: "What is your reason?",
					ephemeral: true,
				});
				message.channel
					.awaitMessages({ max: 1, time: 30000 })
					.then(async (messages) => {
						let reason = messages.first()!.content;
						let success = interaction.customId.startsWith("Accept");
						let added = 0;

						if (success) {
							added = Math.ceil(Math.random() * 100);
							let data = await MGFirebase.getData(
								`user/${author}`
							);
							data["money"] += added;
							await MGFirebase.setData(`user/${author}`, data);
						}

						//resolve the suggestion
						await message.delete();
						await messages.first()!.delete();
						let channel = interaction.client.channels.cache.get(
							process.env.NODE_ENV == "production"
								? "882646341799542824"
								: "873835031880163330"
						) as TextChannel;
						await channel.send({
							embeds: [
								MGEmbed(
									success ? MGStatus.Success : MGStatus.Error
								)
									.setTitle(
										success
											? "Suggestion Accepted"
											: "Suggestion Rejected"
									)
									.setDescription("Suggestion: " + suggestion)
									.setFields([
										{
											name: "Admin's reason:",
											value: reason,
										},
										{
											name: "Money Added:",
											value: `${added}`,
										},
									])
									.setFooter(
										`Suggested by ${user.username}#${user.discriminator} (${user.id}), reviewed by ${interaction.user.username}#${interaction.user.discriminator}.`
									),
							],
						});

						//DM the user
						await user.send({
							embeds: [
								MGEmbed(
									success ? MGStatus.Success : MGStatus.Error
								)
									.setTitle(
										success
											? "Suggestion Accepted"
											: "Suggestion Rejected"
									)
									.setDescription("Suggestion: " + suggestion)
									.setFields([
										{
											name: "Admin's reason:",
											value: reason,
										},
										{
											name: "Money Added:",
											value: `${added}`,
										},
									])
									.setFooter(
										`Suggested by ${user.username}#${user.discriminator} (${user.id}), reviewed by ${interaction.user.username}#${interaction.user.discriminator}.`
									),
							],
						});
					})
					.catch(async () => {
						await interaction.editReply("Timeout.");
					});
			}
		}
	},
};

export default escapethehouse;
