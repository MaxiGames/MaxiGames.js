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
import MGCommand from '../../types/command';

const lmgtfy: MGCommand = {
	data: new SlashCommandBuilder()
		.setName('lmgtfy')
		.setDescription("For people who don't know how to STFW")
		.addStringOption((option) =>
			option
				.setName('searchstring')
				.setDescription('what to search for')
				.setRequired(true)
		)
		.addUserOption((option) =>
			option
				.setName('whichidiot')
				.setDescription("which idiot didn't know how to STFW?")
				.setRequired(false)
		)
		.addBooleanOption((option) =>
			option
				.setName('bruhmode')
				.setDescription('very bruh')
				.setRequired(false)
		)
		.addBooleanOption((option) =>
			option
				.setName('insult')
				.setDescription(
					'enable the internet explainer; has no effect if bruh mode was activated'
				)
				.setRequired(false)
		),

	async execute(interaction) {
		const searchstr: string =
			interaction.options.getString('searchstring')!;

		// the bruh mode
		if (interaction.options.getBoolean('bruhmode')) {
			const embed = MGEmbed()
				.setTitle(`${searchstr}?`)
				.setDescription('[Find ye answer](https://www.google.com)');

			await interaction.reply({ embeds: [embed] });
		}

		if (searchstr.length > 128) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle('Search string too long...')
						.setDescription(
							'search string should be less than or equal to 128 chars'
						),
				],
				ephemeral: true,
			});
			return;
		}

		const iie = interaction.options.getBoolean('insult') ? '&iie=1' : '';
		const idiot = interaction.options.getUser('whichidiot');
		const prefixstr = idiot ? `<@${idiot.id}>, [f` : '[F';

		await interaction.reply({
			embeds: [
				MGEmbed(MGStatus.Info)
					.setTitle(`${searchstr}?`)
					.setDescription(
						`${prefixstr}ind ye answer](https://lmgtfy.app/?q=${encodeURI(
							searchstr
						)}${iie}).`
					),
			],
		});
	},
};

export default lmgtfy;
