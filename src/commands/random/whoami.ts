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
import { GuildMember } from "discord.js";

import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const whoami: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("whoami")
		.setDescription("Analyse ur statistics! :D"),
	async execute(interaction) {
		const embed = MGEmbed(MGStatus.Info)
			.setTitle(
				`You are ${interaction.user.username}#${interaction.user.discriminator} :D`
			)
			.setDescription("What a cool name! :D")
			.addFields(
				{
					name: "Created On:",
					value: `${interaction.user.createdAt}`.replace(
						"(Singapore Standard Time)",
						""
					),
				},
				{
					name: "Joined On:",
					value: `${interaction.guild?.joinedAt}`.replace(
						"(Singapore Standard Time)",
						""
					),
				}
			)
			.setThumbnail(`${interaction.user.displayAvatarURL()}`)
			.setFooter(`ID: ${interaction.user.id}`);
		if (interaction.member instanceof GuildMember) {
			const roles: string = interaction.member.roles.cache.reduce(
				(previousValue, currentValue) =>
					`${previousValue} ${currentValue}`
			);
			embed.addField("Roles", roles);
		}

		await interaction.reply({ embeds: [embed] });
	},
};

export default whoami;
