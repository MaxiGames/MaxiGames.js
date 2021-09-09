import configProd from "../config-prod.json";
import configDev from "../config-dev.json";

const config = process.env.NODE_ENV == "production" ? configProd : configDev;

export default config;
