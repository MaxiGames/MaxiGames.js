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
import {
  DataModel,
  initialAdmin,
  initialData,
  initialGuild,
  initialUser,
} from "../types/firebase";
import moan from "../lib/moan";
import MGS from "../lib/statuses";
import { MGEmbed } from "../lib/flavoured";
import MGStatus from "../lib/statuses";

export class FirebaseManager {
  db: admin.database.Database | undefined = undefined;
  data: DataModel = initialData;
  initDone = false;

  async init(client: Client) {
    this.initDone = true;
    this.db = admin.database();
    if (this.db === undefined) {
      throw "cannot find database";
    }

    // initialise and cast data
    const snapshot = await this.db.ref("/").get();
    if (!snapshot.exists()) {
      moan(MGS.Error, "No database found!");
      this.data = initialData as DataModel;

      // set it on firebase
      this.db?.ref("/").set(this.data);

      if (this.db === undefined) {
        moan(MGS.Error, "No database available!");
        return;
      }
      // if db doesn't exist, get data set on the guild
      await this.db.ref("/").set(this.data);
      moan(MGS.Success, "Initialised data.");
    } else {
      let data = snapshot.val();
      try {
        // casting data
        data = await this.initData(data);
        await this.initAllServer(client, data);
        let castedData = data as DataModel;
        this.data = castedData;
        this.announcement(client);
        moan(MGS.Success, "Initialised database.");
      } catch {
        moan(MGS.Error, "Data casting failed!");
        return;
      }
    }
  }

  public async setData(ref: string, data: any): Promise<void> {
    if (!this.initDone) {
      moan(MGS.Warn, "Init not done.");
      return;
    }

    let referencePoints = ref.split("/");

    // validate reference input
    if (referencePoints.length < 1) {
      return;
    }

    let referencedData = this.data as unknown as { [id: string]: any };
    try {
      // check validity of reference
      // first check by seeing if it's possible to go into the endpoint of the reference
      referencedData;
      for (let i of referencePoints) {
        referencedData[i];
      }

      // then try setting and casting the data into the DataModel
      this.setDeepArray(referencePoints, referencedData, data);
    } catch {
      moan(MGS.Error, "");
      return;
    }

    // set the data on firebase
    if (this.db === undefined) {
      moan(MGS.Error, "No database!");
      return;
    }

    try {
      await this.db.ref("/" + ref).set(data);
    } catch {
      moan(MGS.Error, "Upload failure!");
      return;
    }

    return;
  }

  public getData(ref: string): any {
    if (!this.initDone) {
      moan(MGS.Warn, "Init not done.");
      return;
    }

    // reference validation
    let referencePoints = ref.split("/");
    if (referencePoints.length < 1) {
      moan(MGS.Error, "No database!");
      return;
    }

    try {
      // Check if data is valid just by seeing if the reference exists
      let temp = this.data as any;
      for (let i of referencePoints) {
        temp = temp[i];
      }

      return temp;
    } catch {
      moan(MGS.Error, "Invalid reference!");
      return;
    }
  }

  public async initUser(id: string) {
    // initialise user's properties if its not already is initialised
    if (this.db === undefined) {
      moan(MGS.Error, "No database!");
      return;
    }

    if (this.data.user[id] === undefined) {
      this.data.user[id] = initialUser;
      await this.db.ref(`user/${id}`).set(this.data.user[id]);
    }
  }

  private async initAllServer(client: Client, data: any) {
    if (client === undefined) {
      setTimeout(() => this.initAllServer, 2000); //recurse if its not defined yet
    } else {
      client.guilds.cache.forEach(async (guild) => {
        if (data["guild"][guild.id] === undefined) {
          data["guild"][guild.id] = initialGuild;
          await this.setData(`guild/${guild.id}`, data);
          moan(MGS.Success, "Initialised server with name: " + guild.name);
        }
      });
    }
  }

  private setDeepArray(
    referencePoint: string[],
    data: { [id: string]: any },
    toset: unknown
  ) {
    // use the reference to the data array and set the data at the back of the function
    try {
      let ref = referencePoint[0];

      if (referencePoint.length === 1) {
        // if there is only one more object left to go into
        data[ref] = toset;
        return;
      }
      this.setDeepArray(referencePoint.slice(1), data[ref], toset);
    } catch {
      moan(MGS.Error, "Invalid operation!");
      return;
    }
  }

  private async initData(data: any) {
    if (!data["admin"]) {
      data["admin"] = initialAdmin;
    }
    await this.db?.ref(`/`).set(data);
    moan(MGS.Success, "initialised data for stats");
    return data;
  }

  private async announcement(client: Client) {
    if (this.db === null || client === null) return;
    this.db?.ref(`/announcement`).on(`value`, (snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val() as string;
        if (data === "") return;
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
        this.db?.ref(`/announcement`).set("");
      }
    });
  }
}

export let MGFirebase = new FirebaseManager();
