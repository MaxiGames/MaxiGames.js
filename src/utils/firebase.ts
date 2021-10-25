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

import { Client } from "discord.js";
import * as admin from "firebase-admin";
import moan from "../lib/moan";
import MGS from "../lib/statuses";
import { MGEmbed } from "../lib/flavoured";
import MGStatus from "../lib/statuses";
import { initialGuild, initialUser } from "../types/firebase";

export class FirebaseManager {
	db: admin.database.Database | undefined = undefined;

	public async init(client: Client) {
		this.db = admin.database();
		await this.initData();
		await this.announcement(client);
	}

	public async setData(ref: string, data: any): Promise<void> {
		await this.db?.ref(ref).set(data);
	}

	public async getData(ref: string): Promise<any> {
		let data = await this.db?.ref(ref).get();
		if (ref.split(`/`)[0] === "user" && data?.exists() === false) {
			await this.db?.ref(`user/${ref.split("/")[1]}`).set(initialUser);
			return initialUser;
		}
		if (ref.split(`/`)[0] === "guild" && data?.exists() === false) {
			await this.db?.ref(`guild/${ref.split("/")[1]}`).set(initialGuild);
			return initialGuild;
		}

		{
			const stack = new Error().stack;
			if (stack !== undefined) {
				const caller = stack
					.split("\n")
					.map((x) => x.trim())
					.map((x) => [
						/\(.+\)/.exec(x),
						/at (.+) \(/.exec(x),
						/\(.+:(?:.+:)?([0-9]+):[0-9]+\)/.exec(x),
					])
					.filter(
						(x) => x[0] !== null && x[1] !== null && x[2] !== null
					)
					.map((x) => [
						x[0]![0].slice(1).split(":")[0],
						x[1]![1],
						x[2]![1],
					])[0];

				moan(
					MGS.Info,
					`getData was called in ${caller[1]}, in file ${caller[0]}`
				);
			}
		}

		return data?.val();
	}

	private async initData() {
		let usr = await this.db?.ref(`/user`).get();
		let data = usr?.val();
		for (let i in data) {
			if (!data[i]["cooldowns"]["trivia"])
				data[i]["cooldowns"]["trivia"] = initialUser.cooldowns.trivia;
		}
		for (let i in data) {
			if (!data[i]["minigames"]["trivia"])
				data[i]["minigames"]["trivia"] = initialUser.minigames.trivia;
		}
		for (let i in data) {
			if (!data[i]["minigames"]["guessthecolour"])
				data[i]["minigames"]["guessthecolour"] =
					initialUser.minigames.guessthecolour;
		}
		await this.db?.ref(`/user`).set(data);
		moan(MGS.Success, "initialised data for nothing");
	}

	private async announcement(client: Client) {
		if (this.db === null || client === null) {
			return;
		}
		this.db?.ref("/announcement").on("value", (snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val() as string;
				if (data === "") {
					return;
				}
				client.guilds.cache.forEach((guild) => {
					guild.systemChannel?.send({
						embeds: [
							MGEmbed(MGStatus.Success)
								.setTitle(
									"Important announcement by MaxiGames developers to all severs"
								)
								.setDescription(data),
						],
					});
				});
				this.db?.ref("/announcement").set("");
			}
		});
	}
}

export const MGFirebase = new FirebaseManager();
