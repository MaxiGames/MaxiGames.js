export {};

const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const {
  clientId,
  clientIdBeta,
  guildId,
  guildIdBeta,
  tokenId,
  tokenIdBeta,
} = require("./config.json");

const commands = [];

// NOTE: The directory "commands" should contain subdirectories to organise js commands.
const commandFiles: Array<[string, Array<string>]> = fs
  .readdirSync("./commands")
  .map((file: string) => path.join("./commands", file))
  .filter((file: string) => fs.lstatSync(file).isDirectory())
  .map((dir: string) => [
    dir,
    fs.readdirSync(dir).filter((file: string) => file.endsWith(".js")),
  ]);

for (const filecol of commandFiles) {
  for (const name of filecol[1]) {
    const command = require(`./${path.join(filecol[0], name)}`);
    console.log(name);
    commands.push(command.data.toJSON());
  }
}
console.log(commands);

const rest = new REST({ version: "9" }).setToken(tokenIdBeta);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(clientIdBeta), {
      body: commands,
    });

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
