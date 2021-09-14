import * as admin from "firebase-admin";
import DataModel from "../types/firebase";

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

    //! Initalise and cast data!!
    let data = this.db
      .ref(`/`)
      .get()
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.log("no database found :(");
          this.data = { user: { 1234: { money: 0 } } } as DataModel;

          if (this.db === undefined) {
            console.log("No DB AVALIABLE");
            return;
          }
          this.db
            .ref(`/`)
            .set(this.data)
            .then(() => {
              console.log("Initialised Data!!!");
            });
        } else {
          let data = snapshot.val();
          try {
            let castedData = data as DataModel;
            this.data = castedData;
            console.log("Database successfully initialised!");
          } catch {
            throw "Data could not be casted properly during initialisation";
          }
        }
        console.log(this.data);
      });
  }

  public async setData(ref: string, data: any): Promise<string> {
    if (!this.initDone) return "init not done";
    let referencePoints = ref.split("/");
    if (referencePoints.length < 1) {
      return "Need at least 1 slash to work!";
    }
    let referencedData = this.data as any;
    try {
      //valid location?
      let temp = referencedData;
      for (let i in referencePoints) {
        temp = referencedData[i];
      }
      let result = this.setDeepArray(referencePoints, referencedData, data);

      if (result !== "Operation Successful") return "Data couldn't be set";

      let newData: DataModel;
      try {
        newData = referencedData;
      } catch {
        return "Data does not fit the data model";
      }
    } catch {
      return "Data is invalid, therefore unable to be set";
    }

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

  private setDeepArray(referencePoint: string[], loopedArr: any, data: any) {
    try {
      let ref = referencePoint[0];
      let popped = referencePoint.shift();
      if (referencePoint.length === 1) {
        loopedArr[ref] = data;
        return "Operation Successful";
      }
      this.setDeepArray(referencePoint, loopedArr[ref], data);
    } catch {
      return "Invalid Operation";
    }
    return "Something went wrong";
  }
}

export let MGfirebase = new FirebaseManager();
