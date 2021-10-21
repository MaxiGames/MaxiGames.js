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

import {
	Interaction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import { changeRating } from '../../commands/minigames/trivia';
import MGStatus from '../../lib/statuses';

const tictactoe = {
	name: 'interactionCreate',
	async execute(interaction: Interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId.endsWith('trivia')) {
			let won = interaction.customId.startsWith(`true`);
			let difficulty =
				interaction.message.embeds[0].description?.split(':');
			let newRating = await changeRating(
				interaction,
				won,
				difficulty![difficulty!.length - 1] as string
			);
			let message = interaction.message;
			let component = (message.components as MessageActionRow[])[0];
			let buttons = component.components as MessageButton[];
			let newComponents = new MessageActionRow();
			let embed = message.embeds[0] as MessageEmbed;
			let count = 0;
			for (let i of buttons) {
				if (i.customId?.startsWith('true')) i.setStyle('SUCCESS');
				else i.setStyle('DANGER');
				if (i.customId === interaction.customId) i.setStyle('PRIMARY');
				i.setCustomId(`DONE ${count}`);
				i.setDisabled(true);
				newComponents.addComponents(i);
				count++;
			}
			embed.setFooter(`You are ${won ? 'CORRECT' : 'WRONG'}!`);
			embed.setColor(won ? 'GREEN' : 'RED');
			embed.addField(
				'Rating Change',
				`${newRating > 0 ? '+' + newRating : newRating}`
			);
			interaction.update({
				embeds: [embed],
				components: [newComponents],
			});
		}
	},
};

export default tictactoe;
