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
 * File: src/commands/cases/convercase.ts
 * Description: Handles command for converting text to another case
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import type MGCommand from '../../types/command';
import { MGEmbed } from '../../lib/flavoured';
import MGStatus from '../../lib/statuses';
import {
	camelCase,
	kebabCase as lispCase,
	snakeCase,
	upperCase,
	lowerCase,
} from 'lodash';

const pascalCase = (param: string) =>
	camelCase(param).replace(/\w/, (c) => c.toUpperCase());

const convertCase: MGCommand = {
	// exports (self explanatory)
	data: new SlashCommandBuilder()
		.setName('convertcase')
		.setDescription('Convert some text another case')
		.addStringOption((option) =>
			option
				.setName('conversion')
				.setDescription('Type of conversion you want')
				.setRequired(true)
				.addChoice('camel', 'camel')
				.addChoice('lisp', 'lisp')
				.addChoice('snake', 'snake')
				.addChoice('pascal', 'pascal')
				.addChoice('upper', 'upper')
				.addChoice('lower', 'lower')
		)
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('Text that you want to convert')
				.setRequired(true)
		),

	// execute command
	async execute(interaction) {
		const toConvert = interaction.options.getString('text') ?? '';
		const conversion = interaction.options.getString('conversion') ?? '';

		let f = (a: string) => a;
		switch (conversion) {
			case 'camel':
				f = camelCase;
				break;
			case 'lisp':
				f = lispCase;
				break;
			case 'pascal':
				f = pascalCase;
				break;
			case 'snake':
				f = snakeCase;
				break;
			case 'upper':
				f = upperCase;
				break;
			case 'lower':
				f = lowerCase;
				break;
			default:
				break;
		}

		const embed = MGEmbed(MGStatus.Success)
			.setTitle(`Converted case to: ${conversion}`)
			.setDescription(f(toConvert));

		await interaction.reply({ embeds: [embed] });
	},
};

export default convertCase;
