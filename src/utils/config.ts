import configProd from "../../config-prod.json";
import configDev from "../../config-dev.json";

export const config =
  process.env.NODE_ENV == "production" ? configProd : configDev;

export const firebaseConfig =
  process.env.NODE_ENV == "production"
    ? "https://maxgmaes-39d8e-default-rtdb.firebaseio.com"
    : "https://maxigamesbeta-default-rtdb.firebaseio.com";
