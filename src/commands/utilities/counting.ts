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

/*
 * File: src/commands/cases/counting.ts
 * Description: Handles command for converting text to another case
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import type MGCommand from '../../types/command';
import { MGEmbed } from '../../lib/flavoured';
import MGStatus from '../../lib/statuses';
import { MGFirebase } from '../../utils/firebase';
import { Permissions, CommandInteraction, Guild } from 'discord.js';
import withChecks from '../../lib/withs';
import { userPermsTest } from '../../lib/permscheck';
import cooldownTest from '../../lib/cooldown';

const counting: MGCommand = withChecks(
	[cooldownTest(10), userPermsTest(Permissions.FLAGS.ADMINISTRATOR)],
	{
		data: new SlashCommandBuilder()
			.setName('counting')
			.setDescription("configure your server' counting games!")
			.addSubcommand((subcommand) =>
				subcommand
					.setName('addchannel')
					.setDescription('register a channel as a counting channel')
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('channel to be added')
							.setRequired(true)
					)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName('removechannel')
					.setDescription(
						'unregister a channel as a counting channel'
					)
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('channel you want to unregister')
							.setRequired(true)
					)
			),

		// execute command
		async execute(interaction) {
			const subcommand = interaction.options.getSubcommand();
			const guild = interaction.guild;
			if (guild === null) {
				interaction.reply({
					embeds: [
						MGEmbed(MGStatus.Error).setTitle(
							'This command is not usable in a channel!'
						),
					],
				});
				return;
			}
			const guildData = await MGFirebase.getData(`guild/${guild.id}`);
			if (subcommand === 'addchannel') {
				addChannel(interaction, guild, guildData);
			} else if (subcommand === 'removechannel') {
				removeChannel(interaction, guild, guildData);
			}
		},
	}
);

async function addChannel(
	interaction: CommandInteraction,
	guild: Guild,
	guildData: any
) {
	const channel = interaction.options.getChannel('channel');

	if (channel === null) {
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Error).setTitle('Unable to find channel!'),
			],
		});
		return;
	}

	if (guildData['countingChannels'] === 0) {
		guildData['countingChannels'] = {};
	}
	if (guildData['countingChannels'][channel.id] === undefined) {
		guildData['countingChannels'][channel.id] = { count: 0, id: 0 };
		await MGFirebase.setData(`guild/${guild.id}`, guildData).then(
			async () => {
				await interaction.reply({
					embeds: [
						MGEmbed(MGStatus.Success)
							.setTitle('Success!')
							.setDescription(
								`<#${channel!.id}> is now a counting channel.`
							),
					],
				});
			}
		);
	} else {
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Error)
					.setTitle('That channel is already a counting channel!')
					.setDescription(
						`<#${channel.id}> was already a counting channel.`
					),
			],
		});
	}
}

async function removeChannel(
	interaction: CommandInteraction,
	guild: Guild,
	serverData: any
) {
	const channel = interaction.options.getChannel('channel');

	if (channel === null) {
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Error).setTitle('Unable to find channel!'),
			],
		});
		return;
	}

	if (
		serverData['countingChannels'] === 0 ||
		serverData['countingChannels'][channel.id] === undefined
	) {
		if (channel === null) {
			return;
		}
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Error)
					.setTitle('Error!')
					.setDescription(
						`<#${channel.id}> was not a counting channel in the first place.`
					),
			],
		});
	} else {
		delete serverData['countingChannels'][channel.id];
		await MGFirebase.setData(`guild/${guild.id}`, serverData).then(
			async () => {
				if (channel === null) {
					return;
				}
				await interaction.reply({
					embeds: [
						MGEmbed(MGStatus.Success)
							.setTitle('Success!')
							.setDescription(
								`<#${channel.id}> is no longer a counting channel.`
							),
					],
				});
			}
		);
	}
}

export default counting;
