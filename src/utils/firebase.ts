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

import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
import DataModel, { initialData, initialUser } from "../types/firebase";

export class FirebaseManager {
  db: admin.database.Database | undefined = undefined;
  data: DataModel = { user: {} };
  initDone = false;

  init() {
    this.initDone = true;
    this.db = admin.database();
    if (this.db === undefined) {
      throw "cannot find database";
    }

    //! Initialise and cast data!!
    let data = this.db
      .ref(`/`)
      .get()
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.log("no database found :(");
          this.data = initialData as DataModel;

          //set it on firebase
          this.db?.ref(`/`).set(this.data);

          if (this.db === undefined) {
            console.log("No DB AVALIABLE");
            return;
          }
          //if db doesn't exist, get data set on the server
          this.db
            .ref(`/`)
            .set(this.data)
            .then(() => {
              console.log("Initialised Data!!!");
            });
        } else {
          let data = snapshot.val();
          try {
            //casting data
            data = this.initData(data);
            let castedData = data as DataModel;
            this.data = castedData;
            console.log("Database successfully initialised!");
          } catch {
            throw "Data could not be casted properly during initialisation";
          }
        }
      });
  }

  public async setData(ref: string, data: any): Promise<string> {
    if (!this.initDone) return "init not done";
    let referencePoints = ref.split("/");

    //validate reference input
    if (referencePoints.length < 1) {
      return "Need at least 1 slash to work!";
    }

    let referencedData = this.data as any;
    try {
      //valid reference checking, first check by seeing if its possible to go into the endpoint of the reference
      let temp = referencedData;
      for (let i of referencePoints) {
        temp = referencedData[i];
      }

      //then try setting and casting the data into the DataModel
      let result = this.setDeepArray(referencePoints, referencedData, data);

      if (result !== "Operation Successful")
        return `Data couldn't be set : ${result}`;

      let newData: DataModel;
      try {
        newData = referencedData;
      } catch {
        return "Data does not fit the data model";
      }
    } catch {
      return "Data is invalid, therefore unable to be set";
    }

    // set the data on firebase
    ref = "/" + ref;
    if (this.db === undefined) return "No DB";
    await this.db
      .ref(ref)
      .set(data)
      .then(() => {
        return "Success";
      })
      .catch(() => {
        return "Something went wrong while uploading to firebase";
      });
    return "Success";
  }

  public getData(ref: string): any {
    if (!this.initDone) return "init not done";

    //reference validation
    let referencePoints = ref.split("/");
    if (referencePoints.length < 1) {
      return "Need at least 1 slash to work!";
    }

    try {
      //Check if its valid just by seeing if the reference exists
      let temp = this.data as any;
      for (let i of referencePoints) {
        temp = temp[i];
      }

      //return the data if it does
      return temp;
    } catch {
      return "Invalid reference";
    }
  }

  public async initialisePerson(id: string) {
    //initialized someone's money and properties if its not already is initialised
    if (this.data.user[id] === undefined) {
      this.data.user[id] = initialUser;
      if (this.db === undefined) return;
      await this.db.ref(`user/${id}`).set(this.data.user[id]);
    }
  }

  private setDeepArray(referencePoint: string[], loopedArr: any, data: any) {
    //recursive function to use the reference to the data array and set the data at the back of the function
    let result: string;
    try {
      let ref = referencePoint[0];

      if (referencePoint.length === 1) {
        //if there is only one more object left to go into
        loopedArr[ref] = data;
        return "Operation Successful";
      }
      let popped = referencePoint.shift();
      //recurse
      result = this.setDeepArray(referencePoint, loopedArr[ref], data);
    } catch {
      return "Invalid Operation";
    }
    return result;
  }

  private initData(data: any) {
    for (let i in data["user"]) {
      if (!data["user"][i]["cooldowns"]) {
        console.log(`Updating timelyClaims to cooldowns for ${i}`);
        data["user"][i]["timelyClaims"] = data["user"][i]["cooldowns"];
      }
    }
    this.db
      ?.ref(`/`)
      .set(data)
      .then(() => {
        console.log("Timely data initialised for users");
      });
    return data;
  }
}

export let MGfirebase = new FirebaseManager();
