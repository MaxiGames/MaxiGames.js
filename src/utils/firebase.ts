import * as admin from "firebase-admin";
import DataModel from "../types/firebase";

export class FirebaseManager {
  db = admin.database();

  constructor() {
    this.db = admin.database();
    if (this.db === undefined) {
      throw "cannot find database";
    }

    let data = this.db
      .ref(`/`)
      .get()
      .then((snapshot) => {
        if (!snapshot.exists()) {
          throw "no database found :(";
        } else {
          let data = snapshot.val();
          try {
            let castedData = data as DataModel;
            console.log("Database successfully initialised!");
          } catch {
            throw "Data could not be casted properly during initialisation";
          }
        }
      });
  }
}
