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
import withcooldown from "../../lib/cooldown";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";
import { MGFirebase } from "../../lib/firebase";
import cooldownTest from "../../lib/cooldown";
import withChecks from "../../lib/withs";

const gamble: MGCommand = withChecks([cooldownTest(10)], {
	data: new SlashCommandBuilder()
		.setName("share")
		.setDescription(
			"Be kind! Share your money with another member of the server. " +
				"Remember, sharing is caring :D"
		)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Who do you want to share your money to?")
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("How much money are you going to share?")
				.setRequired(true)
		),

	async execute(interaction) {
		const amt = interaction.options.getInteger("amount");
		const usr = interaction.options.getUser("user");

		if (amt === null || usr === null) {
			return;
		}

		if (usr.bot) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle("You can't share money to bots!")
						.setDescription(
							"What are you, a bot? Only a bot shares money to bots smh..."
						),
				],
			});
		}

		const data = await MGFirebase.getData(`user/${interaction.user.id}`);
		if (data === undefined) {
			return;
		}

		if (amt <= 0) {
			const deduct = Math.ceil(Math.random() * 5);
			data["money"] -= deduct;
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle("Stop trying to trick the system, you fool!")
						.setDescription("No negative numbers.")
						.addField("Deducted money:", `${deduct}`),
				],
			});
			MGFirebase.setData(`user/${interaction.user.id}`, data);
			return;
		}

		if (data["money"] < amt) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle("Not enough money!!")
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount required:", value: `${amt}` }
						),
				],
			});
			return;
		}
		// entered user is the same as the command user
		if (usr.id === interaction.user.id) {
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle("Cannot share to yourself >:(!")
						.setDescription(
							"Stop trying to exploit the system!!!!"
						),
				],
			});
			return;
		}

		const otherUserData = await MGFirebase.getData(`user/${usr.id}`);
		if (otherUserData === undefined) {
			return;
		}

		data["money"] -= amt;
		otherUserData["money"] += amt;
		MGFirebase.setData(`user/${usr.id}`, otherUserData);
		MGFirebase.setData(`user/${interaction.user.id}`, data);

		interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Success)
					.setTitle("Success!")
					.setDescription(
						`Thanks for the donation, I'm sure ${usr.username} will appreciate it!`
					)
					.addFields(
						{ name: "Shared:", value: `${amt}`, inline: false },
						{
							name: "Your balance:",
							value: `${data["money"]}`,
							inline: false,
						},
						{
							name: `${usr.username}'s' balance`,
							value: `${otherUserData["money"]}`,
							inline: false,
						}
					),
			],
		});
	},
});

export default gamble;
