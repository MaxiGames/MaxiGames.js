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
import {
	DataModel,
	initialData,
	initialGuild,
	initialUser,
} from '../types/firebase';
import moan from '../lib/moan';
import MGS from '../lib/statuses';
import { MGEmbed } from '../lib/flavoured';
import MGStatus from '../lib/statuses';

export class FirebaseManager {
	db: admin.database.Database | undefined = undefined;
	initDone = false;

	async init(client: Client) {
		this.initDone = true;
		this.db = admin.database();
		if (this.db === undefined) {
			throw 'cannot find database';
		}

		// initialise and cast data
		const snapshot = await this.db.ref('/').get();
		if (!snapshot.exists()) {
			moan(MGS.Error, 'No database found!');
			// set it on firebase
			this.db?.ref('/').set(initialData);
			moan(MGS.Success, 'Initialised data on database.');
		} else {
			let data = snapshot.val();
			try {
				// casting data
				data = await this.initData(data);
				await this.initAllServer(client, data);
				const castedData = data as DataModel;
				this.announcement(client);
				moan(MGS.Success, 'Verified data as data model successfully.');
			} catch {
				moan(MGS.Error, 'Attention! Data casting failed!');
				return;
			}
		}
	}

	public async setData(ref: string, data: any): Promise<void> {
		if (!this.initDone) {
			moan(MGS.Warn, 'Init not done.');
			return;
		}

		const referencePoints = ref.split('/');

		// validate reference input
		if (referencePoints.length < 1) {
			return;
		}

		let dataInitial = await this.db?.ref(`/`).get();
		let dataInitial1 = dataInitial?.val();

		let referencedData = dataInitial1;
		try {
			// check validity of reference
			// first check by seeing if it's possible to go into the endpoint of the reference
			for (const i of referencePoints) {
				referencedData = referencedData[i];
			}
			referencedData = data;
		} catch {
			moan(MGS.Error, 'Cannot cast data that has been set.');
			return;
		}

		// set the data on firebase
		if (this.db === undefined) {
			moan(MGS.Error, 'No database!');
			return;
		}

		if (ref !== '/') ref = `/${ref}`;

		try {
			await this.db.ref(ref).set(data);
		} catch {
			moan(MGS.Error, 'Upload failure!');
			return;
		}

		return;
	}

	public async getData(ref: string): Promise<any> {
		if (!this.initDone) {
			moan(MGS.Warn, 'Init not done. Abort getData.');
			return;
		}
		if (ref !== '/') ref = `/${ref}`;
		let data = await this.db?.ref(ref).get();
		if (data === undefined) return data;
		return data.val();
	}

	public async initUser(id: string) {
		let data = await this.getData(`/`);
		// initialise user's properties if its not already is initialised
		if (this.db === undefined) {
			moan(MGS.Error, 'No database!');
			return;
		}

		if (data.user[id] === undefined) {
			data.user[id] = initialUser;
			await this.db.ref(`user/${id}`).set(data.user[id]);
		}
	}

	private async initAllServer(client: Client, data: any) {
		if (client === undefined) {
			setTimeout(() => this.initAllServer, 2000); //recurse if its not defined yet
		} else {
			client.guilds.cache.forEach(async (guild) => {
				if (data['guild'][guild.id] === undefined) {
					data['guild'][guild.id] = initialGuild;
					await this.setData(`guild/${guild.id}`, data);
					moan(
						MGS.Success,
						'Initialised server with name: ' + guild.name
					);
				}
			});
		}
	}

	private async initData(data: any) {
		for (const i in data['guild']) {
			if (!data['guild'][i]['autoresponse']) {
				data['guild'][i]['autoresponse'] = initialGuild.autoresponse;
			}
		}

		for (const i in data['user']) {
			if (data['user'][i]['cooldowns']['autoresponse']) {
				delete data['user'][i]['cooldowns']['autoresponse'];
			}
		}
		await this.db?.ref('/').set(data);
		moan(MGS.Success, 'initialised data for minigames');
		return data;
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
