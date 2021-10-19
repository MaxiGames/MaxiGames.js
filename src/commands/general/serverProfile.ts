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
import { MGEmbed } from '../../lib/flavoured';
import MGStatus from '../../lib/statuses';
import { MGFirebase } from '../../utils/firebase';
import MGCommand from '../../types/command';

const serverProfile: MGCommand = {
	data: new SlashCommandBuilder()
		.setName('serverprofile')
		.setDescription('View your statistics of the server!'),

	async execute(interaction) {
		let guildData = await MGFirebase.getData(
			`guild/${interaction.guild?.id}`
		);
		guildData = guildData['statistics'];
		console.log(guildData);
		if (interaction.guild === null) {
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle('No profile available')
						.setDescription("You can't show profile in the DMs!"),
				],
			});
			return;
		}
		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Info)
					.setTitle(`${interaction.guild?.name} 's profile`)
					.setDescription('View your statistics on the bot!')
					.setThumbnail(interaction.guild.iconURL()!)
					.setFields([
						{
							name: 'Counting: ',
							value: `Highest Count: ${guildData['highestCount']} \n Total Counts: ${guildData['totalCount']}`,
							inline: false,
						},
					]),
			],
		});
	},
};

export default serverProfile;
