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

import { Client, Message } from 'discord.js';
import math from 'mathjs';
import { MGEmbed } from '../../lib/flavoured';
import MGStatus from '../../lib/statuses';
import { MGFirebase } from '../../utils/firebase';
import { Interaction, ButtonInteraction } from 'discord.js';

const ticketListener = {
	name: 'messageCreate',
	async execute(msg: Message) {
		if (msg.guild === null) return;
		if (msg.author.bot) return;
		let autoresponse = await MGFirebase.getData(
			`guild/${msg.guild!.id}/autoresponse`
		);
		let response = '';
		for (let i in autoresponse) {
			if (msg.content.includes(i)) {
				response += `${autoresponse[i]} \n`;
			}
		}
		if (response === '') return;
		else {
			msg.channel.send(response);
		}
	},
};

export default ticketListener;
