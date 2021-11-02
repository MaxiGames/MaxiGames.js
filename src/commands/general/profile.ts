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
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import MGCommand from "../../types/command";
import moan from "../../lib/moan";

function calculateRating(userData: any) {
	let str = "";
	for (const i in userData["minigames"]) {
		str += `${i}'s Rating: ${userData["minigames"][i]}\n`;
	}
	return str;
}

const profile: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("View your statistics in the bot!")
		.addUserOption((option) =>
			option
				.setName("user")
				.setRequired(false)
				.setDescription(
					"Do you want to see the profile of another user?"
				)
		),

	async execute(interaction) {
		let user = interaction.options.getUser("user");
		if (user === null) {
			user = interaction.user;
		}
		const userData = await MGFirebase.getData(`user/${user.id}`);
		const embed = MGEmbed(MGStatus.Info)
			.setTitle(`${user.username} #${user.discriminator}'s profile`)
			.setDescription("View your statistics on the bot!")
			.setThumbnail(
				user.avatarURL() ??
					"https://avatars.githubusercontent.com/u/88721933?s=200&v=4"
			)
			.setFields([
				{
					name: "Counting: ",
					value: `Highest Count: ${userData["count"]["highestCount"]} \n Total Counts: ${userData["count"]["totalCount"]}`,
					inline: false,
				},
				{
					name: "Money:",
					value: `${userData["money"]}`,
					inline: false,
				},
				{
					name: "Minigames:",
					value: `${calculateRating(userData)}`,
				},
			]);
		await interaction.reply({
			embeds: [embed],
		});
	},
};

export default profile;
