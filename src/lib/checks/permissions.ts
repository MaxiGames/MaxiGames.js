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

import { MGEmbed } from "../flavoured";
import type MGCmdTest from "../../types/checks";
import MGStatus from "../statuses";
import {
	GuildMemberRoleManager,
	Permissions,
	PermissionResolvable,
} from "discord.js";

export function userPermsTest(perms: PermissionResolvable) {
	const ret: MGCmdTest = {
		async check(command, interaction) {
			return (interaction.member!.permissions as Permissions).has(perms);
		},

		async succ(command, interaction) {
			return;
		},

		async fail(command, interaction) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle(
							`Insufficent permissions to use ${command.data.name}`
						)
						.setDescription(
							`You need at least the following permissions: ${perms}`
						),
				],
			});
			return;
		},
	};

	return ret;
}

export function userRolesTest(roles: string[]) {
	const ret: MGCmdTest = {
		async check(command, interaction) {
			for (const c of roles) {
				if (
					!(
						interaction.member!.roles as GuildMemberRoleManager
					).cache.some((r) => r.name === c)
				) {
					return false;
				}
			}

			return true;
		},

		async succ(command, interaction) {
			return;
		},

		async fail(command, interaction) {
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle(
							`Insufficent permissions to use ${command.data.name}`
						)
						.setDescription(
							`You need at least the following roles: ${roles}`
						),
				],
			});
			return;
		},
	};

	return ret;
}
