import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../src/config";
import commands from "../src/commands";

const rest = new REST({ version: "9" }).setToken(config.tokenId);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: Object.values(commands).map((v) => v.data.toJSON!()),
      }
    );

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
