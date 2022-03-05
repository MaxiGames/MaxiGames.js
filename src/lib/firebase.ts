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
import { MGEmbed } from "./flavoured";
import MGStatus from "../lib/statuses";
import {
  defaultCountingProtection,
  defaultGuild,
  defaultUser,
} from "../types/firebase";

export class FirebaseManager {
  db: admin.database.Database | undefined = undefined;
  getDataCalls = 0;
  setDataCalls = 0;

  public async init(client: Client) {
    this.db = admin.database();
    await this.initData();
    await this.announcement(client);
    const setDataCalls = this.setDataCalls;
    const getDataCalls = this.getDataCalls;
    setTimeout(async () => {
      await this.monitorDataCalls(setDataCalls, getDataCalls, client);
    }, 300000);
  }

  public async monitorDataCalls(
    setData: number,
    getData: number,
    client: Client
  ) {
    const getDataCall = Math.abs(getData - this.getDataCalls);
    const setDataCall = Math.abs(setData - this.setDataCalls);
    if (getDataCall > 0) {
      moan(
        MGS.Warn,
        `Data has been get ${this.getDataCalls} times, ${getDataCall} times in the past 5 minutes!`
      );
    }
    if (setDataCall > 0) {
      moan(
        MGS.Warn,
        `Data has been set ${this.setDataCalls} times, ${setDataCall} times in the past 5 minutes!`
      );
    }
    if (getDataCall > 100) {
      const ajr = await client.users.fetch("712942935129456671");
      const tux = await client.users.fetch("682592012163481616");
      for (let i = 0; i < 100; i++) {
        await ajr.send({
          embeds: [
            MGEmbed(MGS.Error)
              .setTitle(
                "GetData was called too many times! AlERT! (sent a 100 times)"
              )
              .setDescription(
                `getData was called ${getDataCall} in the past 5 minutes!!`
              ),
          ],
        });
        await tux.send({
          embeds: [
            MGEmbed(MGS.Error)
              .setTitle(
                "GetData was called too many times! AlERT! (sent a 100 times)"
              )
              .setDescription(
                `getData was called ${getDataCall} in the past 5 minutes!!`
              ),
          ],
        });
      }
      moan(
        MGS.Error,
        `GETDATA HAS BEEN CALLED TOO MANY TIMES! A TOTAL OF ${getDataCall} IN THE LAST 5 MINUTES!`
      );
    }
    if (setDataCall > 100) {
      const ajr = await client.users.fetch("712942935129456671");
      const tux = await client.users.fetch("682592012163481616");
      for (let i = 0; i < 100; i++) {
        await ajr.send({
          embeds: [
            MGEmbed(MGS.Error)
              .setTitle(
                "SetData was called too many times! AlERT! (sent a 100 times)"
              )
              .setDescription(
                `setData was called ${setDataCall} in the past 5 minutes!!`
              ),
          ],
        });
        await tux.send({
          embeds: [
            MGEmbed(MGS.Error)
              .setTitle(
                "SetData was called too many times! AlERT! (sent a 100 times)"
              )
              .setDescription(
                `setData was called ${setDataCall} in the past 5 minutes!!`
              ),
          ],
        });
      }
      moan(
        MGS.Error,
        `SETDATA HAS BEEN CALLED TOO MANY TIMES! A TOTAL OF ${setDataCall} IN THE LAST 5 MINUTES!`
      );
    }
    const setDataCalls = this.setDataCalls;
    const getDataCalls = this.getDataCalls;
    setTimeout(async () => {
      await this.monitorDataCalls(setDataCalls, getDataCalls, client);
    }, 300000);
  }

  public async setData(ref: string, data: any): Promise<void> {
    this.setDataCalls++;
    await this.db?.ref(ref).set(data);
  }

  public async justGetData(ref: string): Promise<any> {
    const data = await this.db?.ref(ref).get();
    this.getDataCalls++;

    return data?.val();
  }

  public async getData(ref: string): Promise<any> {
    const data = await this.db?.ref(ref).get();
    if (ref.split("/")[0] === "user" && data?.exists() === false) {
      await this.db?.ref(`user/${ref.split("/")[1]}`).set(defaultUser);
      return defaultUser;
    }
    if (ref.split("/")[0] === "guild" && data?.exists() === false) {
      await this.db?.ref(`guild/${ref.split("/")[1]}`).set(defaultGuild);
      return defaultGuild;
    }
    this.getDataCalls++;

    return data?.val();
  }

  private async initData() {
    const spc = await this.db?.ref("/guild").get();
    const data = spc?.val();
    for (const i in data) {
      for (const j in data[i]["countingChannels"]) {
        if (data[i]["countingChannels"][j]["protect"] === undefined)
          data[i]["countingChannels"][j]["protect"] = defaultCountingProtection;
      }
    }
    await this.db?.ref("/guild").set(data);
    moan(MGS.Success, "defaultised new counting protection data");
  }

  private async announcement(client: Client) {
    if (this.db === null || client === null) {
      return;
    }
    this.db?.ref("/announcement").on("value", async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as string;
        if (data === "") {
          return;
        }
        client.guilds.cache.forEach(async (guild) => {
          try {
            await guild.systemChannel?.send({
              embeds: [
                MGEmbed(MGStatus.Success)
                  .setTitle(
                    "Important announcement by MaxiGames developers to all severs"
                  )
                  .setDescription(data),
              ],
            });
          } catch {
            moan(
              MGS.Error,
              "While announcing, an error ocurred for " + guild.name
            );
          }
        });
        this.db?.ref("/announcement").set("");
      }
    });
  }
}

export const MGFirebase = new FirebaseManager();
