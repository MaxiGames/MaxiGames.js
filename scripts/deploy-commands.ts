import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { clientIdBeta, guildIdBeta, tokenIdBeta } from "../config.json";
import commands from "../src/commands";

const rest = new REST({ version: "9" }).setToken(tokenIdBeta);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientIdBeta, guildIdBeta), {
      body: Object.values(commands).map((v) => v.data.toJSON!()),
    });

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
