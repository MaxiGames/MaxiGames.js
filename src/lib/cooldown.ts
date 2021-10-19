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

import { CommandInteraction } from 'discord.js';
import { MGFirebase } from '../utils/firebase';
import { MGEmbed } from './flavoured';
import type MGCmdTest from '../types/checks';
import MGStatus from './statuses';

export default function cooldownTest(
	cooldown: number,
	validator: (interaction: CommandInteraction) => boolean = (_) => false
) {
	const ret: MGCmdTest = {
		async check(command, interaction) {
			MGFirebase.initUser(interaction.user.id);
			const data = await MGFirebase.getData(
				`user/${interaction.user.id}`
			);
			if (data === undefined) {
				return true;
			}

			const lastDate = data['cooldowns'][command.data.name!];
			const date = Math.ceil(new Date().getTime() / 1000);

			return lastDate + cooldown < date || validator(interaction);
		},

		async succ(command, interaction) {
			MGFirebase.initUser(interaction.user.id);
			const data = await MGFirebase.getData(
				`user/${interaction.user.id}`
			);
			if (data === undefined) {
				return;
			}

			data['cooldowns'][command.data.name!] = Math.ceil(
				new Date().getTime() / 1000
			);
			await MGFirebase.setData(`user/${interaction.user.id}`, data);
		},

		async fail(command, interaction) {
			const data = await MGFirebase.getData(
				`user/${interaction.user.id}`
			);
			if (data === undefined) {
				return;
			}

			const lastDate = data['cooldowns'][command.data.name!];
			const date = Math.ceil(new Date().getTime() / 1000);

			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle(
							`The command ${command.data.name} is on cooldown!`
						)
						.setDescription('Be patient :)')
						.addField(
							'Time left',
							`${convertSecondsToDay(lastDate + cooldown - date)}`
						),
				],
			});
		},
	};

	return ret;
}

// utility function to convert seconds to a comprehensible value for user-friendly experience
export function convertSecondsToDay(n: number) {
	const day = Math.floor(n / (24 * 60 * 60));
	n -= day * 24 * 60 * 60;

	const hour = Math.floor(n / (60 * 60));
	n -= hour * 60 * 60;

	const minutes = Math.floor(n / 60);
	n -= minutes * 60;

	const seconds = Math.floor(n);

	const dayStr = day === 0 ? '' : `${day} day(s)`;
	const hourStr = hour === 0 ? '' : `${hour} hour(s)`;
	const minutesStr = minutes === 0 ? '' : `${minutes.toFixed()} minute(s)`;
	const secondStr = seconds === 0 ? '' : `${seconds.toFixed()} second(s)`;

	let message = '';

	if (dayStr !== '') {
		message = `${dayStr}, ${hourStr}, ${minutesStr} and ${secondStr}`;
	} else {
		if (hourStr !== '') {
			message = `${hourStr}, ${minutesStr} and ${secondStr}`;
		} else {
			if (minutesStr !== '') {
				message = `${minutesStr} and ${secondStr}`;
			} else {
				if (secondStr !== '') {
					message = `${secondStr}`;
				}
			}
		}
	}
	return message;
}
