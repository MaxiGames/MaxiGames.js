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

import { Client } from 'discord.js';
import * as admin from 'firebase-admin';
import moan from '../lib/moan';
import MGS from '../lib/statuses';
import { MGEmbed } from '../lib/flavoured';
import MGStatus from '../lib/statuses';
import { initialGuild, initialUser } from '../types/firebase';

export class FirebaseManager {
	db: admin.database.Database | undefined = undefined;

	public async init(client: Client) {
		this.db = admin.database();
		this.initAllServer(client);
		this.initData();
		this.announcement(client);
	}

	public async setData(ref: string, data: any): Promise<void> {
		await this.db?.ref(ref).set(data);
	}

	public async getData(ref: string): Promise<any> {
		let data = await this.db?.ref(ref).get();
		return data?.val();
	}

	public async initUser(id: string) {
		let data = await this.getData(`/user/${id}`);
		// initialise user's properties if its not already is initialised
		if (this.db === undefined) {
			moan(MGS.Error, 'No database!');
			return;
		}

		if (data === undefined) {
			data.user[id] = initialUser;
			await this.db.ref(`user/${id}`).set(data.user[id]);
		}
	}

	private async initAllServer(client: Client) {
		if (client === undefined) {
			setTimeout(() => this.initAllServer, 2000); //recurse if its not defined yet
		} else {
			client.guilds.cache.forEach(async (guild) => {
				let data = await this.getData(`guild/${guild.id}`);
				if (data === undefined) {
					data = initialGuild;
					await this.setData(`guild/${guild.id}`, data);
					moan(
						MGS.Success,
						'Initialised server with name: ' + guild.name
					);
				}
			});
		}
	}

	private async initData() {
		moan(MGS.Success, 'initialised data for nothing');
	}

	private async announcement(client: Client) {
		if (this.db === null || client === null) {
			return;
		}
		this.db?.ref('/announcement').on('value', (snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val() as string;
				if (data === '') {
					return;
				}
				client.guilds.cache.forEach((guild) => {
					guild.systemChannel?.send({
						embeds: [
							MGEmbed(MGStatus.Success)
								.setTitle(
									'Important announcement by MaxiGames developers to all severs'
								)
								.setDescription(data),
						],
					});
				});
				this.db?.ref('/announcement').set('');
			}
		});
	}
}

export const MGFirebase = new FirebaseManager();
