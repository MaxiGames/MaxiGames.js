"use strict";

const env = require("process").env;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { config } = require("../dist/src/utils/config.js");
const { commands } = require("../dist/src/modules")

for (const cmd of commands) {
	commands.push(cmd.default.data.toJSON());
	console.log(`Registered ${cmd.default.data.name}.`);
}

const rest = new REST({ version: "9" }).setToken(config.tokenId);

// register slash commands
(async () => {
	try {
		if (env.NODE_ENV === "production") {
			console.log("Deploying commands globally.");
			await rest.put(Routes.applicationCommands(config.clientId), {
				body: commandsjson,
			});
		} else {
			console.log("Deploying commands locally onto Beta.");
			await rest.put(
				Routes.applicationGuildCommands(
					config.clientId,
					config.guildId
				),
				{
					body: commandsjson,
				}
			);
		}

		console.log("Successfully registered application commands.");
	} catch (error) {
		console.error(error);
	}
})();
