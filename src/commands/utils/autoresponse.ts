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
import type MGCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../utils/firebase";
import { Permissions, CommandInteraction, Guild } from "discord.js";
import withChecks from "../../lib/withs";
import cooldownTest from "../../lib/cooldown";
import { userPermsTest } from "../../lib/permscheck";

async function addAutoresponse(interaction: CommandInteraction, data: any) {
	let autoresponse = data["autoresponse"];
	let trigger = interaction.options.getString("trigger")!;
	let response = interaction.options.getString("response")!;
	if (autoresponse[trigger]) {
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Error)
					.setTitle("That autoresponse already exists!")
					.setDescription(
						"Remove it first using /autoresponse remove!"
					),
			],
		});
		return;
	}
	data["autoresponse"][trigger] = response;
	await MGFirebase.setData(`guild/${interaction.guild!.id}`, data);
	await interaction.reply({
		embeds: [
			MGEmbed(MGStatus.Success)
				.setTitle("Autoresponse added!")
				.setDescription(`Trigger: ${trigger}, Response: ${response}`),
		],
	});
}

async function removeAutoresponse(interaction: CommandInteraction, data: any) {
	let autoresponse = data["autoresponse"];
	let trigger = interaction.options.getString("trigger")!;
	if (!autoresponse[trigger]) {
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Error)
					.setTitle("That autoresponse does not exist!")
					.setDescription(
						"You can't remove an autoresponse that doesn't exist!"
					),
			],
		});
		return;
	}
	delete data["autoresponse"][trigger];
	await MGFirebase.setData(`guild/${interaction.guild!.id}`, data);
	await interaction.reply({
		embeds: [
			MGEmbed(MGStatus.Success)
				.setTitle("Autoresponse deleted!")
				.setDescription(
					`Autresponse with trigger: ${trigger} successfully removed.`
				),
		],
	});
}

async function listAutoresponse(interaction: CommandInteraction, data: any) {
	let autoresponse = data["autoresponse"];
	let embed = MGEmbed(MGStatus.Success)
		.setTitle(`Autoresponses for ${interaction.guild!.name}`)
		.setDescription("[Number]. [Trigger]: [Response]");
	let str = "";
	let count = 0;
	for (let i in autoresponse) {
		str += `${count}. **${i}:** ${autoresponse[i]} \n`;
		count++;
	}
	embed.addField("Autoresponses", str);
	await interaction.reply({ embeds: [embed] });
}

const autoresponse: MGCommand = withChecks(
	[userPermsTest(Permissions.FLAGS.ADMINISTRATOR)],
	{
		data: new SlashCommandBuilder()
			.setName("autorsponse")
			.setDescription("configure your server's autoresponses!")
			.addSubcommand((subcommand) =>
				subcommand
					.setName("add")
					.setDescription("add an autoresponse")
					.addStringOption((option) =>
						option
							.setName("trigger")
							.setDescription("What triggers the autoresponse?")
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("response")
							.setDescription("What should we respond with?")
							.setRequired(true)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName("remove")
					.setDescription("add an autoresponse")
					.addStringOption((option) =>
						option
							.setName("trigger")
							.setDescription(
								"Which trigger do you want to remove"
							)
							.setRequired(true)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand.setName("list").setDescription("add an autoresponse")
			),

		async execute(interaction) {
			let subcommand = interaction.options.getSubcommand();
			if (interaction.guild === null) {
				interaction.reply({
					embeds: [
						MGEmbed(MGStatus.Error).setTitle(
							"This command cannot be used in DMs!"
						),
					],
				});
			}
			let data = MGFirebase.getData(`guild/${interaction.guild?.id}`);
			switch (subcommand) {
				case "add":
					await addAutoresponse(interaction, data);
					return;
				case "remove":
					await removeAutoresponse(interaction, data);
					return;
				case "list":
					await listAutoresponse(interaction, data);
					return;
			}
		},
	}
);

export default autoresponse;
