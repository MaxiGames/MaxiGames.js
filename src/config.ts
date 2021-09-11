import configProd from "../config-prod.json";
import configDev from "../config-dev.json";
import serviceAccountKey from "../serviceAccountKey.json";
import serviceAccountKey2 from "../serviceAccountKey2.json";

export const config =
  process.env.NODE_ENV == "production" ? configProd : configDev;

export const firebaseConfig =
  process.env.NODE_ENV == "production" ? serviceAccountKey : serviceAccountKey2;
