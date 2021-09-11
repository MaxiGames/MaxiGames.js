import configProd from "../config-prod.json";
import configDev from "../config-dev.json";
import serviceAccountKeyProd from "../serviceAccountKey-prod.json";
import serviceAccountKeyDev from "../serviceAccountKey-dev.json";

export const config =
  process.env.NODE_ENV == "production" ? configProd : configDev;

export const firebaseConfig =
  process.env.NODE_ENV == "production"
    ? serviceAccountKeyProd
    : serviceAccountKeyDev;
