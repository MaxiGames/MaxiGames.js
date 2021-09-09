import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { clientIdBeta, guildIdBeta, tokenIdBeta } from "../config.json";
import MyCommand from "../src/types/command";

import current from "../src/commands/general/current";
import hallo from "../src/commands/general/hallo";
import ping from "../src/commands/general/ping";

const commands: MyCommand[] = [current, hallo, ping];

const rest = new REST({ version: "9" }).setToken(tokenIdBeta);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientIdBeta, guildIdBeta), {
      body: commands.map((v) => v.data.toJSON!()),
    });

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
